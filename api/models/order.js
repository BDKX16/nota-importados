const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Esquema para items dentro de una orden
const orderItemSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

// Esquema para tiempo de entrega
const deliveryTimeSchema = new Schema({
  date: {
    type: String,
    required: true,
  },
  timeRange: {
    type: String,
    required: true,
  },
});

// Esquema principal de orden/pedido
const orderSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: [
      // Estados iniciales
      "pending_payment", // Pendiente de pago
      "payment_confirmed", // Pago confirmado, pedido en procesamiento

      // Estados de preparación
      "preparing_order", // Preparando el pedido
      "stock_verification", // Verificando stock disponible
      "awaiting_supplier", // Esperando proveedor/importador

      // Estados de importación
      "ordering_overseas", // Pedido realizado al exterior
      "overseas_processing", // Procesando en origen
      "international_shipping", // Enviado desde origen
      "in_transit_international", // En tránsito internacional

      // Estados aduaneros
      "customs_clearance", // En proceso aduanero
      "customs_inspection", // Inspección aduanera
      "customs_approved", // Aprobado por aduana
      "paying_duties", // Pagando impuestos/aranceles

      // Estados locales
      "arrived_local_warehouse", // Llegó al depósito local
      "quality_inspection", // Inspección de calidad
      "local_processing", // Procesamiento local
      "ready_for_dispatch", // Listo para despacho

      // Estados de entrega
      "dispatched", // Despachado
      "out_for_delivery", // En reparto
      "delivery_attempted", // Intento de entrega
      "delivered", // Entregado

      // Estados especiales
      "on_hold", // En espera (problema temporal)
      "returned_to_sender", // Devuelto al remitente
      "cancelled", // Cancelado
      "refunded", // Reembolsado
      "lost_in_transit", // Perdido en tránsito
      "damaged", // Dañado
      "awaiting_customer_action", // Esperando acción del cliente
    ],
    default: "pending_payment",
  },
  total: {
    type: Number,
    required: true,
  },
  items: [orderItemSchema],
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded", "partial_refund"],
    default: "pending",
  },

  // Información de importación específica
  importInfo: {
    supplierCountry: {
      type: String,
      required: false,
    },
    supplierName: {
      type: String,
      required: false,
    },
    estimatedArrivalDate: {
      type: Date,
      required: false,
    },
    actualArrivalDate: {
      type: Date,
      required: false,
    },
    trackingNumber: {
      type: String,
      required: false,
    },
    internationalTrackingNumber: {
      type: String,
      required: false,
    },
    customsReference: {
      type: String,
      required: false,
    },
    dutiesAmount: {
      type: Number,
      required: false,
      default: 0,
    },
    dutiesPaidBy: {
      type: String,
      enum: ["customer", "company", "pending"],
      default: "pending",
    },
    originPort: {
      type: String,
      required: false,
    },
    destinationPort: {
      type: String,
      required: false,
    },
    shippingMethod: {
      type: String,
      enum: ["air", "sea", "land", "express"],
      required: false,
    },
    insuranceValue: {
      type: Number,
      required: false,
      default: 0,
    },
    weightKg: {
      type: Number,
      required: false,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
  },

  // Información de problemas/observaciones
  issues: [
    {
      type: {
        type: String,
        enum: [
          "customs_delay",
          "quality_issue",
          "damage",
          "missing_items",
          "documentation_problem",
          "payment_issue",
          "supplier_delay",
          "shipping_delay",
          "other",
        ],
      },
      description: String,
      date: {
        type: Date,
        default: Date.now,
      },
      resolved: {
        type: Boolean,
        default: false,
      },
      resolutionDate: Date,
      resolutionDescription: String,
    },
  ],
  deliveryTime: {
    type: deliveryTimeSchema,
    required: false,
  },
  customerSelectedTime: {
    type: Boolean,
    default: false,
  },
  trackingSteps: [
    {
      status: {
        type: String,
        required: true,
      },
      statusDisplayName: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: false,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      current: {
        type: Boolean,
        default: false,
      },
      estimatedDate: {
        type: Date,
        required: false,
      },
      location: {
        type: String,
        required: false,
      },
      updatedBy: {
        type: String,
        enum: ["system", "admin", "supplier", "customs", "carrier"],
        default: "system",
      },
      additionalInfo: {
        type: Object,
        required: false,
      },
    },
  ],

  // Notificaciones enviadas al cliente
  notifications: [
    {
      type: {
        type: String,
        enum: ["email", "sms", "push", "whatsapp"],
        required: true,
      },
      status: {
        type: String,
        required: true,
      },
      sentDate: {
        type: Date,
        default: Date.now,
      },
      delivered: {
        type: Boolean,
        default: false,
      },
      opened: {
        type: Boolean,
        default: false,
      },
      content: String,
    },
  ],

  // Documentación relacionada
  documents: [
    {
      type: {
        type: String,
        enum: [
          "invoice",
          "customs_declaration",
          "bill_of_lading",
          "packing_list",
          "certificate_of_origin",
          "insurance_certificate",
          "quality_certificate",
          "delivery_receipt",
          "damage_report",
          "other",
        ],
      },
      filename: String,
      url: String,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
      uploadedBy: String,
    },
  ],
  discountCode: {
    type: String,
    required: false,
  },
  discountAmount: {
    type: Number,
    required: false,
    default: 0,
  },
  shippingCost: {
    type: Number,
    required: false,
    default: 0,
  },
  nullDate: {
    type: Date,
    required: false,
    default: null,
  },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
