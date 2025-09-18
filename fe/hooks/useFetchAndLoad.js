import { useState, useEffect, useCallback, useRef } from "react";

const useFetchAndLoad = () => {
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef();

  const callEndpoint = useCallback(async (axiosCall) => {
    if (!axiosCall) return;

    if (axiosCall.controller) {
      controllerRef.current = axiosCall.controller;
    }

    setLoading(true);
    try {
      const result = await axiosCall.call;
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);

      // Solo loggear errores que no sean de cancelación
      if (error.name !== "CanceledError" && error.name !== "AbortError") {
        console.error("Fetch error:", error);

        // Si es un error HTTP con respuesta del servidor, devolver esa respuesta
        if (error.response) {
          return {
            error: true,
            response: error.response,
            data: error.response.data,
            status: error.response.status,
            statusText: error.response.statusText,
          };
        }

        // Si es un error de red o timeout
        if (error.request) {
          return {
            error: true,
            type: "network",
            message: "Error de conexión",
            originalError: error,
          };
        }

        // Otros errores
        return {
          error: true,
          type: "unknown",
          message: error.message || "Error desconocido",
          originalError: error,
        };
      }

      // Para errores de cancelación, devolver null
      return null;
    }
  }, []);

  const cancelEndpoint = useCallback(() => {
    setLoading(false);
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelEndpoint();
    };
  }, [cancelEndpoint]);

  return { loading, callEndpoint };
};

export default useFetchAndLoad;
