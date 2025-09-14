const express = require("express");
const router = express.Router();
const { checkAuth, checkRole } = require("../middlewares/authentication");
const trackInteraction = require("../middlewares/interaction-tracker");
const {
  Product,
  Discount,
  Category,
  PerfumeProduct,
} = require("../models/products");

// Obtener todos los productos con filtros opcionales
router.get("/", trackInteraction("landing", true), async (req, res) => {
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
});
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

module.exports = router;
