import {
  getSEOConfig,
  generateMetadata as generateSEOMetadata,
} from "@/lib/seo";
import type { Metadata } from "next";

interface PageMetadataConfig {
  title?: string;
  description?: string;
  image?: string;
  canonicalPath?: string;
  keywords?: string;
}

/**
 * Helper para generar metadata de páginas de forma rápida
 */
export async function generatePageMetadata(
  config: PageMetadataConfig = {}
): Promise<Metadata> {
  const seoConfig = await getSEOConfig();

  // Usar los keywords personalizados si se proporcionan, sino usar los del config global
  const finalSeoConfig = config.keywords
    ? { ...seoConfig, seoKeywords: config.keywords }
    : seoConfig;

  return generateSEOMetadata(
    finalSeoConfig,
    config.title,
    config.description,
    config.image,
    config.canonicalPath
  );
}

/**
 * Metadata predefinida para páginas comunes
 */
export const pageMetadataConfigs = {
  home: {
    canonicalPath: "/",
  },
  products: {
    title: "Productos",
    description:
      "Descubre nuestra selección de perfumes y productos de lujo importados. Fragancias exclusivas y productos premium.",
    canonicalPath: "/productos",
    keywords:
      "perfumes importados, fragancias de lujo, productos premium, perfumes originales, cosmética de lujo",
  },
  subscriptions: {
    title: "Suscripciones",
    description:
      "Planes de suscripción personalizados para recibir productos de lujo en casa. Entregas mensuales y descuentos exclusivos.",
    canonicalPath: "/suscripciones",
    keywords:
      "suscripción productos lujo, planes mensuales, entrega domicilio, perfumes",
  },
  checkout: {
    title: "Checkout",
    description:
      "Finaliza tu compra de forma segura. Acepta múltiples métodos de pago y entregas rápidas.",
    canonicalPath: "/checkout",
    keywords: "comprar perfumes, checkout seguro, pago online, entrega rápida",
  },
  profile: {
    title: "Mi Perfil",
    description:
      "Gestiona tu perfil, suscripciones y historial de pedidos. Personaliza tu experiencia.",
    canonicalPath: "/perfil",
    keywords:
      "perfil usuario, gestión cuenta, historial pedidos, suscripciones",
  },
  auth: {
    login: {
      title: "Iniciar Sesión",
      description: "Accede a tu cuenta para gestionar pedidos y suscripciones.",
      canonicalPath: "/auth/login",
      keywords: "login, iniciar sesión, acceso cuenta",
    },
    register: {
      title: "Registro",
      description: "Crea tu cuenta y únete a la comunidad Nota Importados.",
      canonicalPath: "/auth/registro",
      keywords: "registro, crear cuenta, unirse comunidad",
    },
  },
  admin: {
    title: "Administración",
    description:
      "Panel de administración para gestionar productos, pedidos y configuraciones.",
    canonicalPath: "/admin",
    keywords: "administración, panel admin, gestión productos",
  },
};

/**
 * Genera metadata usando configuraciones predefinidas
 */
export async function generatePredefinedMetadata(
  configKey: keyof typeof pageMetadataConfigs,
  subKey?: string
): Promise<Metadata> {
  let config: PageMetadataConfig = pageMetadataConfigs[
    configKey
  ] as PageMetadataConfig;

  // Manejar configuraciones anidadas como auth.login
  if (
    subKey &&
    typeof config === "object" &&
    config !== null &&
    subKey in config
  ) {
    config = (config as any)[subKey] as PageMetadataConfig;
  }

  return generatePageMetadata(config);
}
