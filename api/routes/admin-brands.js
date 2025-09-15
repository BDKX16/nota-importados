const express = require("express");
const router = express.Router();
const Brand = require("../models/brand");
const { checkAuth, checkRole } = require("../middlewares/authentication");

// Middleware de autenticación admin para todas las rutas
router.use(checkAuth);
router.use(checkRole(["admin"]));

/**
 * @route   GET /api/admin/brands
 * @desc    Obtener todas las marcas (admin)
 * @access  Admin
 */
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      isActive,
      isPremium,
      category,
      country,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    // Construir filtros
    const filters = {};

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined) {
      filters.isActive = isActive === "true";
    }

    if (isPremium !== undefined) {
      filters.isPremium = isPremium === "true";
    }

    if (country) {
      filters.country = { $regex: country, $options: "i" };
    }

    // Configurar paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Configurar ordenamiento
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Ejecutar consulta
    const brands = await Brand.find(filters)
      .populate("categories", "name slug description")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Contar total de documentos
    const total = await Brand.countDocuments(filters);

    // Estadísticas adicionales
    const stats = {
      total,
      active: await Brand.countDocuments({ ...filters, isActive: true }),
      premium: await Brand.countDocuments({ ...filters, isPremium: true }),
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    };

    res.status(200).json({
      success: true,
      data: {
        brands,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: skip + parseInt(limit) < total,
          hasPrevPage: parseInt(page) > 1,
        },
      },
      message: "Marcas obtenidas exitosamente",
    });
  } catch (error) {
    console.error("Error fetching admin brands:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/admin/brands/:id
 * @desc    Obtener una marca por ID (admin)
 * @access  Admin
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id)
      .populate("categories", "name slug description isActive")
      .lean();

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Marca no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      data: { brand },
      message: "Marca obtenida exitosamente",
    });
  } catch (error) {
    console.error("Error fetching brand by ID:", error);

    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "ID de marca inválido",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/admin/brands
 * @desc    Crear una nueva marca
 * @access  Admin
 */
router.post("/", async (req, res) => {
  try {
    const brandData = req.body;

    // Validaciones básicas
    if (!brandData.name) {
      return res.status(400).json({
        success: false,
        message: "El nombre de la marca es obligatorio",
      });
    }

    // Verificar si ya existe una marca con el mismo nombre
    const existingBrand = await Brand.findOne({
      name: { $regex: `^${brandData.name}$`, $options: "i" },
    });

    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una marca con este nombre",
      });
    }

    // Generar slug si no se proporciona
    if (!brandData.slug) {
      brandData.slug = brandData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }

    // Generar ID si no se proporciona
    if (!brandData.id) {
      brandData.id = brandData.slug;
    }

    // Verificar si ya existe el slug
    const existingSlug = await Brand.findOne({ slug: brandData.slug });
    if (existingSlug) {
      brandData.slug = `${brandData.slug}-${Date.now()}`;
      brandData.id = brandData.slug;
    }

    // Crear nueva marca
    const newBrand = new Brand(brandData);
    const savedBrand = await newBrand.save();

    // Poblar la respuesta
    const populatedBrand = await Brand.findById(savedBrand._id)
      .populate("categories", "name slug description")
      .lean();

    res.status(201).json({
      success: true,
      data: { brand: populatedBrand },
      message: "Marca creada exitosamente",
    });
  } catch (error) {
    console.error("Error creating brand:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Ya existe una marca con este ${field}`,
      });
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * @route   PUT /api/admin/brands/:id
 * @desc    Actualizar una marca
 * @access  Admin
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar si la marca existe
    const existingBrand = await Brand.findById(id);
    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        message: "Marca no encontrada",
      });
    }

    // Si se está actualizando el nombre, verificar que no exista otra marca con el mismo nombre
    if (updateData.name && updateData.name !== existingBrand.name) {
      const duplicateBrand = await Brand.findOne({
        _id: { $ne: id },
        name: { $regex: `^${updateData.name}$`, $options: "i" },
      });

      if (duplicateBrand) {
        return res.status(400).json({
          success: false,
          message: "Ya existe otra marca con este nombre",
        });
      }

      // Actualizar slug si se cambia el nombre
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      updateData.id = updateData.slug;
    }

    // Actualizar la marca
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      {
        new: true,
        runValidators: true,
        lean: false,
      }
    ).populate("categories", "name slug description");

    res.status(200).json({
      success: true,
      data: { brand: updatedBrand },
      message: "Marca actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error updating brand:", error);

    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "ID de marca inválido",
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Ya existe una marca con este ${field}`,
      });
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * @route   DELETE /api/admin/brands/:id
 * @desc    Eliminar una marca
 * @access  Admin
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la marca existe
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Marca no encontrada",
      });
    }

    // Verificar si hay productos asociados a esta marca
    const Product = require("../models/products");
    const productsCount = await Product.countDocuments({ brand: id });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar la marca porque tiene ${productsCount} producto(s) asociado(s)`,
      });
    }

    // Eliminar la marca
    await Brand.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Marca eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error deleting brand:", error);

    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "ID de marca inválido",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * @route   PATCH /api/admin/brands/:id/toggle-status
 * @desc    Cambiar estado activo/inactivo de una marca
 * @access  Admin
 */
router.patch("/:id/toggle-status", async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Marca no encontrada",
      });
    }

    // Cambiar el estado
    brand.isActive = !brand.isActive;
    brand.updatedAt = new Date();

    await brand.save();

    res.status(200).json({
      success: true,
      data: {
        brand: {
          _id: brand._id,
          name: brand.name,
          isActive: brand.isActive,
        },
      },
      message: `Marca ${
        brand.isActive ? "activada" : "desactivada"
      } exitosamente`,
    });
  } catch (error) {
    console.error("Error toggling brand status:", error);

    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "ID de marca inválido",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/admin/brands/stats/overview
 * @desc    Obtener estadísticas generales de marcas
 * @access  Admin
 */
router.get("/stats/overview", async (req, res) => {
  try {
    const totalBrands = await Brand.countDocuments();
    const activeBrands = await Brand.countDocuments({ isActive: true });
    const premiumBrands = await Brand.countDocuments({ isPremium: true });
    const inactiveBrands = totalBrands - activeBrands;

    // Top países
    const topCountries = await Brand.aggregate([
      { $match: { isActive: true, country: { $exists: true, $ne: "" } } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Marcas creadas por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyCreations = await Brand.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total: totalBrands,
          active: activeBrands,
          inactive: inactiveBrands,
          premium: premiumBrands,
          activePecentage:
            totalBrands > 0
              ? Math.round((activeBrands / totalBrands) * 100)
              : 0,
          premiumPercentage:
            totalBrands > 0
              ? Math.round((premiumBrands / totalBrands) * 100)
              : 0,
        },
        topCountries,
        monthlyCreations,
      },
      message: "Estadísticas obtenidas exitosamente",
    });
  } catch (error) {
    console.error("Error fetching brand stats:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
