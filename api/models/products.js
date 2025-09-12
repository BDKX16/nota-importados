const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Esquema para variantes de productos (tallas, colores, etc.)
const variantSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  priceModifier: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  sku: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Esquema para especificaciones técnicas del producto
const specificationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: false,
  },
});

// Esquema para reseñas de productos
const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: false,
    },
    comment: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Esquema principal para productos generales
const productSchema = new Schema(
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
      required: true,
    },
    shortDescription: {
      type: String,
      required: false,
      maxlength: 200,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: false,
      min: 0,
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one image is required",
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: false,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    variants: [variantSchema],
    specifications: [specificationSchema],
    reviews: [reviewSchema],
    tags: {
      type: [String],
      required: false,
    },
    weight: {
      type: Number,
      required: false,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    saleEndDate: {
      type: Date,
      required: false,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    metaTitle: {
      type: String,
      required: false,
    },
    metaDescription: {
      type: String,
      required: false,
    },
    metaKeywords: {
      type: [String],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Esquema para descuentos/promociones generales
const discountSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchase: {
      type: Number,
      required: false,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      required: false,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    appliesTo: {
      type: String,
      enum: ["all", "category", "brand", "product"],
      required: true,
    },
    targetIds: [
      {
        type: Schema.Types.ObjectId,
        required: false,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      required: false,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    userLimit: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para optimización
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

discountSchema.index({ code: 1 });
discountSchema.index({ isActive: 1 });
discountSchema.index({ validFrom: 1, validUntil: 1 });

// Middleware para generar slug automáticamente
productSchema.pre("save", function (next) {
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

// Métodos virtuales
productSchema.virtual("averageRating").get(function () {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

productSchema.virtual("reviewCount").get(function () {
  return this.reviews.length;
});

productSchema.virtual("discountPercentage").get(function () {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(
    ((this.originalPrice - this.price) / this.originalPrice) * 100
  );
});

// Métodos de instancia
productSchema.methods.isInStock = function (variantIndex = null) {
  if (variantIndex !== null && this.variants[variantIndex]) {
    return this.variants[variantIndex].stock > 0;
  }
  return this.stock > 0;
};

productSchema.methods.getPrice = function (variantIndex = null) {
  let basePrice = this.price;
  if (variantIndex !== null && this.variants[variantIndex]) {
    basePrice += this.variants[variantIndex].priceModifier;
  }
  return basePrice;
};

// Métodos estáticos
productSchema.statics.getFeatured = function (limit = 10) {
  return this.find({
    isFeatured: true,
    isActive: true,
  })
    .populate("category brand")
    .limit(limit)
    .sort({ createdAt: -1 });
};

productSchema.statics.getByCategory = function (categoryId, options = {}) {
  const query = {
    category: categoryId,
    isActive: true,
  };

  return this.find(query)
    .populate("category brand")
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

productSchema.statics.search = function (searchTerm, options = {}) {
  return this.find(
    {
      $text: { $search: searchTerm },
      isActive: true,
    },
    { score: { $meta: "textScore" } }
  )
    .populate("category brand")
    .sort({ score: { $meta: "textScore" } })
    .limit(options.limit || 20);
};

discountSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    this.validFrom <= now &&
    this.validUntil >= now &&
    (!this.usageLimit || this.usageCount < this.usageLimit)
  );
};

discountSchema.methods.canApplyTo = function (productId, categoryId, brandId) {
  if (this.appliesTo === "all") return true;
  if (this.appliesTo === "product") return this.targetIds.includes(productId);
  if (this.appliesTo === "category") return this.targetIds.includes(categoryId);
  if (this.appliesTo === "brand") return this.targetIds.includes(brandId);
  return false;
};

const Product = mongoose.model("Product", productSchema);
const Discount = mongoose.model("Discount", discountSchema);

module.exports = {
  Product,
  Discount,
};
