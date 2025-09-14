const helmet = require("helmet");
const compression = require("compression");

// Middleware para headers de cache en imágenes
const cacheImages = (req, res, next) => {
  // Cache de imágenes por 7 días
  res.set({
    "Cache-Control": "public, max-age=604800, immutable",
    ETag: true,
  });
  next();
};

// Middleware para headers de cache en datos de productos
const cacheProducts = (req, res, next) => {
  // Cache de productos por 5 minutos
  res.set({
    "Cache-Control": "public, max-age=300",
    ETag: true,
  });
  next();
};

// Middleware para headers de cache en datos que cambian poco
const cacheStaticData = (req, res, next) => {
  // Cache de datos estáticos por 1 hora
  res.set({
    "Cache-Control": "public, max-age=3600",
    ETag: true,
  });
  next();
};

// Middleware para no cachear datos dinámicos/privados
const noCache = (req, res, next) => {
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
  next();
};

// Configuración de helmet para seguridad
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Middleware de compresión
const compressionMiddleware = compression({
  level: 6, // Nivel de compresión (1-9)
  threshold: 1024, // Solo comprimir archivos > 1KB
  filter: (req, res) => {
    // No comprimir si ya está comprimido
    if (req.headers["x-no-compression"]) {
      return false;
    }
    // Usar el filtro por defecto de compression
    return compression.filter(req, res);
  },
});

// Middleware para validar tamaño de archivos en uploads
const validateFileSize = (maxSize = 5 * 1024 * 1024) => {
  // 5MB por defecto
  return (req, res, next) => {
    if (
      req.headers["content-length"] &&
      parseInt(req.headers["content-length"]) > maxSize
    ) {
      return res.status(413).json({
        error: "Archivo demasiado grande",
        maxSize: `${maxSize / (1024 * 1024)}MB`,
      });
    }
    next();
  };
};

// Middleware para validar tipos de archivo permitidos
const validateFileTypes = (
  allowedTypes = ["image/jpeg", "image/png", "image/webp"]
) => {
  return (req, res, next) => {
    if (req.file || req.files) {
      const files = req.files || [req.file];

      for (let file of files) {
        if (file && !allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            error: "Tipo de archivo no permitido",
            allowedTypes: allowedTypes,
            receivedType: file.mimetype,
          });
        }
      }
    }
    next();
  };
};

module.exports = {
  cacheImages,
  cacheProducts,
  cacheStaticData,
  noCache,
  securityHeaders,
  compressionMiddleware,
  validateFileSize,
  validateFileTypes,
};
