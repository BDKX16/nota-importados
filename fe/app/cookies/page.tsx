"use client";

import { useState } from "react";
import { Cookie, Settings, ShieldCheck, Eye } from "lucide-react";
import { Footer } from "@/components/footer";

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be changed
    analytics: false,
    marketing: false,
    personalization: false,
  });

  const cookieTypes = [
    {
      icon: ShieldCheck,
      title: "Cookies Necesarias",
      key: "necessary",
      required: true,
      description: "Esenciales para el funcionamiento básico del sitio web",
      examples: [
        "Mantener la sesión del usuario",
        "Recordar productos en el carrito",
        "Configuraciones de seguridad",
        "Preferencias de idioma",
      ],
      duration: "Sesión o hasta 1 año",
    },
    {
      icon: Eye,
      title: "Cookies de Análisis",
      key: "analytics",
      required: false,
      description: "Nos ayudan a entender cómo interactúas con nuestro sitio",
      examples: [
        "Páginas más visitadas",
        "Tiempo de permanencia",
        "Rutas de navegación",
        "Errores encontrados",
      ],
      duration: "Hasta 2 años",
    },
    {
      icon: Settings,
      title: "Cookies de Marketing",
      key: "marketing",
      required: false,
      description: "Para mostrarte publicidad relevante y medir campañas",
      examples: [
        "Anuncios personalizados",
        "Seguimiento de conversiones",
        "Remarketing",
        "Análisis de audiencia",
      ],
      duration: "Hasta 1 año",
    },
    {
      icon: Cookie,
      title: "Cookies de Personalización",
      key: "personalization",
      required: false,
      description: "Para personalizar tu experiencia en el sitio",
      examples: [
        "Productos recomendados",
        "Contenido personalizado",
        "Preferencias de usuario",
        "Historial de navegación",
      ],
      duration: "Hasta 6 meses",
    },
  ];

  const handlePreferenceChange = (key: string, value: boolean) => {
    if (key === "necessary") return; // Cannot change necessary cookies

    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const acceptAll = () => {
    setPreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    });
  };

  const rejectOptional = () => {
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    });
  };

  const savePreferences = () => {
    // Here you would save preferences to localStorage or send to server
    console.log("Saving preferences:", preferences);
    alert("Preferencias guardadas correctamente");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Cookie className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Política de Cookies
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Información sobre cómo utilizamos las cookies y cómo puedes
              gestionarlas
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Última actualización: 15 de septiembre de 2025
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introducción */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            ¿Qué son las cookies?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Las cookies son pequeños archivos de texto que se almacenan en tu
            dispositivo cuando visitas un sitio web. Nos ayudan a mejorar tu
            experiencia, recordar tus preferencias y entender cómo utilizas
            nuestro sitio.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            En Nota Importados utilizamos cookies para ofrecerte una experiencia
            personalizada y mejorar continuamente nuestros servicios. Puedes
            controlar qué cookies aceptas a través del panel de configuración.
          </p>
        </div>

        {/* Cookie Types */}
        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Tipos de Cookies que Utilizamos
          </h2>

          {cookieTypes.map((type, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <type.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {type.title}
                      </h3>
                      {type.required && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          Necesarias
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {type.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Ejemplos de uso:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {type.examples.map((example, idx) => (
                            <li
                              key={idx}
                              className="flex items-start space-x-2"
                            >
                              <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Duración:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {type.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={
                        preferences[type.key as keyof typeof preferences]
                      }
                      onChange={(e) =>
                        handlePreferenceChange(type.key, e.target.checked)
                      }
                      disabled={type.required}
                      className="w-5 h-5 text-primary border-border rounded focus:ring-primary focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-muted-foreground">
                      {type.required ? "Obligatoria" : "Opcional"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preference Controls */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">
            Gestionar Preferencias
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Puedes controlar qué cookies aceptas. Las cookies necesarias no se
            pueden desactivar ya que son esenciales para el funcionamiento del
            sitio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={acceptAll}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Aceptar Todas
            </button>
            <button
              onClick={rejectOptional}
              className="bg-muted text-muted-foreground hover:bg-muted/80 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Solo Necesarias
            </button>
            <button
              onClick={savePreferences}
              className="bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Guardar Preferencias
            </button>
          </div>
        </div>

        {/* Third Party Services */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Servicios de Terceros
          </h2>
          <p className="text-muted-foreground mb-4">
            Utilizamos algunos servicios de terceros que pueden instalar sus
            propias cookies:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">
                Google Analytics
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Para analizar el tráfico del sitio web y mejorar la experiencia
                del usuario.
              </p>
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 text-sm"
              >
                Política de Privacidad →
              </a>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">
                MercadoPago
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Para procesar pagos de forma segura y gestionar transacciones.
              </p>
              <a
                href="https://www.mercadopago.com.ar/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 text-sm"
              >
                Política de Privacidad →
              </a>
            </div>
          </div>
        </div>

        {/* Browser Controls */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Control desde tu Navegador
          </h2>
          <p className="text-muted-foreground mb-4">
            También puedes gestionar las cookies directamente desde la
            configuración de tu navegador:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "Chrome",
                link: "https://support.google.com/chrome/answer/95647",
              },
              {
                name: "Firefox",
                link: "https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop",
              },
              {
                name: "Safari",
                link: "https://support.apple.com/en-us/HT201265",
              },
              {
                name: "Edge",
                link: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
              },
            ].map((browser) => (
              <a
                key={browser.name}
                href={browser.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors"
              >
                <p className="font-medium text-foreground">{browser.name}</p>
                <p className="text-sm text-muted-foreground">Ver guía →</p>
              </a>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            ¿Tienes Preguntas?
          </h2>
          <p className="text-muted-foreground mb-4">
            Si tienes dudas sobre nuestra política de cookies, no dudes en
            contactarnos
          </p>
          <a
            href="/contacto"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Contactar Soporte
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
