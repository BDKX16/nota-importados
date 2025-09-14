const { body, param, query, validationResult } = require("express-validator");
const Joi = require("joi");

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Datos de entrada inválidos",
      details: errors.array(),
    });
  }
  next();
};

// Validaciones para productos
const validateProduct = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .escape(), // Sanitizar HTML

  body("description")
    .trim()
    .notEmpty()
    .withMessage("La descripción es requerida")
    .isLength({ min: 10, max: 1000 })
    .withMessage("La descripción debe tener entre 10 y 1000 caracteres")
    .escape(),

  body("price")
    .isFloat({ min: 0.01 })
    .withMessage("El precio debe ser un número positivo")
    .toFloat(),

  body("stock")
    .isInt({ min: 0 })
    .withMessage("El stock debe ser un número entero no negativo")
    .toInt(),

  body("brand")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("La marca no puede tener más de 50 caracteres")
    .escape(),

  body("volume")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("El volumen no puede tener más de 20 caracteres")
    .escape(),

  body("concentration")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("La concentración no puede tener más de 50 caracteres")
    .escape(),

  body("categories")
    .optional()
    .isArray()
    .withMessage("Las categorías deben ser un array"),

  body("categories.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Cada categoría debe tener entre 1 y 50 caracteres")
    .escape(),

  handleValidationErrors,
];

// Validaciones para usuarios
const validateUser = [
  body("email")
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail()
    .escape(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "La contraseña debe contener al menos una minúscula, una mayúscula y un número"
    ),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres")
    .escape(),

  handleValidationErrors,
];

// Validaciones para parámetros de ID
const validateId = [
  param("id").isMongoId().withMessage("ID inválido"),

  handleValidationErrors,
];

// Validaciones para queries de búsqueda
const validateSearch = [
  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("La búsqueda no puede tener más de 100 caracteres")
    .escape(),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La página debe ser un número entero positivo")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe ser un número entre 1 y 100")
    .toInt(),

  query("category")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("La categoría no puede tener más de 50 caracteres")
    .escape(),

  query("brand")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("La marca no puede tener más de 50 caracteres")
    .escape(),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El precio mínimo debe ser un número no negativo")
    .toFloat(),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El precio máximo debe ser un número no negativo")
    .toFloat(),

  handleValidationErrors,
];

// Validación con Joi para objetos complejos
const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().trim(),
  description: Joi.string().min(10).max(1000).required().trim(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
  brand: Joi.string().max(50).optional().trim(),
  volume: Joi.string().max(20).optional().trim(),
  concentration: Joi.string().max(50).optional().trim(),
  categories: Joi.array().items(Joi.string().max(50).trim()).optional(),
  images: Joi.array().items(Joi.string()).optional(),
});

// Middleware de validación con Joi
const validateWithJoi = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        details: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    req.body = value; // Usar los datos validados y sanitizados
    next();
  };
};

// Middleware para sanitizar archivos subidos
const sanitizeFileUpload = (req, res, next) => {
  if (req.file) {
    const file = req.file;

    // Validar tamaño (ya implementado en cacheAndSecurity.js)
    // Validar tipo MIME
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: "Tipo de archivo no permitido",
        allowedTypes: allowedMimeTypes,
      });
    }

    // Validar extensión del archivo
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const path = require("path");
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({
        error: "Extensión de archivo no permitida",
        allowedExtensions: allowedExtensions,
      });
    }
  }

  if (req.files) {
    for (let file of req.files) {
      // Aplicar las mismas validaciones para múltiples archivos
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: "Tipo de archivo no permitido",
          allowedTypes: allowedMimeTypes,
          file: file.originalname,
        });
      }
    }
  }

  next();
};

module.exports = {
  validateProduct,
  validateUser,
  validateId,
  validateSearch,
  validateWithJoi,
  sanitizeFileUpload,
  productSchema,
  handleValidationErrors,
};
