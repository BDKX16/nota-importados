const express = require("express");
const crypto = require("crypto");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const router = express.Router();
const { checkAuth, checkRole } = require("../middlewares/authentication");
const trackInteraction = require("../middlewares/interaction-tracker");

const Payments = require("../models/payment.js");
const { Product, Discount, PerfumeProduct } = require("../models/products");
const Order = require("../models/order");
const User = require("../models/user");
const { generateOrderId } = require("../models/counter");

// Email service import
const emailService = require("../infraestructure/services/emailService");
const adminNotificationService = require("../infraestructure/services/adminNotificationService");
// TODO: Implementar checkLowStock más adelante
// const { checkLowStock } = require("./products");

// Set up MercadoPago credentials
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: "abc",
  },
});

// Verificar que estamos usando credenciales de test
const isTestEnvironment =
  process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith("TEST-");
console.log(
  "🔧 MercadoPago Environment:",
  isTestEnvironment ? "TEST/SANDBOX" : "PRODUCTION"
);

if (!isTestEnvironment && process.env.NODE_ENV !== "production") {
  console.warn(
    "⚠️  ADVERTENCIA: Usando credenciales de PRODUCCIÓN en entorno de desarrollo"
  );
}

/**
 * HELPER FUNCTIONS
 */

// Validar y aplicar descuento durante el checkout
async function validateAndApplyDiscount(discountCode, cartItems, userId) {
  if (!discountCode) {
    return { valid: false, discountAmount: 0 };
  }

  try {
    // Buscar el descuento
    const discount = await Discount.findOne({
      code: discountCode.toUpperCase(),
      isActive: true,
    });

    if (!discount) {
      return { valid: false, error: "Código de descuento no válido" };
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

      return { valid: false, error: errorMessage };
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
        const product =
          (await Product.findById(item.id)) ||
          (await PerfumeProduct.findById(item.id));
        if (product) {
          canApply = discount.targetIds.some(
            (id) => id.toString() === product.category?.toString()
          );
        }
      } else if (discount.appliesTo === "brand") {
        // Buscar el producto para obtener su marca
        const product =
          (await Product.findById(item.id)) ||
          (await PerfumeProduct.findById(item.id));
        if (product) {
          canApply = discount.targetIds.some(
            (id) => id.toString() === product.brand?.toString()
          );
        }
      }

      if (canApply) {
        applicableItems.push(item);
        totalApplicableAmount += item.price * item.quantity;
      }
    }

    if (applicableItems.length === 0) {
      return {
        valid: false,
        error: "Este descuento no aplica a los productos en tu carrito",
      };
    }

    // Validar compra mínima
    if (discount.minPurchase && totalApplicableAmount < discount.minPurchase) {
      return {
        valid: false,
        error: `Compra mínima requerida: $${discount.minPurchase}`,
      };
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

    // Incrementar contador de uso (solo en checkout exitoso)
    // Esta parte se llamará desde el webhook de confirmación

    return {
      valid: true,
      discount: discount,
      discountAmount: Math.round(discountAmount * 100) / 100,
      applicableAmount: totalApplicableAmount,
      applicableItems: applicableItems.map((item) => item.id),
    };
  } catch (error) {
    console.error("Error validando descuento:", error);
    return {
      valid: false,
      error: "Error al validar el descuento",
    };
  }
}

// Incrementar uso del descuento (llamar cuando se confirme el pago)
async function incrementDiscountUsage(discountCode, userId) {
  try {
    const discount = await Discount.findOne({
      code: discountCode.toUpperCase(),
      isActive: true,
    });

    if (discount) {
      discount.usageCount += 1;
      await discount.save();

      console.log(
        `Descuento ${discountCode} usado. Total usos: ${discount.usageCount}`
      );
    }
  } catch (error) {
    console.error("Error incrementando uso de descuento:", error);
  }
}

/**
 * CHECKOUT API ROUTES
 */

// Crear preferencia para checkout
router.post("/create-preference", checkAuth, async (req, res) => {
  try {
    const { cartItems, shippingInfo, discountInfo, shippingCost } = req.body;
    const userId = req.userData._id;

    // Validar datos requeridos
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El carrito está vacío",
      });
    }

    // Obtener información completa de productos
    const items = [];
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      // Buscar en PerfumeProduct por cualquier tipo de perfume
      const perfumeTypes = [
        "perfume",
        "cologne",
        "body-spray",
        "gift-set",
        "aftershave",
        "eau-de-toilette",
        "eau-de-parfum",
      ];

      if (perfumeTypes.includes(cartItem.type)) {
        const product = await PerfumeProduct.findOne({
          id: cartItem.id,
        });
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Producto no encontrado: ${cartItem.id}`,
          });
        }

        const itemPrice = product.price;
        const itemTotal = itemPrice * cartItem.quantity;

        items.push({
          id: product._id,
          title: product.name,
          description: `${product.name} - ${product.description || "Producto"}`,
          picture_url: product.images?.[0] || "https://via.placeholder.com/150",
          category_id: "perfume",
          quantity: cartItem.quantity,
          currency_id: "ARS",
          unit_price: itemPrice,
        });

        totalAmount += itemTotal;
      }
    }

    // Agregar el costo del envío como un ítem si es mayor a 0
    if (shippingCost && shippingCost > 0) {
      items.push({
        id: "shipping",
        title: "Envío a domicilio",
        description: "Costo de envío para pedidos menores a 3 cervezas",
        picture_url: "https://via.placeholder.com/150",
        category_id: "shipping",
        quantity: 1,
        currency_id: "ARS",
        unit_price: shippingCost,
      });

      totalAmount += shippingCost;
    }

    // Validar y aplicar descuento si existe
    let validatedDiscount = { valid: false, discountAmount: 0 };
    if (discountInfo && discountInfo.code) {
      validatedDiscount = await validateAndApplyDiscount(
        discountInfo.code,
        cartItems,
        userId
      );

      if (!validatedDiscount.valid) {
        return res.status(400).json({
          success: false,
          message: validatedDiscount.error || "Descuento no válido",
        });
      }

      totalAmount -= validatedDiscount.discountAmount;
    }

    // Crear orden en la base de datos
    const orderId = await generateOrderId();

    // Preparar items para la orden (incluir envío si aplica)
    const orderItems = cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      price: item.price,
      quantity: item.quantity,
      beerType: item.beerType || null, // Guardar el tipo de cerveza seleccionado
    }));

    // Agregar envío como item si tiene costo
    if (shippingCost && shippingCost > 0) {
      orderItems.push({
        id: "shipping",
        name: "Envío a domicilio",
        type: "shipping",
        price: shippingCost,
        quantity: 1,
        beerType: null,
      });
    }

    const newOrder = new Order({
      id: orderId,
      customer: {
        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}`,
        userId,
      },
      date: new Date(),
      status: "pending_payment",
      total: totalAmount,
      items: orderItems,
      paymentMethod: "mercadopago",
      paymentStatus: "pending",
      deliveryTime: shippingInfo.deliveryTime || null,
      customerSelectedTime: !!shippingInfo.deliveryTime,
      discountCode: validatedDiscount.valid
        ? validatedDiscount.discount.code
        : null,
      discountAmount: validatedDiscount.discountAmount || 0,
      shippingCost: shippingCost || 0, // Agregar campo específico para costo de envío
      trackingSteps: [
        {
          status: "pending_payment",
          statusDisplayName: "Pedido recibido",
          date: new Date(),
          description:
            "Tu pedido ha sido recibido y está siendo procesado, te avisaremos cuando se haya acreditado el pago, no te preocupes",
          completed: false,
          current: true,
        },
      ],
      nullDate: null,
    });

    await newOrder.save();

    // Configurar preference para MercadoPago
    const preferenceData = {
      items,
      payer: {
        name: shippingInfo.firstName,
        surname: shippingInfo.lastName,
        email: shippingInfo.email,
        phone: {
          area_code: "223",
          number: shippingInfo.phone?.replace(/\D/g, ""),
        },
        identification: {
          type: "DNI",
          number: "12345678",
        },
        address: {
          street_name: shippingInfo.address,
          street_number: 0,
          zip_code: shippingInfo.postalCode,
        },
      },
      // URLs de notificación y retorno
      notification_url: `${
        process.env.API_URL || "http://localhost:3001"
      }/api/payments/webhook`,
      back_urls: {
        success: `${
          process.env.FRONT_URL || "http://localhost:3000"
        }/pedido/confirmacion`,
        failure: `${
          process.env.FRONT_URL || "http://localhost:3000"
        }/pedido/error`,
        pending: `${
          process.env.FRONT_URL || "http://localhost:3000"
        }/pedido/pendiente`,
      },
      external_reference: newOrder._id.toString(),
      statement_descriptor: "Nota Importados",
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    // Crear registro de pago inicial
    const paymentItems = cartItems.map((item) => ({
      id: item.id,
      name: item.name || item.title,
      type: item.type,
      quantity: item.quantity || 1,
      price: item.price,
      beerType: item.beerType || null, // Guardar el tipo de cerveza
    }));

    // Agregar envío al registro de pagos si aplica
    if (shippingCost && shippingCost > 0) {
      paymentItems.push({
        id: "shipping",
        name: "Envío a domicilio",
        type: "shipping",
        quantity: 1,
        price: shippingCost,
        beerType: null,
      });
    }

    const initialPayment = new Payments({
      userId,
      orderId: orderId,
      amount: totalAmount,
      currency: "ARS",
      paymentMethod: "mercadopago",
      preferenceId: result.id,
      status: "pending",
      items: paymentItems,
      createdAt: new Date(),
    });

    await initialPayment.save();

    const responseData = {
      success: true,
      data: {
        preferenceId: result.id,
        orderId: orderId,
        mongoOrderId: newOrder._id,
        totalAmount,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
      },
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error creando preferencia de MercadoPago:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
});

// Procesar pago directo con tarjeta (Checkout API)
router.post("/process-payment", checkAuth, async (req, res) => {
  try {
    const {
      token,
      orderId,
      installments,
      payment_method_id,
      issuer_id,
      payer,
    } = req.body;

    const userId = req.userData._id;

    // Determinar si buscar por id personalizado o _id de MongoDB
    let searchQuery;
    if (orderId.startsWith("ORD")) {
      // ID personalizado - buscar por campo 'id'
      searchQuery = {
        id: orderId,
        "customer.userId": userId,
      };
    } else {
      // ObjectId de MongoDB - buscar por campo '_id'
      searchQuery = {
        _id: orderId,
        "customer.userId": userId,
      };
    }

    // Buscar la orden
    const order = await Order.findOne(searchQuery);

    if (!order) {
      console.error("❌ Error: Orden no encontrada");
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
      });
    }

    const payment = new Payment(client);

    const paymentData = {
      transaction_amount: order.total,
      token,
      description: `Pedido Nota Importados - ${order.id}`,
      installments: parseInt(installments),
      payment_method_id,
      issuer_id,
      payer: {
        email: payer.email,
        identification: {
          type: payer.identification.type,
          number: payer.identification.number,
        },
      },
      external_reference: order._id.toString(),
      statement_descriptor: "Nota Importados",
      statement_descriptor: "Nota Importados",
      notification_url: `${
        process.env.API_URL || "http://localhost:3001"
      }/api/payments/webhook`,
    };

    const result = await payment.create({ body: paymentData });

    // Crear registro de pago
    const paymentRecord = new Payments({
      orderId: order._id.toString(),
      userId,
      amount: order.total,
      currency: "ARS",
      method: "credit_card",
      status: result.status,
      mercadoPagoId: result.id.toString(),
      details: {
        payment_method_id,
        installments: parseInt(installments),
        issuer_id,
        transaction_details: result.transaction_details,
      },
      createdAt: new Date(),
      nullDate: null,
    });

    await paymentRecord.save();

    // Actualizar orden según el estado del pago
    if (result.status === "approved") {
      order.paymentStatus = "paid";
      order.status = "confirmed";
      order.trackingSteps.push({
        status: "Pago confirmado",
        date: new Date(),
        description: "Tu pago ha sido confirmado exitosamente",
      });

      // Incrementar uso del descuento si se aplicó uno
      if (order.discount && order.discount.code) {
        try {
          await incrementDiscountUsage(order.discount.code);
          console.log(
            `✅ Descuento ${order.discount.code} incrementado correctamente`
          );
        } catch (discountError) {
          console.error(
            `❌ Error al incrementar descuento ${order.discount.code}:`,
            discountError
          );
        }
      }
    } else if (result.status === "pending") {
      order.paymentStatus = "pending";
      order.status = "pending_payment";
      order.trackingSteps.push({
        status: "pending_payment",
        statusDisplayName: "Pago pendiente",
        date: new Date(),
        description: "Tu pago está siendo procesado",
        completed: false,
        current: true,
      });
    } else {
      order.paymentStatus = "failed";
      order.status = "cancelled";
      order.trackingSteps.push({
        status: "Pago rechazado",
        date: new Date(),
        description: "Tu pago ha sido rechazado",
      });
    }

    order.paymentId = paymentRecord._id;
    await order.save();

    const responseData = {
      success: true,
      data: {
        payment: result,
        order: order,
        status: result.status,
      },
    };

    res.json(responseData);
  } catch (error) {
    console.error("❌ Error procesando pago:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error procesando el pago",
      error: error.message,
    });
  }
});

/**
 * PROCESAMIENTO DE PAGOS PARA CERVEZAS Y SUSCRIPCIONES (CHECKOUT PRO)
 */

// Verificar estado de una orden
router.get("/order-status/:orderId", checkAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userData._id;

    // Buscar orden
    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // Verificar que la orden pertenece al usuario
    if (order.customer.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para ver esta orden" });
    }

    // Buscar pago asociado
    const payment = await Payments.findOne({ orderId });

    res.status(200).json({
      order: {
        id: order.id,
        date: order.date,
        status: order.status,
        total: order.total,
        items: order.items,
        paymentStatus: order.paymentStatus,
        trackingSteps: order.trackingSteps,
        deliveryTime: order.deliveryTime,
      },
      paymentInfo: payment
        ? {
            status: payment.status,
            method: payment.paymentMethod,
            date: payment.date,
          }
        : null,
    });
  } catch (error) {
    console.error("Error al verificar estado de orden:", error);
    res.status(500).json({ error: "Error al verificar el estado de la orden" });
  }
});

// Obtener pedidos del usuario autenticado
router.get("/my-orders", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;
    const { status } = req.query;

    // Construir filtro
    const filter = { "customer.userId": userId, nullDate: null };

    if (
      status &&
      ["pending", "processing", "shipped", "delivered", "cancelled"].includes(
        status
      )
    ) {
      filter.status = status;
    }

    // Obtener órdenes
    const orders = await Order.find(filter).sort({ date: -1 });

    const responseData = {
      success: true,
      data: { data: orders },
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      error: "Error al obtener el historial de pedidos",
    });
  }
});

// Webhook para recibir notificaciones de pago de MercadoPago
router.post("/webhook", async (req, res) => {
  try {
    const { type } = req.query;
    const paymentId = req.query["data.id"]; // Obtener el ID del pago de los query params

    // Solo procesar notificaciones de pagos
    if (type !== "payment") {
      return res.status(200).send();
    }

    // Validar que tenemos el ID del pago
    if (!paymentId) {
      return res.status(400).send();
    }

    // Verificar firma de MercadoPago (en producción)
    if (process.env.NODE_ENV === "production") {
      try {
        const xSignature = req.headers["x-signature"];
        const xRequestId = req.headers["x-request-id"];

        if (!xSignature) {
          return res.status(401).send();
        }

        // Extraer timestamp y hash de la firma
        const signatureParts = xSignature.split(",");
        let ts, hash;

        signatureParts.forEach((part) => {
          const [key, value] = part.split("=");
          if (key === "ts") ts = value;
          if (key === "v1") hash = value;
        });

        if (!ts || !hash) {
          return res.status(401).send();
        }

        // Crear string para verificar firma
        const dataId = paymentId;
        const stringToSign = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

        // Calcular hash esperado usando el webhook secret
        const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
        if (!webhookSecret) {
          return res.status(500).send();
        }

        const expectedHash = crypto
          .createHmac("sha256", webhookSecret)
          .update(stringToSign)
          .digest("hex");

        if (hash !== expectedHash) {
          return res.status(401).send();
        }
      } catch (signatureError) {
        console.error("❌ Error verificando firma:", signatureError);
        return res.status(401).send();
      }
    }

    let paymentInfo;

    try {
      paymentInfo = await new Payment(client).get({ id: paymentId });
    } catch (error) {
      // Si es un pago de prueba (ID 123456), crear una respuesta mock para testing
      if (paymentId === "123456") {
        paymentInfo = {
          id: "123456",
          status: "approved",
          status_detail: "approved",
          transaction_amount: 1000,
          external_reference: null, // Esto causará que se salte el procesamiento
          payment_method_id: "master",
          payer: {
            email: "test@test.com",
            identification: { number: "12345678" },
          },
        };
      } else {
        return res.status(500).send();
      }
    }

    // Obtener referencia externa (orderId)
    const orderId = paymentInfo.external_reference;

    if (!orderId) {
      console.error("❌ Orden no especificada en la notificación");
      return res.status(400).send();
    }

    const finalOrderIdVisual = paymentInfo.external_reference;

    const findOrder = await Order.findOne({ id: finalOrderIdVisual });

    const finalOrderId = findOrder._id;
    // Buscar registro de pago existente
    const existingPayment = await Payments.findOne({ orderId: finalOrderId });
    if (!existingPayment) {
      if (paymentInfo.id) {
        const paymentByMpId = await Payments.findOne({
          paymentId: paymentInfo.id,
        });
      }
    }

    // Actualizar estado de pago
    const paymentUpdateResult = await Payments.findOneAndUpdate(
      { orderId: finalOrderId },
      {
        status: paymentInfo.status,
        paymentId: paymentInfo.id,
        userData: paymentInfo.payer,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (paymentUpdateResult) {
      // Registro actualizado
    } else {
      console.warn(
        "⚠️ No se encontró registro de pago para orden:",
        finalOrderId
      );
    }

    // Actualizar estado de orden - buscar por ObjectId de MongoDB
    const order = await Order.findById(finalOrderId);
    if (order) {
      if (
        paymentInfo.status === "approved" ||
        paymentInfo.status === "authorized"
      ) {
        order.paymentStatus = "completed";

        // Si la orden estaba pendiente, actualizarla a payment_confirmed
        if (order.status === "pending_payment") {
          order.status = "payment_confirmed";

          // Actualizar tracking steps
          order.trackingSteps.forEach((step) => (step.current = false));
          order.trackingSteps.push({
            status: "payment_confirmed",
            statusDisplayName: "Pago confirmado",
            date: new Date(),
            description: "Tu pago ha sido confirmado exitosamente",
            completed: true,
            current: true,
          });

          // Incrementar uso del descuento si se aplicó uno
          if (order.discount && order.discount.code) {
            try {
              await incrementDiscountUsage(order.discount.code);
              console.log(
                `✅ Descuento ${order.discount.code} incrementado correctamente`
              );
            } catch (discountError) {
              console.error(
                `❌ Error al incrementar descuento ${order.discount.code}:`,
                discountError
              );
            }
          }

          // Reducir stock de productos
          for (const item of order.items) {
            const perfumeTypes = [
              "perfume",
              "cologne",
              "body-spray",
              "gift-set",
              "aftershave",
              "eau-de-toilette",
              "eau-de-parfum",
            ];

            if (perfumeTypes.includes(item.type)) {
              await PerfumeProduct.findOneAndUpdate(
                { id: item.id },
                { $inc: { stock: -item.quantity } }
              );
            }
            // Las suscripciones han sido eliminadas para productos de lujo
          }

          // TODO: Implementar verificación de stock bajo más adelante
          /*
          // Verificar stock bajo después de procesar los items
          try {
            const { checkLowStock } = require("./products");
            await checkLowStock();
          } catch (stockError) {
            console.error("❌ Error al verificar stock bajo:", stockError);
          }
          */
        }
      } else if (
        ["rejected", "cancelled", "refunded", "charged_back"].includes(
          paymentInfo.status
        )
      ) {
        order.paymentStatus = "failed";

        // Notificar a administradores sobre problema de pago
        try {
          const user = await User.findById(order.customer.userId);
          if (user) {
            await adminNotificationService.notifyPaymentIssue({
              orderId: order.id || order._id.toString(),
              customerName: user.name,
              customerEmail: user.email,
              status: paymentInfo.status,
              amount: order.total,
              reason: paymentInfo.status_detail || "No especificado",
            });
            console.log(
              `📧 Notificación de problema de pago enviada a administradores`
            );
          }
        } catch (notificationError) {
          console.error(
            `❌ Error al notificar problema de pago:`,
            notificationError
          );
        }
      }

      await order.save();

      // Enviar email de confirmación de pedido si el pago fue aprobado
      if (
        (paymentInfo.status === "approved" ||
          paymentInfo.status === "authorized") &&
        order.status === "processing"
      ) {
        try {
          // Obtener datos del usuario
          const user = await User.findById(order.customer.userId);
          if (user) {
            // Preparar datos para el email
            const orderData = {
              customerName: user.name,
              orderId: order.id || order._id.toString(),
              orderDate: order.createdAt,
              total: order.total,
              items: order.items.map((item) => ({
                name: item.name,
                brand: item.brand,
                price: item.price,
                quantity: item.quantity || 1,
              })),
              shippingAddress: user.address,
            };

            // Enviar email de confirmación de pedido de perfumes
            await emailService.sendOrderConfirmation(user.email, orderData);
            console.log(
              `✅ Email de confirmación de pedido enviado a ${user.email}`
            );
          }
        } catch (emailError) {
          console.error(
            `❌ Error al enviar email de confirmación:`,
            emailError
          );
          // No fallar el webhook si el email falla
        }

        // Enviar notificaciones a administradores
        try {
          const user = await User.findById(order.customer.userId);
          if (user) {
            // Notificar nuevo pedido de perfumes a administradores
            await adminNotificationService.notifyNewOrder(order, user);
            console.log(
              `✅ Notificación de nuevo pedido enviada a administradores`
            );
          }
        } catch (adminNotificationError) {
          console.error(
            `❌ Error al enviar notificación a administradores:`,
            adminNotificationError
          );
          // No fallar el webhook si la notificación administrativa falla
        }
      }
    } else {
      // Intentar búsqueda alternativa por campo 'id'
      const orderByField = await Order.findOne({ id: finalOrderId });

      if (orderByField) {
        // Actualizar usando la orden encontrada
        if (
          paymentInfo.status === "approved" ||
          paymentInfo.status === "authorized"
        ) {
          orderByField.paymentStatus = "completed";

          // Si la orden estaba pendiente, procesarla
          if (orderByField.status === "pending_payment") {
            orderByField.status = "payment_confirmed";

            // Procesar items y reducir stock de perfumes
            for (const item of orderByField.items) {
              const perfumeTypes = [
                "perfume",
                "cologne",
                "body-spray",
                "gift-set",
                "aftershave",
                "eau-de-toilette",
                "eau-de-parfum",
              ];

              if (perfumeTypes.includes(item.type)) {
                await PerfumeProduct.findOneAndUpdate(
                  { id: item.id },
                  { $inc: { stock: -item.quantity } }
                );
              }
            }

            // Verificar stock bajo después de procesar los items (búsqueda alt)
            try {
              const { checkLowStock } = require("./products");
              await checkLowStock();
            } catch (stockError) {
              console.error(
                "❌ Error al verificar stock bajo (búsqueda alt):",
                stockError
              );
            }
          }
        } else {
          orderByField.paymentStatus = "failed";
        }

        await orderByField.save();

        // Enviar email de confirmación de pedido si el pago fue aprobado (búsqueda alternativa)
        if (
          (paymentInfo.status === "approved" ||
            paymentInfo.status === "authorized") &&
          orderByField.status === "processing"
        ) {
          try {
            // Obtener datos del usuario
            const user = await User.findById(orderByField.customer.userId);
            if (user) {
              // Preparar datos para el email
              const orderData = {
                customerName: user.name,
                orderId: orderByField.id || orderByField._id.toString(),
                orderDate: orderByField.createdAt,
                total: orderByField.total,
                items: orderByField.items.map((item) => ({
                  name: item.name,
                  brand: item.brand,
                  price: item.price,
                  quantity: item.quantity || 1,
                })),
                shippingAddress: user.address,
              };

              // Enviar email de confirmación de pedido de perfumes
              await emailService.sendOrderConfirmation(user.email, orderData);
              console.log(
                `✅ Email de confirmación de pedido enviado a ${user.email} (búsqueda alt)`
              );
            }
          } catch (emailError) {
            console.error(
              `❌ Error al enviar email de confirmación (búsqueda alt):`,
              emailError
            );
            // No fallar el webhook si el email falla
          }
        }
      }
    }

    res.status(200).send();
  } catch (error) {
    console.error("❌ Error en webhook de pagos:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).send();
  }
});

/**********
 * FUNCTIONS
 ************/

// Procesar pago con MercadoPago
const processMercadopagoPayment = async (preference) => {
  try {
    const response = await new Preference(client).create(preference);
    return {
      preference: response,
      init_point: response.init_point,
    };
  } catch (error) {
    console.error("Error al crear preferencia en MercadoPago:", error);
    return { preference: null, init_point: null };
  }
};

// Endpoint para crear órdenes de pago en efectivo
router.post("/create-cash-order", checkAuth, async (req, res) => {
  try {
    const { cartItems, shippingInfo, discountCode, deliveryMethod } = req.body;
    const userId = req.userData._id;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El carrito está vacío",
      });
    }

    // Generar ID único para la orden
    const orderId = await generateOrderId();

    // Validar productos y calcular total
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const perfumeTypes = [
        "perfume",
        "cologne",
        "body-spray",
        "gift-set",
        "aftershave",
        "eau-de-toilette",
        "eau-de-parfum",
      ];

      if (perfumeTypes.includes(cartItem.type)) {
        const product = await PerfumeProduct.findOne({
          id: cartItem.id,
        });

        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Producto no encontrado: ${cartItem.id}`,
          });
        }

        if (product.stock < cartItem.quantity) {
          return res.status(400).json({
            success: false,
            message: `Stock insuficiente para ${product.name}. Stock disponible: ${product.stock}`,
          });
        }

        const itemPrice = product.price;
        const itemTotal = itemPrice * cartItem.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          id: cartItem.id,
          name: product.name,
          type: cartItem.type,
          price: itemPrice,
          quantity: cartItem.quantity,
        });
      }
    }

    // Validar y aplicar descuento si existe
    let validatedDiscount = { valid: false, discountAmount: 0 };
    if (discountCode) {
      validatedDiscount = await validateAndApplyDiscount(
        discountCode,
        cartItems,
        req.userData._id
      );

      if (!validatedDiscount.valid) {
        return res.status(400).json({
          success: false,
          message: validatedDiscount.error || "Descuento no válido",
        });
      }
    }

    const discountAmount = validatedDiscount.discountAmount || 0;

    // Calcular costo de envío (0 para retiro en local)
    const shippingCost = deliveryMethod === "pickup" ? 0 : 1500;

    const finalTotal = totalAmount - discountAmount + shippingCost;

    // Crear orden
    const newOrder = new Order({
      id: orderId,
      customer: {
        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        address:
          deliveryMethod === "pickup"
            ? "Retiro en local"
            : `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}`,
        userId,
      },
      date: new Date(),
      status: "pending_payment",
      total: finalTotal,
      items: orderItems,
      paymentMethod: "cash",
      paymentStatus: "pending",
      deliveryTime: shippingInfo.deliveryTime || null,
      customerSelectedTime: !!shippingInfo.deliveryTime,
      discountCode: discountCode || null,
      discountAmount: discountAmount,
      shippingCost: shippingCost,
      trackingSteps: [
        {
          status: "pending_payment",
          statusDisplayName: "Pedido recibido",
          date: new Date(),
          description:
            deliveryMethod === "pickup"
              ? "Tu pedido ha sido recibido. Puedes retirarlo y pagar en efectivo en nuestro local."
              : "Tu pedido ha sido recibido. Se entregará contra pago en efectivo.",
          completed: false,
          current: true,
        },
      ],
      nullDate: null,
    });

    await newOrder.save();

    // Reducir stock de productos
    for (const item of orderItems) {
      await PerfumeProduct.findOneAndUpdate(
        { id: item.id },
        { $inc: { stock: -item.quantity } }
      );
    }

    // Crear registro de pago pendiente
    const paymentRecord = new Payments({
      userId,
      orderId: newOrder._id.toString(),
      amount: finalTotal,
      currency: "ARS",
      paymentMethod: "cash",
      status: "pending",
      items: orderItems.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        quantity: item.quantity,
        price: item.price,
      })),
      customerInfo: {
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        city: shippingInfo.city,
        postalCode: shippingInfo.postalCode,
      },
      createdAt: new Date(),
    });

    await paymentRecord.save();

    // Enviar email de confirmación
    const user = await User.findById(userId);
    if (user && user.email) {
      try {
        const orderData = {
          customerName: user.name,
          orderId: orderId,
          orderDate: newOrder.date,
          total: finalTotal,
          items: orderItems.map((item) => ({
            name: item.name,
            brand: item.brand || "",
            price: item.price,
            quantity: item.quantity,
          })),
          shippingAddress:
            deliveryMethod === "pickup"
              ? "Retiro en local"
              : user.address || "Dirección no especificada",
          paymentMethod: "Pago en efectivo",
          deliveryMethod:
            deliveryMethod === "pickup"
              ? "Retiro en local"
              : "Entrega a domicilio",
        };

        await emailService.sendOrderConfirmation(user.email, orderData);
      } catch (emailError) {
        console.error("Error enviando email de confirmación:", emailError);
        // No fallar la orden por error de email
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId: orderId,
        orderNumber: newOrder._id,
        totalAmount: finalTotal,
        message:
          deliveryMethod === "pickup"
            ? "Orden creada exitosamente. Puedes retirar y pagar en nuestro local."
            : "Orden creada exitosamente. Se entregará contra pago en efectivo.",
      },
    });
  } catch (error) {
    console.error("Error creando orden de pago en efectivo:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor al crear la orden",
    });
  }
});

// Endpoint de test para validar descuentos (solo desarrollo)
if (process.env.NODE_ENV === "development") {
  router.post("/test-discount", async (req, res) => {
    try {
      const { discountCode, cartItems, userId } = req.body;

      console.log("🧪 Test de descuento:", { discountCode, cartItems, userId });

      const result = await validateAndApplyDiscount(
        discountCode,
        cartItems,
        userId
      );

      res.json({
        success: true,
        message: "Validación exitosa",
        data: result,
      });
    } catch (error) {
      res.json({
        success: false,
        message: error.message,
        error: error.message,
      });
    }
  });
}

module.exports = router;
