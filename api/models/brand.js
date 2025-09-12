const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Esquema para marcas de productos
const brandSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    logo: {
      type: String,
      required: false,
    },
    website: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Website must be a valid URL",
      },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    country: {
      type: String,
      required: false,
    },
    foundedYear: {
      type: Number,
      required: false,
      min: 1800,
      max: new Date().getFullYear(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    socialMedia: {
      instagram: String,
      facebook: String,
      twitter: String,
      youtube: String,
    },
    contactInfo: {
      email: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /\S+@\S+\.\S+/.test(v);
          },
          message: "Email must be valid",
        },
      },
      phone: String,
      address: String,
    },
    seoTitle: {
      type: String,
      required: false,
    },
    seoDescription: {
      type: String,
      required: false,
    },
    seoKeywords: {
      type: [String],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para optimización
brandSchema.index({ slug: 1 });
brandSchema.index({ isActive: 1 });
brandSchema.index({ isPremium: 1 });
brandSchema.index({ name: "text", description: "text" });

// Middleware para generar slug automáticamente si no se proporciona
brandSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  }
  next();
});

// Método virtual para obtener productos de la marca
brandSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "brand",
});

// Método para obtener estadísticas de la marca
brandSchema.methods.getStats = async function () {
  const Product = mongoose.model("Product");

  const stats = await Product.aggregate([
    { $match: { brand: this._id, isActive: true } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        averagePrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        totalStock: { $sum: "$stock" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalProducts: 0,
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      totalStock: 0,
    }
  );
};

// Método estático para obtener marcas premium
brandSchema.statics.getPremiumBrands = function () {
  return this.find({
    isPremium: true,
    isActive: true,
  }).sort({ name: 1 });
};

// Método estático para buscar marcas por categoría
brandSchema.statics.findByCategory = function (categoryId) {
  return this.find({
    categories: categoryId,
    isActive: true,
  }).sort({ name: 1 });
};

module.exports = mongoose.model("Brand", brandSchema);
