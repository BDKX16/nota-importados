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

// Rate limiter para endpoints de productos (más permisivo)
const productsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // máximo 30 requests por IP por minuto
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

// Rate limiter para subida de archivos (muy estricto)
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 10, // máximo 10 uploads por IP por 10 minutos
  message: {
    error: "Demasiadas subidas de archivos, intenta de nuevo más tarde.",
    code: "UPLOAD_RATE_LIMIT_EXCEEDED",
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Demasiadas subidas de archivos, intenta de nuevo más tarde.",
      code: "UPLOAD_RATE_LIMIT_EXCEEDED",
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Rate limiter para APIs de administración
const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // máximo 20 requests por IP por 5 minutos
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
  uploadLimiter,
  adminLimiter,
};
