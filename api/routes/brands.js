const express = require("express");
const router = express.Router();
const { checkAuth, checkRole } = require("../middlewares/authentication");
const trackInteraction = require("../middlewares/interaction-tracker");
const Brand = require("../models/brand");

/**
 * ENDPOINTS PÚBLICOS
 */

// Obtener todas las marcas activas
router.get("/", trackInteraction("landing", true), async (req, res) => {
  try {
    const { category, premium, limit, page = 1 } = req.query;

    const filters = { isActive: true };
    if (premium === "true") filters.isPremium = true;
    if (category) filters.categories = category;

    const skip = (parseInt(page) - 1) * (parseInt(limit) || 20);

    let query = Brand.find(filters).sort({ name: 1 });

    if (limit) {
      query = query.limit(parseInt(limit)).skip(skip);
    }

    const brands = await query.populate("categories", "name slug");
    const total = await Brand.countDocuments(filters);

    return res.status(200).json({
      brands,
      pagination: limit
        ? {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalBrands: total,
          }
        : undefined,
    });
  } catch (error) {
    console.error("Error al obtener marcas:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener el listado de marcas" });
  }
});

// Obtener marcas premium
router.get("/premium", trackInteraction("landing", true), async (req, res) => {
  try {
    const brands = await Brand.getPremiumBrands();

    return res.status(200).json({ brands });
  } catch (error) {
    console.error("Error al obtener marcas premium:", error);
    return res.status(500).json({ error: "Error al obtener marcas premium" });
  }
});

// Obtener detalle de una marca específica
router.get("/:slug", trackInteraction("landing", true), async (req, res) => {
  try {
    const brand = await Brand.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("categories", "name slug description");

    if (!brand) {
      return res.status(404).json({ error: "Marca no encontrada" });
    }

    // Obtener estadísticas de la marca
    const stats = await brand.getStats();

    res.status(200).json({
      brand,
      stats,
    });
  } catch (error) {
    console.error("Error al obtener la marca:", error);
    res
      .status(500)
      .json({ error: "Error al obtener la información de la marca" });
  }
});

// Obtener marcas por categoría
router.get(
  "/category/:categoryId",
  trackInteraction("landing", true),
  async (req, res) => {
    try {
      const brands = await Brand.findByCategory(req.params.categoryId);

      res.status(200).json({ brands });
    } catch (error) {
      console.error("Error al obtener marcas por categoría:", error);
      res
        .status(500)
        .json({ error: "Error al obtener marcas de la categoría" });
    }
  }
);

// Buscar marcas
router.get(
  "/search/:term",
  trackInteraction("landing", true),
  async (req, res) => {
    try {
      const searchTerm = req.params.term;
      const limit = parseInt(req.query.limit) || 20;

      const brands = await Brand.find(
        {
          $text: { $search: searchTerm },
          isActive: true,
        },
        { score: { $meta: "textScore" } }
      )
        .populate("categories", "name slug")
        .sort({ score: { $meta: "textScore" } })
        .limit(limit);

      res.status(200).json({
        brands,
        searchTerm,
        count: brands.length,
      });
    } catch (error) {
      console.error("Error en búsqueda de marcas:", error);
      res.status(500).json({ error: "Error al realizar la búsqueda" });
    }
  }
);

/**
 * ENDPOINTS ADMINISTRATIVOS (requieren autenticación y rol de admin)
 */

// Crear nueva marca
router.post("/", checkAuth, checkRole(["admin"]), async (req, res) => {
  try {
    const brandData = req.body;

    // Validar categorías si se proporcionan
    if (brandData.categories && brandData.categories.length > 0) {
      const Category = require("../models/category");
      const categoriesExist = await Category.find({
        _id: { $in: brandData.categories },
        isActive: true,
      });

      if (categoriesExist.length !== brandData.categories.length) {
        return res
          .status(400)
          .json({ error: "Una o más categorías no son válidas" });
      }
    }

    const brand = new Brand(brandData);
    await brand.save();

    res.status(201).json({
      message: "Marca creada exitosamente",
      brand,
    });
  } catch (error) {
    console.error("Error al crear marca:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "ID o slug ya existe" });
    }
    res.status(500).json({ error: "Error al crear la marca" });
  }
});

// Actualizar marca existente
router.put("/:id", checkAuth, checkRole(["admin"]), async (req, res) => {
  try {
    const brandId = req.params.id;
    const updates = req.body;

    // Validar categorías si se actualizan
    if (updates.categories && updates.categories.length > 0) {
      const Category = require("../models/category");
      const categoriesExist = await Category.find({
        _id: { $in: updates.categories },
        isActive: true,
      });

      if (categoriesExist.length !== updates.categories.length) {
        return res
          .status(400)
          .json({ error: "Una o más categorías no son válidas" });
      }
    }

    const brand = await Brand.findByIdAndUpdate(brandId, updates, {
      new: true,
      runValidators: true,
    }).populate("categories");

    if (!brand) {
      return res.status(404).json({ error: "Marca no encontrada" });
    }

    res.status(200).json({
      message: "Marca actualizada exitosamente",
      brand,
    });
  } catch (error) {
    console.error("Error al actualizar marca:", error);
    res.status(500).json({ error: "Error al actualizar la marca" });
  }
});

// Eliminar marca (soft delete)
router.delete("/:id", checkAuth, checkRole(["admin"]), async (req, res) => {
  try {
    const brandId = req.params.id;

    // Verificar si la marca tiene productos asociados
    const { Product } = require("../models/products");
    const productsCount = await Product.countDocuments({
      brand: brandId,
      isActive: true,
    });

    if (productsCount > 0) {
      return res.status(400).json({
        error: "No se puede eliminar una marca que tiene productos asociados",
      });
    }

    const brand = await Brand.findByIdAndUpdate(
      brandId,
      { isActive: false },
      { new: true }
    );

    if (!brand) {
      return res.status(404).json({ error: "Marca no encontrada" });
    }

    res.status(200).json({ message: "Marca eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar marca:", error);
    res.status(500).json({ error: "Error al eliminar la marca" });
  }
});

// Obtener estadísticas de una marca
router.get("/:id/stats", checkAuth, checkRole(["admin"]), async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ error: "Marca no encontrada" });
    }

    const stats = await brand.getStats();

    res.status(200).json({ stats });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res
      .status(500)
      .json({ error: "Error al obtener estadísticas de la marca" });
  }
});

module.exports = router;
