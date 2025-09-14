// Archivo temporal para evitar errores de import// Archivo temporal para evitar errores de importconst mongoose = require("mongoose");

// Este modelo está deshabilitado para el negocio de productos de lujo

// Este modelo está deshabilitado para el negocio de productos de lujo

const mongoose = require("mongoose");

const userSubscriptionSchema = new mongoose.Schema(

// Schema temporal vacío

const tempSubscriptionSchema = new mongoose.Schema({const mongoose = require("mongoose");  {

  _id: { type: mongoose.Schema.Types.ObjectId, auto: true }

}, { collection: 'temp_disabled_subscriptions' });    userId: {



module.exports = mongoose.model("UserSubscription", tempSubscriptionSchema);// Schema temporal vacío      type: mongoose.Schema.Types.ObjectId,

const tempSubscriptionSchema = new mongoose.Schema({      ref: "User",

  _id: { type: mongoose.Schema.Types.ObjectId, auto: true }      required: true,

}, { collection: 'temp_disabled_subscriptions' });    },

    productId: {

module.exports = mongoose.model("UserSubscription", tempSubscriptionSchema);      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    plan: {
      type: String,
      required: true,
      enum: ["weekly", "biweekly", "monthly"],
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "paused", "cancelled", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    nextDelivery: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      instructions: String,
    },
    paymentMethod: {
      type: String,
      enum: ["mercadopago", "stripe", "paypal"],
      default: "mercadopago",
    },
    paymentId: String,
    lastPaymentDate: Date,
    nextPaymentDate: Date,
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    notes: String,
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para mejorar rendimiento
userSubscriptionSchema.index({ userId: 1, status: 1 });
userSubscriptionSchema.index({ nextDelivery: 1, status: 1 });
userSubscriptionSchema.index({ productId: 1 });

// Middleware para calcular la próxima entrega
userSubscriptionSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("plan") || this.isModified("startDate")) {
    this.calculateNextDelivery();
  }
  next();
});

// Método para calcular la próxima entrega
userSubscriptionSchema.methods.calculateNextDelivery = function () {
  const baseDate = this.nextDelivery || this.startDate || new Date();
  const date = new Date(baseDate);

  switch (this.plan) {
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "biweekly":
      date.setDate(date.getDate() + 14);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
  }

  this.nextDelivery = date;
  return date;
};

// Método para pausar suscripción
userSubscriptionSchema.methods.pause = function () {
  this.status = "paused";
  return this.save();
};

// Método para reanudar suscripción
userSubscriptionSchema.methods.resume = function () {
  this.status = "active";
  this.calculateNextDelivery();
  return this.save();
};

// Método para cancelar suscripción
userSubscriptionSchema.methods.cancel = function () {
  this.status = "cancelled";
  this.endDate = new Date();
  return this.save();
};

// Método estático para obtener suscripciones por entregar
userSubscriptionSchema.statics.getPendingDeliveries = function (
  date = new Date()
) {
  return this.find({
    status: "active",
    nextDelivery: { $lte: date },
  }).populate("userId productId");
};

const UserSubscription = mongoose.model(
  "UserSubscription",
  userSubscriptionSchema
);

module.exports = UserSubscription;
