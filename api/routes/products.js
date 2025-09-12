const express = require("express");const express = require("express");

const router = express.Router();const router = express.Router();

const { checkAuth, checkRole } = require("../middlewares/authentication");const { checkAuth, checkRole } = require("../middlewares/authentication");

const trackInteraction = require("../middlewares/interaction-tracker");const trackInteraction = require("../middlewares/interaction-tracker");

const { Product, Discount } = require("../models/products");const { Beer, Subscription, Discount } = require("../models/products");

const Category = require("../models/category");const adminNotificationService = require("../infraestructure/services/adminNotificationService");

const Brand = require("../models/brand");

const adminNotificationService = require("../infraestructure/services/adminNotificationService");/**

 * ENDPOINTS PÚBLICOS PARA TIENDA

/** */

 * ENDPOINTS PÚBLICOS PARA TIENDA

 */// Obtener todas las cervezas disponibles

router.get("/beers", trackInteraction("landing", true), async (req, res) => {

// Obtener todos los productos con filtros opcionales  try {

router.get("/", trackInteraction("landing", true), async (req, res) => {    const beers = await Beer.find({ nullDate: null })

  try {      .select("id name type typeId price image description stock")

    const {      .sort({ name: 1 });

      category,

      brand,    return res.status(200).json({ beers });

      minPrice,  } catch (error) {

      maxPrice,    console.error("Error al obtener cervezas:", error);

      featured,    return res

      onSale,      .status(500)

      search,      .json({ error: "Error al obtener el listado de cervezas" });

      page = 1,  }

      limit = 20,});

      sort = 'createdAt'

    } = req.query;// Obtener detalle de una cerveza específica

router.get(

    // Construir filtros  "/beers/:id",

    const filters = { isActive: true };  trackInteraction("landing", true),

      async (req, res) => {

    if (category) filters.category = category;    try {

    if (brand) filters.brand = brand;      const beer = await Beer.findOne({ id: req.params.id, nullDate: null });

    if (featured === 'true') filters.isFeatured = true;

    if (onSale === 'true') filters.isOnSale = true;      if (!beer) {

            return res.status(404).json({ error: "Cerveza no encontrada" });

    if (minPrice || maxPrice) {      }

      filters.price = {};

      if (minPrice) filters.price.$gte = parseFloat(minPrice);      res.status(200).json({ beer });

      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);    } catch (error) {

    }      console.error("Error al obtener la cerveza:", error);

      res

    // Búsqueda por texto si se proporciona        .status(500)

    if (search) {        .json({ error: "Error al obtener la información de la cerveza" });

      filters.$text = { $search: search };    }

    }  }

);

    // Configurar paginación

    const skip = (parseInt(page) - 1) * parseInt(limit);// Obtener todos los planes de suscripción disponibles

    router.get(

    // Configurar ordenamiento  "/subscriptions",

    const sortOptions = {};  trackInteraction("landing", true),

    switch (sort) {  async (req, res) => {

      case 'price_asc':    try {

        sortOptions.price = 1;      const subscriptions = await Subscription.find({ nullDate: null }).sort({

        break;        liters: 1,

      case 'price_desc':      });

        sortOptions.price = -1;

        break;      res.status(200).json({ subscriptions });

      case 'name':    } catch (error) {

        sortOptions.name = 1;      console.error("Error al obtener planes de suscripción:", error);

        break;      res.status(500).json({

      case 'newest':        error: "Error al obtener el listado de planes de suscripción",

        sortOptions.createdAt = -1;      });

        break;    }

      default:  }

        sortOptions.createdAt = -1;);

    }

// Obtener detalle de un plan de suscripción específico

    const products = await Product.find(filters)router.get(

      .populate('category', 'name slug')  "/subscriptions/:id",

      .populate('brand', 'name slug logo')  trackInteraction("landing", true),

      .sort(sortOptions)  async (req, res) => {

      .skip(skip)    try {

      .limit(parseInt(limit))      const subscription = await Subscription.findOne({

      .select('-reviews'); // Excluir reviews para mejor performance        id: req.params.id,

        nullDate: null,

    const total = await Product.countDocuments(filters);      });

    const totalPages = Math.ceil(total / parseInt(limit));

      if (!subscription) {

    return res.status(200).json({        return res

      products,          .status(404)

      pagination: {          .json({ error: "Plan de suscripción no encontrado" });

        currentPage: parseInt(page),      }

        totalPages,

        totalProducts: total,      res.status(200).json({ subscription });

        hasNextPage: parseInt(page) < totalPages,    } catch (error) {

        hasPrevPage: parseInt(page) > 1      console.error("Error al obtener el plan de suscripción:", error);

      }      res

    });        .status(500)

  } catch (error) {        .json({ error: "Error al obtener la información del plan" });

    console.error("Error al obtener productos:", error);    }

    return res  }

      .status(500));

      .json({ error: "Error al obtener el listado de productos" });

  }// Obtener planes de suscripción destacados (los marcados como populares)

});router.get(

  "/featured-subscriptions",

// Obtener productos destacados  trackInteraction("landing", true),

router.get("/featured", trackInteraction("landing", true), async (req, res) => {  async (req, res) => {

  try {    try {

    const limit = parseInt(req.query.limit) || 10;      const subscriptions = await Subscription.find({

    const products = await Product.getFeatured(limit);        nullDate: null,

        popular: true,

    return res.status(200).json({ products });      });

  } catch (error) {

    console.error("Error al obtener productos destacados:", error);      res.status(200).json({ subscriptions });

    return res    } catch (error) {

      .status(500)      console.error("Error al obtener planes destacados:", error);

      .json({ error: "Error al obtener productos destacados" });      res.status(500).json({ error: "Error al obtener los planes destacados" });

  }    }

});  }

);

// Obtener detalle de un producto específico

router.get("/:slug", trackInteraction("landing", true), async (req, res) => {// Validar código de descuento

  try {router.post("/validate-discount", async (req, res) => {

    const product = await Product.findOne({   try {

      slug: req.params.slug,     const { code, cartItems } = req.body;

      isActive: true 

    })    if (!code) {

    .populate('category', 'name slug description')      return res

    .populate('brand', 'name slug logo description country')        .status(400)

    .populate('reviews.userId', 'firstName lastName');        .json({ error: "Se requiere un código de descuento" });

    }

    if (!product) {

      return res.status(404).json({ error: "Producto no encontrado" });    // Buscar el código

    }    const discount = await Discount.findOne({

      code: code.toUpperCase(),

    // Obtener productos relacionados de la misma categoría      active: true,

    const relatedProducts = await Product.find({      nullDate: null,

      category: product.category._id,      validFrom: { $lte: new Date() },

      _id: { $ne: product._id },      validUntil: { $gte: new Date() },

      isActive: true    });

    })

    .populate('category', 'name slug')    if (!discount) {

    .populate('brand', 'name slug logo')      return res.status(404).json({

    .limit(4)        valid: false,

    .select('-reviews');        message: "Código de descuento inválido o expirado",

      });

    res.status(200).json({     }

      product,

      relatedProducts    // Verificar si hay productos a los que aplicar el descuento

    });    if (cartItems && discount.appliesTo !== "all") {

  } catch (error) {      const hasApplicableItems = cartItems.some(

    console.error("Error al obtener el producto:", error);        (item) => item.type === discount.appliesTo

    res      );

      .status(500)

      .json({ error: "Error al obtener la información del producto" });      if (!hasApplicableItems) {

  }        return res.status(400).json({

});          valid: false,

          message: `Este código solo aplica a ${

// Buscar productos            discount.appliesTo === "beer" ? "cervezas" : "suscripciones"

router.get("/search/:term", trackInteraction("landing", true), async (req, res) => {          }`,

  try {        });

    const searchTerm = req.params.term;      }

    const limit = parseInt(req.query.limit) || 20;    }

    

    const products = await Product.search(searchTerm, { limit });    // Verificar monto mínimo si existe

    if (cartItems && discount.minPurchase) {

    res.status(200).json({       const subtotal = cartItems.reduce((total, item) => {

      products,        return total + item.price * item.quantity;

      searchTerm,      }, 0);

      count: products.length

    });      if (subtotal < discount.minPurchase) {

  } catch (error) {        return res.status(400).json({

    console.error("Error en búsqueda:", error);          valid: false,

    res.status(500).json({ error: "Error al realizar la búsqueda" });          message: `Este código requiere una compra mínima de $${discount.minPurchase}`,

  }        });

});      }

    }

// Obtener productos por categoría

router.get("/category/:slug", trackInteraction("landing", true), async (req, res) => {    // Devolver la información del descuento

  try {    res.status(200).json({

    const category = await Category.findOne({ slug: req.params.slug, isActive: true });      valid: true,

          discount: {

    if (!category) {        id: discount.id,

      return res.status(404).json({ error: "Categoría no encontrada" });        code: discount.code,

    }        type: discount.type,

        value: discount.value,

    const page = parseInt(req.query.page) || 1;        description: discount.description,

    const limit = parseInt(req.query.limit) || 20;        appliesTo: discount.appliesTo,

    const skip = (page - 1) * limit;        minPurchase: discount.minPurchase,

      },

    const products = await Product.getByCategory(category._id, {     });

      limit,   } catch (error) {

      skip,    console.error("Error al validar código de descuento:", error);

      sort: req.query.sort     res.status(500).json({ error: "Error al validar el código de descuento" });

    });  }

});

    const total = await Product.countDocuments({ 

      category: category._id, /**

      isActive: true  * ENDPOINTS PROTEGIDOS (USUARIOS AUTENTICADOS)

    }); */



    res.status(200).json({// Obtener los productos más vendidos (para recomendaciones)

      category,router.get("/top-products", checkAuth, async (req, res) => {

      products,  try {

      pagination: {    // Este endpoint debería integrarse con la lógica de órdenes para determinar

        currentPage: page,    // los productos más vendidos, pero por ahora devolvemos algunos productos fijos

        totalPages: Math.ceil(total / limit),    const topBeers = await Beer.find({ nullDate: null })

        totalProducts: total      .limit(3)

      }      .sort({ stock: -1 }); // Ordenar por stock como aproximación a popularidad

    });

  } catch (error) {    res.status(200).json({ topProducts: topBeers });

    console.error("Error al obtener productos por categoría:", error);  } catch (error) {

    res.status(500).json({ error: "Error al obtener productos de la categoría" });    console.error("Error al obtener productos destacados:", error);

  }    res

});      .status(500)

      .json({ error: "Error al obtener los productos destacados" });

// Obtener productos por marca  }

router.get("/brand/:slug", trackInteraction("landing", true), async (req, res) => {});

  try {

    const brand = await Brand.findOne({ slug: req.params.slug, isActive: true });/**

     * Función para verificar stock bajo y notificar administradores

    if (!brand) { * Se ejecuta después de cada venta

      return res.status(404).json({ error: "Marca no encontrada" }); */

    }async function checkLowStock() {

  try {

    const page = parseInt(req.query.page) || 1;    const beers = await Beer.find({ nullDate: null }).select("id name stock");

    const limit = parseInt(req.query.limit) || 20;    const lowStockBeers = beers.filter((beer) => beer.stock <= 5); // Umbral de stock bajo: 5 unidades

    const skip = (page - 1) * limit;

    if (lowStockBeers.length > 0) {

    const products = await Product.find({       const stockData = lowStockBeers.map((beer) => ({

      brand: brand._id,         name: beer.name,

      isActive: true         stock: beer.stock,

    })        minStock: 5,

    .populate('category', 'name slug')      }));

    .sort({ createdAt: -1 })

    .skip(skip)      await adminNotificationService.notifyLowStock(stockData);

    .limit(limit)      console.log(

    .select('-reviews');        `📦 Notificación de stock bajo enviada para ${lowStockBeers.length} productos`

      );

    const total = await Product.countDocuments({     }

      brand: brand._id,   } catch (error) {

      isActive: true     console.error("❌ Error al verificar stock bajo:", error);

    });  }

}

    res.status(200).json({

      brand,// Exportar la función para uso en otros módulos

      products,module.exports = router;

      pagination: {module.exports.checkLowStock = checkLowStock;

        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total
      }
    });
  } catch (error) {
    console.error("Error al obtener productos por marca:", error);
    res.status(500).json({ error: "Error al obtener productos de la marca" });
  }
});

/**
 * ENDPOINTS PARA GESTIÓN DE RESEÑAS
 */

// Agregar reseña a un producto (requiere autenticación)
router.post("/:id/reviews", checkAuth, async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating debe estar entre 1 y 5" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Verificar si el usuario ya reseñó este producto
    const existingReview = product.reviews.find(
      review => review.userId.toString() === userId
    );

    if (existingReview) {
      return res.status(400).json({ error: "Ya has reseñado este producto" });
    }

    // Agregar nueva reseña
    product.reviews.push({
      userId,
      rating,
      title,
      comment
    });

    await product.save();

    res.status(201).json({ message: "Reseña agregada exitosamente" });
  } catch (error) {
    console.error("Error al agregar reseña:", error);
    res.status(500).json({ error: "Error al agregar la reseña" });
  }
});

/**
 * ENDPOINTS ADMINISTRATIVOS (requieren autenticación y rol de admin)
 */

// Crear nuevo producto
router.post("/", checkAuth, checkRole(["admin"]), async (req, res) => {
  try {
    const productData = req.body;
    
    // Validar que la categoría existe
    const category = await Category.findById(productData.category);
    if (!category) {
      return res.status(400).json({ error: "Categoría no válida" });
    }

    // Validar marca si se proporciona
    if (productData.brand) {
      const brand = await Brand.findById(productData.brand);
      if (!brand) {
        return res.status(400).json({ error: "Marca no válida" });
      }
    }

    const product = new Product(productData);
    await product.save();

    await adminNotificationService.notifyNewProduct(product);

    res.status(201).json({ 
      message: "Producto creado exitosamente", 
      product 
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "SKU o slug ya existe" });
    }
    res.status(500).json({ error: "Error al crear el producto" });
  }
});

// Actualizar producto existente
router.put("/:id", checkAuth, checkRole(["admin"]), async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;

    // Validar categoría si se actualiza
    if (updates.category) {
      const category = await Category.findById(updates.category);
      if (!category) {
        return res.status(400).json({ error: "Categoría no válida" });
      }
    }

    // Validar marca si se actualiza
    if (updates.brand) {
      const brand = await Brand.findById(updates.brand);
      if (!brand) {
        return res.status(400).json({ error: "Marca no válida" });
      }
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      updates,
      { new: true, runValidators: true }
    ).populate('category brand');

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({ 
      message: "Producto actualizado exitosamente", 
      product 
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

// Eliminar producto (soft delete)
router.delete("/:id", checkAuth, checkRole(["admin"]), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

module.exports = router;