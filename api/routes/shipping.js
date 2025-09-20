const express = require("express");
const axios = require("axios");
const router = express.Router();

// Configuración de Andreani
const ANDREANI_CONFIG = {
  baseUrl: process.env.ANDREANI_BASE_URL || "https://apisqa.andreani.com",
  contrato: process.env.ANDREANI_CONTRATO || "300006708",
  cliente: process.env.ANDREANI_CLIENTE || "CL0000001",
  apiKey: process.env.ANDREANI_API_KEY || null,
  cpOrigen: process.env.ANDREANI_CP_ORIGEN || "1425", // CP de origen (tu ubicación)
};

/**
 * Calcula el peso estimado de los productos
 */
function calculateWeight(items) {
  if (!items || items.length === 0) return 0.5;

  const totalWeight = items.reduce((total, item) => {
    const quantity = item.quantity || 1;
    const weight = 0.3; // 300g por perfume estimado
    return total + weight * quantity;
  }, 0);

  return Math.round(totalWeight * 1.1 * 100) / 100; // +10% packaging
}

/**
 * Calcula las dimensiones estimadas del paquete
 */
function calculateDimensions(items) {
  if (!items || items.length === 0) {
    return { largoCm: 15, anchoCm: 10, altoCm: 8 };
  }

  const itemCount = items.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  if (itemCount === 1) {
    return { largoCm: 15, anchoCm: 10, altoCm: 8 };
  } else if (itemCount <= 3) {
    return { largoCm: 20, anchoCm: 15, altoCm: 10 };
  } else if (itemCount <= 6) {
    return { largoCm: 30, anchoCm: 20, altoCm: 15 };
  } else {
    return { largoCm: 40, anchoCm: 25, altoCm: 20 };
  }
}

/**
 * Calcula el valor declarado del paquete
 */
function calculateDeclaredValue(items) {
  return items.reduce((total, item) => {
    return total + item.price * (item.quantity || 1);
  }, 0);
}

/**
 * POST /api/shipping/calculate
 * Calcula el costo de envío usando la API de Andreani
 */
router.post("/calculate", async (req, res) => {
  try {
    const { postalCode, items } = req.body;

    // Validaciones
    if (!postalCode || typeof postalCode !== "string") {
      return res.status(400).json({
        success: false,
        error: "INVALID_POSTAL_CODE",
        message: "Código postal es requerido y debe ser válido",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "INVALID_ITEMS",
        message: "Los productos son requeridos para calcular el envío",
      });
    }

    // Validar formato del código postal (Argentina: 4 o más dígitos)
    const cleanPostalCode = postalCode.replace(/\s/g, "");
    if (!/^\d{4,}$/.test(cleanPostalCode)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_POSTAL_CODE_FORMAT",
        message: "El código postal debe tener al menos 4 dígitos",
      });
    }

    // Calcular datos del paquete
    const weight = calculateWeight(items);
    const dimensions = calculateDimensions(items);
    const volume = dimensions.largoCm * dimensions.anchoCm * dimensions.altoCm;
    const declaredValue = calculateDeclaredValue(items);

    // Construir parámetros para Andreani
    const params = new URLSearchParams({
      cpDestino: cleanPostalCode,
      cpOrigen: ANDREANI_CONFIG.cpOrigen,
      contrato: ANDREANI_CONFIG.contrato,
      cliente: ANDREANI_CONFIG.cliente,
      "bultos[0][volumen]": volume.toString(),
      "bultos[0][kilos]": weight.toString(),
      "bultos[0][valorDeclarado]": declaredValue.toString(),
      "bultos[0][altoCm]": dimensions.altoCm.toString(),
      "bultos[0][largoCm]": dimensions.largoCm.toString(),
      "bultos[0][anchoCm]": dimensions.anchoCm.toString(),
    });

    const url = `${ANDREANI_CONFIG.baseUrl}/v1/tarifas?${params.toString()}`;

    // Headers para la petición
    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "Nota-Perfumes/1.0",
    };

    // Agregar API key si está disponible
    if (ANDREANI_CONFIG.apiKey) {
      headers["x-authorization-token"] = ANDREANI_CONFIG.apiKey;
    }

    console.log("Consultando Andreani:", {
      url: url.replace(ANDREANI_CONFIG.apiKey || "", "[HIDDEN]"),
      weight,
      dimensions,
      volume,
      declaredValue,
      postalCode: cleanPostalCode,
    });

    // Realizar petición a Andreani
    const response = await axios.get(url, {
      headers,
      timeout: 10000, // 10 segundos timeout
    });

    // Procesar respuesta
    if (response.data) {
      const cost =
        response.data.tarifaConIva?.total ||
        response.data.tarifaSinIva?.total ||
        0;
      const estimatedDays = response.data.plazoEntrega || "2-4";

      return res.json({
        success: true,
        data: {
          cost: Math.round(cost * 100) / 100, // Redondear a 2 decimales
          estimatedDays,
          postalCode: cleanPostalCode,
          packageInfo: {
            weight,
            dimensions,
            volume,
            declaredValue,
          },
          // Información adicional de Andreani si está disponible
          andreaniResponse: {
            servicio: response.data.servicio || "Estandar",
            plazoEntrega: response.data.plazoEntrega || estimatedDays,
          },
        },
      });
    } else {
      throw new Error("Respuesta vacía de Andreani");
    }
  } catch (error) {
    console.error("Error calculando envío:", error.message);

    let errorCode = "SHIPPING_CALCULATION_ERROR";
    let errorMessage = "Error al calcular el costo de envío";
    let statusCode = 500;

    // Manejar errores específicos de Andreani
    if (error.response) {
      statusCode = error.response.status;

      switch (error.response.status) {
        case 400:
          errorCode = "INVALID_REQUEST";
          errorMessage = "Datos inválidos para el cálculo de envío";
          break;
        case 401:
          errorCode = "AUTHENTICATION_ERROR";
          errorMessage = "Error de autenticación con el servicio de envío";
          break;
        case 404:
          errorCode = "SERVICE_NOT_AVAILABLE";
          errorMessage = "Servicio de envío no disponible para esta ubicación";
          break;
        case 429:
          errorCode = "RATE_LIMIT_EXCEEDED";
          errorMessage =
            "Demasiadas consultas, intenta nuevamente en unos minutos";
          break;
        case 500:
        case 502:
        case 503:
          errorCode = "SERVICE_UNAVAILABLE";
          errorMessage = "Servicio de envío temporalmente no disponible";
          break;
      }
    } else if (error.code === "ECONNABORTED") {
      errorCode = "TIMEOUT_ERROR";
      errorMessage = "Tiempo de espera agotado, intenta nuevamente";
      statusCode = 408;
    } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      errorCode = "CONNECTION_ERROR";
      errorMessage = "No se pudo conectar con el servicio de envío";
      statusCode = 502;
    }

    return res.status(statusCode).json({
      success: false,
      error: errorCode,
      message: errorMessage,
      // En desarrollo, incluir más detalles del error
      ...(process.env.NODE_ENV === "development" && {
        details: {
          originalError: error.message,
          stack: error.stack,
        },
      }),
    });
  }
});

/**
 * GET /api/shipping/zones
 * Obtiene las zonas de envío disponibles (si Andreani lo soporta)
 */
router.get("/zones", async (req, res) => {
  try {
    // Esto es una implementación básica
    // Podrías expandirla para obtener zonas reales de Andreani
    const zones = [
      {
        code: "CABA",
        name: "Ciudad Autónoma de Buenos Aires",
        estimatedDays: "1-2",
      },
      { code: "GBA", name: "Gran Buenos Aires", estimatedDays: "2-3" },
      { code: "PBA", name: "Provincia de Buenos Aires", estimatedDays: "2-4" },
      { code: "RESTO", name: "Resto del país", estimatedDays: "3-7" },
    ];

    res.json({
      success: true,
      data: zones,
    });
  } catch (error) {
    console.error("Error obteniendo zonas:", error);
    res.status(500).json({
      success: false,
      error: "ZONES_ERROR",
      message: "Error al obtener zonas de envío",
    });
  }
});

module.exports = router;
