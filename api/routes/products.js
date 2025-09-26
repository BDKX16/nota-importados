const express = require("express");
const router = express.Router();
const { checkAuth, checkRole } = require("../middlewares/authentication");
const trackInteraction = require("../middlewares/interaction-tracker");
const { validateSearch, validateId } = require("../middlewares/validation");
const {
  Product,
  Discount,
  Category,
  PerfumeProduct,
} = require("../models/products");

// Obtener todos los productos con filtros opcionales
router.get(
  "/",
  validateSearch,
  trackInteraction("landing", true),
  async (req, res) => {
    try {
      const {
        category,
        categoryId,
        type,
        brand,
        minPrice,
        maxPrice,
        search,
        page = 1,
        limit = 20,
        sort = "createdAt",
      } = req.query;

      // Construir filtros - PerfumeProduct no tiene isActive por defecto
      const filters = {};

      if (category) filters.category = category;
      if (categoryId) filters.categoryId = categoryId;
      if (type) filters.type = type;
      if (brand) filters.brand = brand;

      if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = parseFloat(minPrice);
        if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
      }

      // Búsqueda por texto en nombre, descripción o marca
      if (search) {
        filters.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
        ];
      }

      // Configurar paginación
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Configurar ordenamiento
      const sortOptions = {};
      switch (sort) {
        case "price_asc":
          sortOptions.price = 1;
          break;
        case "price_desc":
          sortOptions.price = -1;
          break;
        case "name":
          sortOptions.name = 1;
          break;
        case "newest":
          sortOptions.createdAt = -1;
          break;
        default:
          sortOptions.createdAt = -1;
      }

      const products = await PerfumeProduct.find(filters)
        .populate("category", "name slug")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await PerfumeProduct.countDocuments(filters);
      const totalPages = Math.ceil(total / parseInt(limit));

      return res.status(200).json({
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      });
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener el listado de productos" });
    }
  }
);
// Obtener productos destacados
router.get("/featured", trackInteraction("landing", true), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    // Como PerfumeProduct no tiene campo isFeatured, retornamos productos aleatorios
    const products = await PerfumeProduct.aggregate([
      { $sample: { size: limit } },
    ]);

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error al obtener productos destacados:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener productos destacados" });
  }
});

// Obtener todas las categorías (ruta pública)
router.get(
  "/categories",
  trackInteraction("landing", true),
  async (req, res) => {
    try {
      const categories = await Category.find({ nullDate: null }).sort({
        name: 1,
      });

      res.status(200).json({ categories });
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      res.status(500).json({ error: "Error al obtener categorías" });
    }
  }
);

// Obtener productos por categoría
router.get(
  "/category/:categoryId",
  trackInteraction("landing", true),
  async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 20, sort = "createdAt" } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const sortOptions = {};
      switch (sort) {
        case "price_asc":
          sortOptions.price = 1;
          break;
        case "price_desc":
          sortOptions.price = -1;
          break;
        default:
          sortOptions.createdAt = -1;
      }

      const products = await PerfumeProduct.find({
        categoryId: categoryId,
        isActive: true,
      })
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("category", "name");

      const total = await PerfumeProduct.countDocuments({
        categoryId: categoryId,
        isActive: true,
      });

      res.status(200).json({
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
        },
      });
    } catch (error) {
      console.error("Error al obtener productos por categoría:", error);
      res
        .status(500)
        .json({ error: "Error al obtener productos por categoría" });
    }
  }
);

// Obtener productos por tipo
router.get(
  "/type/:type",
  trackInteraction("landing", true),
  async (req, res) => {
    try {
      const { type } = req.params;
      const { page = 1, limit = 20, sort = "createdAt" } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const sortOptions = {};
      switch (sort) {
        case "price_asc":
          sortOptions.price = 1;
          break;
        case "price_desc":
          sortOptions.price = -1;
          break;
        default:
          sortOptions.createdAt = -1;
      }

      const products = await PerfumeProduct.find({
        type: type,
        isActive: true,
      })
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("category", "name");

      const total = await PerfumeProduct.countDocuments({
        type: type,
        isActive: true,
      });

      res.status(200).json({
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
        },
      });
    } catch (error) {
      console.error("Error al obtener productos por tipo:", error);
      res.status(500).json({ error: "Error al obtener productos por tipo" });
    }
  }
);

// Obtener detalle de un producto específico por slug
router.get("/:slug", trackInteraction("landing", true), async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    })
      .populate("category", "name slug description")
      .populate("brand", "name slug logo description")
      .populate("reviews.userId", "firstName lastName");

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Obtener productos relacionados de la misma categoría
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true,
    })
      .populate("category", "name slug")
      .populate("brand", "name slug logo")
      .limit(4)
      .select("-reviews");

    res.status(200).json({
      product,
      relatedProducts,
    });
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res
      .status(500)
      .json({ error: "Error al obtener la información del producto" });
  }
});

// Validar descuento
router.post("/validate-discount", async (req, res) => {
  try {
    const { code, cartItems } = req.body;

    if (!code) {
      return res.status(400).json({
        valid: false,
        error: "Código de descuento requerido",
      });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        valid: false,
        error: "Carrito vacío o inválido",
      });
    }

    // Buscar el descuento
    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!discount) {
      return res.status(404).json({
        valid: false,
        error: "Código de descuento no válido",
      });
    }

    // Validar si el descuento está vigente
    if (!discount.isValid()) {
      let errorMessage = "Código de descuento expirado";
      const now = new Date();

      if (discount.validFrom > now) {
        errorMessage = "Este descuento aún no está disponible";
      } else if (
        discount.usageLimit &&
        discount.usageCount >= discount.usageLimit
      ) {
        errorMessage = "Este descuento ya alcanzó su límite de uso";
      }

      return res.status(400).json({
        valid: false,
        error: errorMessage,
      });
    }

    // Validar aplicabilidad según el tipo
    let applicableItems = [];
    let totalApplicableAmount = 0;

    for (const item of cartItems) {
      let canApply = false;

      if (discount.appliesTo === "all") {
        canApply = true;
      } else if (discount.appliesTo === "product") {
        canApply = discount.targetIds.some((id) => id.toString() === item.id);
      } else if (discount.appliesTo === "category") {
        // Buscar el producto para obtener su categoría
        const product = await Product.findById(item.id);
        if (product) {
          canApply = discount.targetIds.some(
            (id) => id.toString() === product.category.toString()
          );
        }
      } else if (discount.appliesTo === "brand") {
        // Buscar el producto para obtener su marca
        const product = await Product.findById(item.id);
        if (product) {
          canApply = discount.targetIds.some(
            (id) => id.toString() === product.brand.toString()
          );
        }
      }

      if (canApply) {
        applicableItems.push(item);
        totalApplicableAmount += item.price * item.quantity;
      }
    }

    if (applicableItems.length === 0) {
      return res.status(400).json({
        valid: false,
        error: "Este descuento no aplica a los productos en tu carrito",
      });
    }

    // Validar compra mínima
    if (discount.minPurchase && totalApplicableAmount < discount.minPurchase) {
      return res.status(400).json({
        valid: false,
        error: `Compra mínima requerida: $${discount.minPurchase}`,
      });
    }

    // Calcular descuento
    let discountAmount = 0;
    if (discount.type === "percentage") {
      discountAmount = (totalApplicableAmount * discount.value) / 100;
    } else if (discount.type === "fixed") {
      discountAmount = discount.value;
    }

    // Aplicar límite máximo de descuento
    if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
      discountAmount = discount.maxDiscount;
    }

    // No puede ser mayor al total aplicable
    if (discountAmount > totalApplicableAmount) {
      discountAmount = totalApplicableAmount;
    }

    res.status(200).json({
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        name: discount.name,
        description: discount.description,
        type: discount.type,
        value: discount.value,
        appliesTo: discount.appliesTo,
        discountAmount: Math.round(discountAmount * 100) / 100,
        applicableAmount: totalApplicableAmount,
        applicableItems: applicableItems.map((item) => item.id),
      },
    });
  } catch (error) {
    console.error("Error al validar descuento:", error);
    res.status(500).json({
      valid: false,
      error: "Error al validar el descuento",
    });
  }
});

module.exports = router;
