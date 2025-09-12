const express = require("express");
const router = express.Router();
const { checkAuth, checkRole } = require("../middlewares/authentication");
const trackInteraction = require("../middlewares/interaction-tracker");
const { Product, Discount } = require("../models/products");

// Obtener todos los productos con filtros opcionales
router.get("/", trackInteraction("landing", true), async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      featured,
      onSale,
      search,
      page = 1,
      limit = 20,
      sort = "createdAt",
    } = req.query;

    // Construir filtros
    const filters = { isActive: true };

    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    if (featured === "true") filters.isFeatured = true;
    if (onSale === "true") filters.isOnSale = true;

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    // Búsqueda por texto si se proporciona
    if (search) {
      filters.$text = { $search: search };
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

    const products = await Product.find(filters)
      .populate("category", "name slug")
      .populate("brand", "name slug logo")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-reviews");

    const total = await Product.countDocuments(filters);
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
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate("category", "name slug")
      .populate("brand", "name slug logo")
      .limit(limit)
      .select("-reviews");

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error al obtener productos destacados:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener productos destacados" });
  }
});

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
