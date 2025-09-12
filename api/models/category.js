const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Esquema para categorías de productos
const categorySchema = new Schema(
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
    image: {
      type: String,
      required: false,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    subcategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
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
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ sortOrder: 1 });

// Middleware para generar slug automáticamente si no se proporciona
categorySchema.pre("save", function (next) {
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

// Método para obtener la ruta completa de la categoría
categorySchema.methods.getFullPath = async function () {
  let path = [this.name];
  let current = this;

  while (current.parentCategory) {
    current = await this.constructor.findById(current.parentCategory);
    if (current) {
      path.unshift(current.name);
    } else {
      break;
    }
  }

  return path.join(" > ");
};

// Método estático para obtener categorías principales
categorySchema.statics.getMainCategories = function () {
  return this.find({
    parentCategory: { $exists: false },
    isActive: true,
  }).sort({ sortOrder: 1, name: 1 });
};

// Método estático para obtener subcategorías de una categoría
categorySchema.statics.getSubcategories = function (parentId) {
  return this.find({
    parentCategory: parentId,
    isActive: true,
  }).sort({ sortOrder: 1, name: 1 });
};

module.exports = mongoose.model("Category", categorySchema);
