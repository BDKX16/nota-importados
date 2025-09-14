const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { checkAuth, checkRole } = require("../middlewares/authentication");
const { validateProduct, validateId, validateWithJoi, productSchema, sanitizeFileUpload } = require("../middlewares/validation");
const {
  Beer,
  Discount,
  Product,
  PerfumeProduct,
  Category,
} = require("../models/products");

/**
 * RUTAS PARA LA GESTIÓN DE DESCUENTOS/PROMOCIONES
 */

// Obtener todos los descuentos
router.get(
  "/discounts",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const discounts = await Discount.find({ nullDate: null });
      res.status(200).json({ discounts });
    } catch (error) {
      console.error("Error al obtener descuentos:", error);
      res
        .status(500)
        .json({ error: "Error al obtener el listado de descuentos" });
    }
  }
);

// Obtener un descuento por ID
router.get(
  "/discounts/:id",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const discount = await Discount.findOne({
        id: req.params.id,
        nullDate: null,
      });

      if (!discount) {
        return res.status(404).json({ error: "Descuento no encontrado" });
      }

      res.status(200).json({ discount });
    } catch (error) {
      console.error("Error al obtener el descuento:", error);
      res
        .status(500)
        .json({ error: "Error al obtener la información del descuento" });
    }
  }
);

// Crear un nuevo descuento
router.post(
  "/discounts",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const {
        id,
        code,
        type,
        value,
        minPurchase,
        validFrom,
        validUntil,
        description,
        appliesTo,
        active,
      } = req.body;

      // Verificar si ya existe
      const existingDiscount = await Discount.findOne({
        $or: [{ id }, { code }],
        nullDate: null,
      });

      if (existingDiscount) {
        return res
          .status(400)
          .json({ error: "Ya existe un descuento con ese ID o código" });
      }

      const discount = new Discount({
        id,
        code,
        type,
        value,
        minPurchase,
        validFrom,
        validUntil,
        description,
        appliesTo,
        active: active !== undefined ? active : true,
        usageCount: 0,
      });

      await discount.save();
      res.status(201).json({ message: "Descuento creado con éxito", discount });
    } catch (error) {
      console.error("Error al crear descuento:", error);
      res.status(500).json({ error: "Error al crear el descuento" });
    }
  }
);

// Actualizar un descuento
router.put(
  "/discounts/:id",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const {
        code,
        type,
        value,
        minPurchase,
        validFrom,
        validUntil,
        description,
        appliesTo,
        active,
      } = req.body;

      const discount = await Discount.findOne({
        id: req.params.id,
        nullDate: null,
      });

      if (!discount) {
        return res.status(404).json({ error: "Descuento no encontrado" });
      }

      // Verificar si ya existe otro descuento con el mismo código
      if (code && code !== discount.code) {
        const existingDiscount = await Discount.findOne({
          code,
          nullDate: null,
        });
        if (existingDiscount) {
          return res
            .status(400)
            .json({ error: "Ya existe otro descuento con ese código" });
        }
      }

      // Actualizar campos
      discount.code = code || discount.code;
      discount.type = type || discount.type;
      discount.value = value !== undefined ? value : discount.value;
      discount.minPurchase =
        minPurchase !== undefined ? minPurchase : discount.minPurchase;
      discount.validFrom = validFrom || discount.validFrom;
      discount.validUntil = validUntil || discount.validUntil;
      discount.description = description || discount.description;
      discount.appliesTo = appliesTo || discount.appliesTo;
      discount.active = active !== undefined ? active : discount.active;

      await discount.save();
      res
        .status(200)
        .json({ message: "Descuento actualizado con éxito", discount });
    } catch (error) {
      console.error("Error al actualizar descuento:", error);
      res.status(500).json({ error: "Error al actualizar el descuento" });
    }
  }
);

// Eliminar un descuento (soft delete)
router.delete(
  "/discounts/:id",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const discount = await Discount.findOne({
        id: req.params.id,
        nullDate: null,
      });

      if (!discount) {
        return res.status(404).json({ error: "Descuento no encontrado" });
      }

      discount.nullDate = new Date();
      await discount.save();

      res.status(200).json({ message: "Descuento eliminado con éxito" });
    } catch (error) {
      console.error("Error al eliminar descuento:", error);
      res.status(500).json({ error: "Error al eliminar el descuento" });
    }
  }
);

// Activar o desactivar un descuento
router.patch(
  "/discounts/:id/toggle",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const discount = await Discount.findOne({
        id: req.params.id,
        nullDate: null,
      });

      if (!discount) {
        return res.status(404).json({ error: "Descuento no encontrado" });
      }

      discount.active = !discount.active;
      await discount.save();

      res.status(200).json({
        message: discount.active
          ? "Descuento activado"
          : "Descuento desactivado",
        active: discount.active,
      });
    } catch (error) {
      console.error("Error al cambiar el estado del descuento:", error);
      res
        .status(500)
        .json({ error: "Error al cambiar el estado del descuento" });
    }
  }
);

// Obtener estadísticas de conversión (basadas en interacciones de usuarios)
router.get(
  "/conversion-stats",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      // Establecer período de tiempo para la consulta
      const queryStartDate = startDate
        ? new Date(startDate)
        : new Date(new Date().setDate(new Date().getDate() - 30));
      const queryEndDate = endDate ? new Date(endDate) : new Date();

      // Traer el modelo de Interaction
      const Interaction = require("../models/interaction");

      // Contar las interacciones de tipo landing
      const landingInteractions = await Interaction.countDocuments({
        type: "landing",
        state: true,
        createdAt: { $gte: queryStartDate, $lte: queryEndDate },
      });

      // Contar las interacciones de tipo checkout
      const checkoutInteractions = await Interaction.countDocuments({
        type: "checkout",
        state: true,
        createdAt: { $gte: queryStartDate, $lte: queryEndDate },
      });

      // Calcular tasa de conversión
      const conversionRate =
        landingInteractions > 0
          ? ((checkoutInteractions / landingInteractions) * 100).toFixed(2)
          : 0;

      // Obtener las interacciones por producto (videoId)
      const productInteractions = await Interaction.aggregate([
        {
          $match: {
            videoId: { $ne: null },
            createdAt: { $gte: queryStartDate, $lte: queryEndDate },
          },
        },
        {
          $group: {
            _id: "$videoId",
            visits: { $sum: { $cond: [{ $eq: ["$type", "landing"] }, 1, 0] } },
            checkouts: {
              $sum: { $cond: [{ $eq: ["$type", "checkout"] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 1,
            visits: 1,
            checkouts: 1,
            conversionRate: {
              $cond: [
                { $gt: ["$visits", 0] },
                { $multiply: [{ $divide: ["$checkouts", "$visits"] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { visits: -1 } },
        { $limit: 10 },
      ]);

      // Obtener datos por día
      const dailyStats = await Interaction.aggregate([
        {
          $match: {
            createdAt: { $gte: queryStartDate, $lte: queryEndDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            visits: { $sum: { $cond: [{ $eq: ["$type", "landing"] }, 1, 0] } },
            checkouts: {
              $sum: { $cond: [{ $eq: ["$type", "checkout"] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            date: "$_id",
            visits: 1,
            checkouts: 1,
            conversionRate: {
              $cond: [
                { $gt: ["$visits", 0] },
                { $multiply: [{ $divide: ["$checkouts", "$visits"] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { date: 1 } },
      ]);

      res.status(200).json({
        stats: {
          period: {
            from: queryStartDate,
            to: queryEndDate,
          },
          overall: {
            totalVisits: landingInteractions,
            totalCheckouts: checkoutInteractions,
            conversionRate,
          },
          productStats: productInteractions,
          dailyStats,
        },
      });
    } catch (error) {
      console.error("Error al obtener estadísticas de conversión:", error);
      res
        .status(500)
        .json({ error: "Error al obtener estadísticas de conversión" });
    }
  }
);

/**
 * RUTAS PARA LA GESTIÓN DE CATEGORÍAS
 */

// Obtener todas las categorías
router.get(
  "/categories",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const categories = await Category.find({ nullDate: null }).sort({
        sortOrder: 1,
        name: 1,
      });
      res.status(200).json({ categories });
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      res
        .status(500)
        .json({ error: "Error al obtener el listado de categorías" });
    }
  }
);

// Obtener una categoría por ID
router.get(
  "/categories/:id",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const category = await Category.findOne({
        id: req.params.id,
        nullDate: null,
      });

      if (!category) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }

      res.status(200).json({ category });
    } catch (error) {
      console.error("Error al obtener la categoría:", error);
      res
        .status(500)
        .json({ error: "Error al obtener la información de la categoría" });
    }
  }
);

// Crear una nueva categoría
router.post(
  "/categories",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const { id, name, description, icon, color, parentCategory, sortOrder } =
        req.body;

      // Verificar si ya existe
      const existingCategory = await Category.findOne({
        $or: [
          { id },
          {
            slug: name
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
              .trim(),
          },
        ],
      });

      if (existingCategory) {
        return res
          .status(400)
          .json({ error: "Ya existe una categoría con ese nombre o ID" });
      }

      // Generar slug automáticamente
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();

      const category = new Category({
        id: id || `cat-${Date.now()}`,
        name,
        description: description || "",
        slug,
        icon: icon || "",
        color: color || "#8B4513",
        parentCategory: parentCategory || null,
        sortOrder: sortOrder || 0,
      });

      await category.save();
      res.status(201).json({ message: "Categoría creada con éxito", category });
    } catch (error) {
      console.error("Error al crear categoría:", error);
      res.status(500).json({ error: "Error al crear la categoría" });
    }
  }
);

// Actualizar una categoría
router.put(
  "/categories/:id",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const {
        name,
        description,
        icon,
        color,
        parentCategory,
        sortOrder,
        isActive,
      } = req.body;

      const category = await Category.findOne({
        id: req.params.id,
        nullDate: null,
      });

      if (!category) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }

      // Actualizar campos
      if (name) {
        category.name = name;
        category.slug = name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim();
      }

      if (description !== undefined) category.description = description;
      if (icon !== undefined) category.icon = icon;
      if (color !== undefined) category.color = color;
      if (parentCategory !== undefined)
        category.parentCategory = parentCategory;
      if (sortOrder !== undefined) category.sortOrder = sortOrder;
      if (isActive !== undefined) category.isActive = isActive;

      await category.save();
      res
        .status(200)
        .json({ message: "Categoría actualizada con éxito", category });
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      res.status(500).json({ error: "Error al actualizar la categoría" });
    }
  }
);

// Eliminar una categoría (soft delete)
router.delete(
  "/categories/:id",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const category = await Category.findOne({
        id: req.params.id,
        nullDate: null,
      });

      if (!category) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }

      // Verificar si hay productos usando esta categoría
      const productsUsingCategory = await PerfumeProduct.find({
        categories: category._id,
        nullDate: null,
      });

      if (productsUsingCategory.length > 0) {
        return res.status(400).json({
          error: `No se puede eliminar la categoría porque ${productsUsingCategory.length} producto(s) la están usando`,
        });
      }

      category.nullDate = new Date();
      await category.save();

      res.status(200).json({ message: "Categoría eliminada con éxito" });
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      res.status(500).json({ error: "Error al eliminar la categoría" });
    }
  }
);

/**
 * RUTAS PARA LA GESTIÓN DE PRODUCTOS GENERALES
 */

// Obtener todos los productos
router.get("/", checkAuth, checkRole(["admin", "owner"]), async (req, res) => {
  try {
    const products = await PerfumeProduct.find({ nullDate: null });
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener el listado de productos" });
  }
});

// Obtener un producto por ID
router.get(
  "/:id",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const product = await PerfumeProduct.findOne({
        id: req.params.id,
        nullDate: null,
      });

      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      res.status(200).json({ product });
    } catch (error) {
      console.error("Error al obtener el producto:", error);
      res
        .status(500)
        .json({ error: "Error al obtener la información del producto" });
    }
  }
);

// Crear un nuevo producto
router.post("/", checkAuth, checkRole(["admin", "owner"]), async (req, res) => {
  try {
    const {
      id,
      name,
      category,
      categoryId,
      categories,
      categoryNames,
      price,
      images,
      description,
      stock,
      brand,
      volume,
      concentration,
    } = req.body;

    // Verificar si ya existe
    const existingProduct = await PerfumeProduct.findOne({ id });
    if (existingProduct) {
      return res
        .status(400)
        .json({ error: "Ya existe un producto con ese ID" });
    }

    // Procesar categorías - convertir IDs personalizados a ObjectIds
    let processedCategories = [];
    if (categories && Array.isArray(categories) && categories.length > 0) {
      // Buscar las categorías por sus IDs personalizados para obtener los ObjectIds
      const foundCategories = await Category.find({
        id: { $in: categories },
        nullDate: null,
      });

      // Extraer los ObjectIds
      processedCategories = foundCategories.map((cat) => cat._id);
    }

    const product = new PerfumeProduct({
      id,
      name,
      category,
      categoryId,
      categories: processedCategories,
      categoryNames: categoryNames || [],
      price,
      images: images || [],
      description,
      stock,
      brand,
      volume,
      concentration,
    });

    await product.save();
    res.status(201).json({ message: "Producto creado con éxito", product });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
});

// Actualizar un producto
router.put(
  "/:id",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const {
        name,
        category,
        categoryId,
        categories,
        categoryNames,
        price,
        images,
        description,
        stock,
        brand,
        volume,
        concentration,
      } = req.body;

      const product = await PerfumeProduct.findOne({
        id: req.params.id,
        nullDate: null,
      });

      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      // Procesar categorías - convertir IDs personalizados a ObjectIds
      let processedCategories = categories;
      if (
        categories !== undefined &&
        Array.isArray(categories) &&
        categories.length > 0
      ) {
        // Buscar las categorías por sus IDs personalizados para obtener los ObjectIds
        const foundCategories = await Category.find({
          id: { $in: categories },
          nullDate: null,
        });

        // Extraer los ObjectIds
        processedCategories = foundCategories.map((cat) => cat._id);
      } else {
        processedCategories = [];
      }

      // Actualizar campos
      product.name = name || product.name;
      product.category = category || product.category;
      product.categoryId = categoryId || product.categoryId;
      product.categories =
        processedCategories !== undefined
          ? processedCategories
          : product.categories;
      product.categoryNames =
        categoryNames !== undefined ? categoryNames : product.categoryNames;
      product.price = price !== undefined ? price : product.price;
      product.images = images !== undefined ? images : product.images;
      product.description = description || product.description;
      product.stock = stock !== undefined ? stock : product.stock;
      product.brand = brand || product.brand;
      product.volume = volume || product.volume;
      product.concentration = concentration || product.concentration;

      await product.save();
      res
        .status(200)
        .json({ message: "Producto actualizado con éxito", product });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      res.status(500).json({ error: "Error al actualizar el producto" });
    }
  }
);

// Eliminar un producto (soft delete)
router.delete(
  "/:id",
  checkAuth,
  checkRole(["admin", "owner"]),
  async (req, res) => {
    try {
      const product = await PerfumeProduct.findOne({
        id: req.params.id,
        nullDate: null,
      });

      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      product.nullDate = new Date();
      await product.save();

      res.status(200).json({ message: "Producto eliminado con éxito" });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      res.status(500).json({ error: "Error al eliminar el producto" });
    }
  }
);

module.exports = router;
