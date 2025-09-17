const mongoose = require("mongoose");

const landingConfigSchema = new mongoose.Schema(
  {
    // Configuración general
    siteName: {
      type: String,
      required: true,
      default: "Nota Importados",
    },
    tagline: {
      type: String,
      default: "Cervezas Artesanales Premium",
    },
    description: {
      type: String,
      default: "Descubre nuestras cervezas artesanales únicas",
    },
    logo: {
      type: String,
      default: "",
    },
    favicon: {
      type: String,
      default: "",
    },

    // SEO y Meta
    seoTitle: {
      type: String,
      required: true,
      default: "Nota Importados - Cervezas Artesanales Premium",
    },
    seoDescription: {
      type: String,
      default:
        "Disfruta de las mejores cervezas artesanales con entrega a domicilio y planes de suscripción personalizados.",
    },
    seoKeywords: {
      type: String,
      default:
        "cerveza artesanal, craft beer, suscripción cerveza, entrega domicilio",
    },
    ogImage: {
      type: String,
      default: "",
    },
    canonicalUrl: {
      type: String,
      default: "",
    },

    // Diseño y Tema
    theme: {
      primaryColor: {
        type: String,
        default: "#1a365d",
      },
      secondaryColor: {
        type: String,
        default: "#2d5a87",
      },
      accentColor: {
        type: String,
        default: "#f6ad55",
      },
      backgroundColor: {
        type: String,
        default: "#ffffff",
      },
      textColor: {
        type: String,
        default: "#2d3748",
      },
      fontFamily: {
        type: String,
        default: "Inter",
      },
      fontSize: {
        type: String,
        default: "16px",
      },
      borderRadius: {
        type: String,
        default: "8px",
      },
    },

    // Mantenimiento
    maintenance: {
      isActive: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        default: "Sitio en mantenimiento. Volvemos pronto.",
      },
      allowedIPs: [
        {
          type: String,
        },
      ],
    },

    // Metadatos del sistema
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: String,
      default: "1.0.0",
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Índice para asegurar que solo haya una configuración activa
landingConfigSchema.index(
  { isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

// Método para obtener la configuración activa
landingConfigSchema.statics.getActiveConfig = async function () {
  try {
    // Primero limpiar duplicados
    await this.cleanupDuplicates();

    let config = await this.findOne({ isActive: true });

    // Si no existe configuración, crear una por defecto
    if (!config) {
      // Primero verificar si existe alguna configuración
      const existingConfig = await this.findOne({});

      if (existingConfig) {
        // Si existe una configuración, activarla
        existingConfig.isActive = true;
        await existingConfig.save();
        config = existingConfig;
      } else {
        // Si no existe ninguna configuración, crear una nueva
        config = new this({
          siteName: "Nota Importados",
          tagline: "Cervezas Artesanales Premium",
          isActive: true,
        });
        await config.save();
      }
    }

    return config;
  } catch (error) {
    console.error("Error in getActiveConfig:", error);
    throw error;
  }
}; // Método para limpiar configuraciones duplicadas
landingConfigSchema.statics.cleanupDuplicates = async function () {
  try {
    // Obtener todas las configuraciones activas
    const activeConfigs = await this.find({ isActive: true });

    if (activeConfigs.length > 1) {
      // Mantener solo la más reciente y desactivar las demás
      const mostRecent = activeConfigs.sort(
        (a, b) => b.updatedAt - a.updatedAt
      )[0];

      // Desactivar todas las demás
      await this.updateMany(
        { isActive: true, _id: { $ne: mostRecent._id } },
        { isActive: false }
      );

      console.log(
        `Cleaned up ${activeConfigs.length - 1} duplicate active configs`
      );
    }
  } catch (error) {
    console.error("Error cleaning up duplicate configs:", error);
  }
};

// Método para obtener configuración pública (para la landing)
landingConfigSchema.methods.getPublicConfig = function () {
  return {
    siteName: this.siteName,
    tagline: this.tagline,
    description: this.description,
    logo: this.logo,
    favicon: this.favicon,
    seo: {
      title: this.seoTitle,
      description: this.seoDescription,
      keywords: this.seoKeywords,
      ogImage: this.ogImage,
      canonicalUrl: this.canonicalUrl,
    },
    theme: this.theme,
    maintenance: {
      isActive: this.maintenance.isActive,
      message: this.maintenance.message,
    },
  };
};

module.exports = mongoose.model("LandingConfig", landingConfigSchema);
