const rateLimit = require("express-rate-limit");

// Configuración base para rate limiters que maneja proxies de forma segura
const baseConfig = {
  standardHeaders: true, // Retorna rate limit info en los headers `RateLimit-*`
  legacyHeaders: false, // Desactiva los headers `X-RateLimit-*`
  // Configuración más robusta para obtener IP del cliente con nginx
  keyGenerator: (req) => {
    // Prioridad de headers para obtener la IP real del cliente
    const forwarded = req.headers["x-forwarded-for"];
    const realIp = req.headers["x-real-ip"];
    const cfConnectingIp = req.headers["cf-connecting-ip"]; // Cloudflare

    // Si hay X-Forwarded-For, tomar la primera IP (cliente real)
    if (forwarded) {
      const ips = forwarded.split(",").map((ip) => ip.trim());
      return ips[0];
    }

    // Si hay X-Real-IP (típico de nginx)
    if (realIp) {
      return realIp;
    }

    // Si hay CF-Connecting-IP (Cloudflare)
    if (cfConnectingIp) {
      return cfConnectingIp;
    }

    // Fallback a req.ip o req.connection.remoteAddress
    return req.ip || req.connection.remoteAddress || "unknown";
  },
  // Configuración adicional para evitar conflictos con nginx
  trustProxy: true, // Permitir que el rate limiter maneje proxies
};

// Rate limiter general para todas las rutas
const generalLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por ventana de tiempo
  message: {
    error: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  handler: (req, res) => {
    res.status(429).json({
      error:
        "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Rate limiter estricto para endpoints de autenticación
const authLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por IP por ventana
  message: {
    error: "Demasiados intentos de autenticación, intenta de nuevo más tarde.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
  skipSuccessfulRequests: true, // No cuenta requests exitosos
  handler: (req, res) => {
    res.status(429).json({
      error:
        "Demasiados intentos de autenticación, intenta de nuevo más tarde.",
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Rate limiter para endpoints de productos y contenido público (más permisivo)
const productsLimiter = rateLimit({
  ...baseConfig,
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 50, // máximo 50 requests por IP por minuto (aumentado para usuarios)
  message: {
    error: "Demasiadas solicitudes de productos, intenta de nuevo más tarde.",
    code: "PRODUCTS_RATE_LIMIT_EXCEEDED",
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Demasiadas solicitudes de productos, intenta de nuevo más tarde.",
      code: "PRODUCTS_RATE_LIMIT_EXCEEDED",
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Rate limiter específico para usuarios autenticados y no autenticados en GET
const userGetLimiter = rateLimit({
  ...baseConfig,
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 100, // máximo 100 GET requests por IP por 5 minutos
  message: {
    error: "Demasiadas consultas desde esta IP, intenta de nuevo más tarde.",
    code: "USER_GET_RATE_LIMIT_EXCEEDED",
  },
  skip: (req) => {
    // Solo aplicar rate limit a métodos GET
    return req.method !== "GET";
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Demasiadas consultas desde esta IP, intenta de nuevo más tarde.",
      code: "USER_GET_RATE_LIMIT_EXCEEDED",
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Rate limiter para APIs de administración (más permisivo para uploads de admin)
const adminLimiter = rateLimit({
  ...baseConfig,
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 50, // máximo 50 requests por IP por 5 minutos (aumentado para admin)
  message: {
    error:
      "Demasiadas solicitudes de administración, intenta de nuevo más tarde.",
    code: "ADMIN_RATE_LIMIT_EXCEEDED",
  },
  handler: (req, res) => {
    res.status(429).json({
      error:
        "Demasiadas solicitudes de administración, intenta de nuevo más tarde.",
      code: "ADMIN_RATE_LIMIT_EXCEEDED",
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  productsLimiter,
  userGetLimiter,
  adminLimiter,
};
