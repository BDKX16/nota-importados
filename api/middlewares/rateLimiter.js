const rateLimit = require("express-rate-limit");

// Rate limiter general para todas las rutas
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por ventana de tiempo
  message: {
    error: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true, // Retorna rate limit info en los headers `RateLimit-*`
  legacyHeaders: false, // Desactiva los headers `X-RateLimit-*`
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
