"use client";

import { useState } from "react";
import { Cookie, Settings, ShieldCheck, Eye } from "lucide-react";
import { Footer } from "@/components/footer";

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be changed
    analytics: false,
  });

  const storageTypes = [
    {
      icon: ShieldCheck,
      title: "Almacenamiento Local Esencial",
      key: "essential",
      required: true,
      description:
        "Datos esenciales para el funcionamiento del sitio web almacenados en tu navegador",
      examples: [
        "Carrito de compras (productos seleccionados)",
        "Datos de sesión del usuario (token de autenticación)",
        "Información del perfil de usuario",
        "Configuraciones de checkout temporal",
        "Caché de imágenes para mejor rendimiento",
      ],
      storage: "localStorage y sessionStorage",
      duration: "Hasta que limpies el navegador o cierres sesión",
      location: "Tu dispositivo (no se envían a nuestros servidores)",
    },
    {
      icon: Eye,
      title: "Cookies de Análisis (Opcional)",
      key: "analytics",
      required: false,
      description: "Cookies de terceros para entender el uso del sitio web",
      examples: [
        "Google Analytics (si está habilitado)",
        "Métricas de rendimiento del sitio",
        "Estadísticas de navegación anónimas",
      ],
      storage: "Cookies del navegador",
      duration: "Hasta 2 años",
      location: "Servidores de Google Analytics",
    },
  ];

  const handlePreferenceChange = (key: string, value: boolean) => {
    if (key === "essential") return; // Cannot change essential storage

    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const acceptAll = () => {
    setPreferences({
      essential: true,
      analytics: true,
    });
  };

  const rejectOptional = () => {
    setPreferences({
      essential: true,
      analytics: false,
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
              Política de Almacenamiento de Datos
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Información sobre cómo almacenamos datos en tu navegador para
              mejorar tu experiencia
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Última actualización: 17 de septiembre de 2025
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introducción */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Cómo Almacenamos Información en Tu Dispositivo
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            En Nota Importados utilizamos principalmente{" "}
            <strong>almacenamiento local</strong> (localStorage) en tu navegador
            para guardar información esencial como tu carrito de compras y datos
            de sesión. Esta información se mantiene únicamente en tu dispositivo
            y nos permite ofrecerte una experiencia fluida sin interrupciones.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong>No utilizamos cookies tradicionales de seguimiento</strong>{" "}
            para marketing o publicidad. Nuestra política se enfoca en la
            privacidad y solo almacenamos lo estrictamente necesario para el
            funcionamiento del sitio web.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              ¿Qué significa esto para ti?
            </h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Tu carrito se mantiene aunque cierres el navegador</li>
              <li>• No necesitas volver a iniciar sesión constantemente</li>
              <li>• No hay seguimiento publicitario invasivo</li>
              <li>
                • Puedes controlar completamente esta información desde tu
                navegador
              </li>
            </ul>
          </div>
        </div>

        {/* Storage Types */}
        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Cómo Almacenamos Información en Tu Navegador
          </h2>

          {storageTypes.map((type, index) => (
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

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Qué información almacenamos:
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            Tipo de almacenamiento:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {type.storage}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            Duración:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {type.duration}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-foreground mb-1">
                            Ubicación:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {type.location}
                          </p>
                        </div>
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
            Gestionar Preferencias de Almacenamiento
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            El almacenamiento esencial no se puede desactivar ya que es
            necesario para el funcionamiento básico del carrito y la sesión.
            Solo las funciones de análisis son opcionales.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={acceptAll}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Permitir Análisis
            </button>
            <button
              onClick={rejectOptional}
              className="bg-muted text-muted-foreground hover:bg-muted/80 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Solo Almacenamiento Esencial
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
            Utilizamos servicios externos que pueden utilizar sus propias
            tecnologías de seguimiento:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">
                MercadoPago
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Para procesar pagos de forma segura. MercadoPago puede utilizar
                sus propias cookies durante el proceso de checkout.
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

            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">
                Google Analytics (Opcional)
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Solo si aceptas cookies de análisis. Nos ayuda a entender cómo
                los usuarios interactúan con nuestro sitio.
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
          </div>
        </div>

        {/* Browser Controls */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Control desde tu Navegador
          </h2>
          <p className="text-muted-foreground mb-4">
            Puedes gestionar el almacenamiento local directamente desde tu
            navegador:
          </p>

          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                🛠️ Limpiar Almacenamiento Local
              </h3>
              <p className="text-blue-800 text-sm mb-2">
                Para borrar todos los datos almacenados por nuestro sitio:
              </p>
              <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
                <li>Abre las herramientas de desarrollador (F12)</li>
                <li>Ve a la pestaña "Application" o "Almacenamiento"</li>
                <li>Busca "localStorage" y encuentra "nota-importados.com"</li>
                <li>Borra las entradas "cart", "userData", etc.</li>
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2">
                ⚠️ Consecuencias de borrar datos
              </h3>
              <ul className="text-amber-800 text-sm space-y-1 list-disc list-inside">
                <li>Perderás todos los productos en tu carrito</li>
                <li>Tendrás que iniciar sesión nuevamente</li>
                <li>Se resetearán tus preferencias del sitio</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "Chrome",
                link: "https://support.google.com/chrome/answer/2392709",
              },
              {
                name: "Firefox",
                link: "https://support.mozilla.org/en-US/kb/storage",
              },
              {
                name: "Safari",
                link: "https://support.apple.com/guide/safari/manage-website-data-sfri11471/mac",
              },
              {
                name: "Edge",
                link: "https://support.microsoft.com/en-us/microsoft-edge/view-and-delete-browser-history-in-microsoft-edge-00cf7943-a9e1-975a-a33d-ac10ce454ca4",
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
            Si tienes dudas sobre cómo manejamos el almacenamiento de datos o
            necesitas ayuda para gestionar tu información, contáctanos.
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
