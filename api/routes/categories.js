const express = require("express");
const router = express.Router();
const { checkAuth, checkRole } = require("../middlewares/authentication");
const trackInteraction = require("../middlewares/interaction-tracker");
const Category = require("../models/category");

/**
 * ENDPOINTS PÚBLICOS
 */

// Obtener todas las categorías principales
router.get("/", trackInteraction("landing", true), async (req, res) => {
  try {
    const categories = await Category.getMainCategories();

    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener el listado de categorías" });
  }
});

// Obtener categorías con sus subcategorías
router.get("/tree", trackInteraction("landing", true), async (req, res) => {
  try {
    const mainCategories = await Category.find({
      parentCategory: { $exists: false },
      isActive: true,
    })
      .populate("subcategories", "name slug description image")
      .sort({ sortOrder: 1, name: 1 });

    return res.status(200).json({ categories: mainCategories });
  } catch (error) {
    console.error("Error al obtener árbol de categorías:", error);
    return res.status(500).json({ error: "Error al obtener las categorías" });
  }
});

// Obtener detalle de una categoría específica
router.get("/:slug", trackInteraction("landing", true), async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    })
      .populate("parentCategory", "name slug")
      .populate("subcategories", "name slug description image");

    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    // Obtener la ruta completa de la categoría
    const fullPath = await category.getFullPath();

    res.status(200).json({
      category: {
        ...category.toJSON(),
        fullPath,
      },
    });
  } catch (error) {
    console.error("Error al obtener la categoría:", error);
    res
      .status(500)
      .json({ error: "Error al obtener la información de la categoría" });
  }
});

// Obtener subcategorías de una categoría
router.get(
  "/:id/subcategories",
  trackInteraction("landing", true),
  async (req, res) => {
    try {
      const subcategories = await Category.getSubcategories(req.params.id);

      res.status(200).json({ subcategories });
    } catch (error) {
      console.error("Error al obtener subcategorías:", error);
      res.status(500).json({ error: "Error al obtener las subcategorías" });
    }
  }
);

/**
 * ENDPOINTS ADMINISTRATIVOS (requieren autenticación y rol de admin)
 */

// Crear nueva categoría
router.post("/", checkAuth, checkRole(["admin"]), async (req, res) => {
  try {
    const categoryData = req.body;

    // Validar categoría padre si se proporciona
    if (categoryData.parentCategory) {
      const parentCategory = await Category.findById(
        categoryData.parentCategory
      );
      if (!parentCategory) {
        return res.status(400).json({ error: "Categoría padre no válida" });
      }
    }

    const category = new Category(categoryData);
    await category.save();

    // Si tiene categoría padre, agregar esta categoría a las subcategorías del padre
    if (categoryData.parentCategory) {
      await Category.findByIdAndUpdate(categoryData.parentCategory, {
        $push: { subcategories: category._id },
      });
    }

    res.status(201).json({
      message: "Categoría creada exitosamente",
      category,
    });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "ID o slug ya existe" });
    }
    res.status(500).json({ error: "Error al crear la categoría" });
  }
});

// Actualizar categoría existente
router.put("/:id", checkAuth, checkRole(["admin"]), async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updates = req.body;

    // Validar categoría padre si se actualiza
    if (updates.parentCategory) {
      const parentCategory = await Category.findById(updates.parentCategory);
      if (!parentCategory) {
        return res.status(400).json({ error: "Categoría padre no válida" });
      }

      // Verificar que no se esté creando una referencia circular
      if (updates.parentCategory === categoryId) {
        return res
          .status(400)
          .json({ error: "Una categoría no puede ser padre de sí misma" });
      }
    }

    const category = await Category.findByIdAndUpdate(categoryId, updates, {
      new: true,
      runValidators: true,
    }).populate("parentCategory subcategories");

    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.status(200).json({
      message: "Categoría actualizada exitosamente",
      category,
    });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ error: "Error al actualizar la categoría" });
  }
});

// Eliminar categoría (soft delete)
router.delete("/:id", checkAuth, checkRole(["admin"]), async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Verificar si la categoría tiene productos asociados
    const Product = require("../models/products").Product;
    const productsCount = await Product.countDocuments({
      category: categoryId,
      isActive: true,
    });

    if (productsCount > 0) {
      return res.status(400).json({
        error:
          "No se puede eliminar una categoría que tiene productos asociados",
      });
    }

    // Verificar si la categoría tiene subcategorías
    const subcategoriesCount = await Category.countDocuments({
      parentCategory: categoryId,
      isActive: true,
    });

    if (subcategoriesCount > 0) {
      return res.status(400).json({
        error: "No se puede eliminar una categoría que tiene subcategorías",
      });
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    // Remover de la categoría padre si existe
    if (category.parentCategory) {
      await Category.findByIdAndUpdate(category.parentCategory, {
        $pull: { subcategories: categoryId },
      });
    }

    res.status(200).json({ message: "Categoría eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ error: "Error al eliminar la categoría" });
  }
});

// Reordenar categorías
router.patch("/reorder", checkAuth, checkRole(["admin"]), async (req, res) => {
  try {
    const { categories } = req.body; // Array de { id, sortOrder }

    const updatePromises = categories.map(({ id, sortOrder }) =>
      Category.findByIdAndUpdate(id, { sortOrder })
    );

    await Promise.all(updatePromises);

    res
      .status(200)
      .json({ message: "Orden de categorías actualizado exitosamente" });
  } catch (error) {
    console.error("Error al reordenar categorías:", error);
    res.status(500).json({ error: "Error al actualizar el orden" });
  }
});

module.exports = router;
