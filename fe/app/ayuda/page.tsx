"use client";

import { useState, useEffect } from "react";
import {
  HelpCircle,
  MessageCircle,
  Truck,
  CreditCard,
  User,
  ShoppingBag,
  Phone,
  Mail,
  Search,
  X,
} from "lucide-react";
import { Footer } from "@/components/footer";

export default function AyudaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filteredFAQs, setFilteredFAQs] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Base de datos completa de FAQ
  const allFAQs = [
    // Pedidos
    {
      question: "¿Cómo puedo seguir mi pedido?",
      answer:
        'Ingresa a tu cuenta y ve a "Mis Pedidos" para ver el estado en tiempo real. También enviamos actualizaciones por email con número de seguimiento.',
      category: "pedidos",
      keywords: [
        "seguir",
        "pedido",
        "tracking",
        "estado",
        "rastrear",
        "seguimiento",
      ],
    },
    {
      question: "¿Cómo buscar productos?",
      answer:
        "Usa la barra de búsqueda en la parte superior o navega por categorías. Puedes filtrar por marca, precio y tipo de producto.",
      category: "pedidos",
      keywords: ["buscar", "productos", "encontrar", "filtro", "categoría"],
    },
    {
      question: "¿Cómo agregar productos al carrito?",
      answer:
        'Haz clic en el botón "Agregar al carrito" en la página del producto. Puedes ajustar la cantidad antes de agregarlo.',
      category: "pedidos",
      keywords: ["carrito", "agregar", "comprar", "cantidad"],
    },
    {
      question: "¿Puedo cambiar o cancelar mi pedido?",
      answer:
        "Sí, antes de que sea despachado. Contáctanos inmediatamente a través de WhatsApp o email para realizar cambios.",
      category: "pedidos",
      keywords: ["cambiar", "cancelar", "pedido", "modificar"],
    },

    // Envíos
    {
      question: "¿Cuánto demora el envío?",
      answer:
        "CABA y GBA: 24-48 horas. Interior del país: 3-7 días hábiles. Todos los envíos incluyen seguimiento.",
      category: "envios",
      keywords: ["envío", "demora", "tiempo", "entrega", "días"],
    },
    {
      question: "¿A qué zonas realizan envíos?",
      answer:
        "Realizamos envíos a toda Argentina. CABA y GBA gratis en compras +$50.000. Interior consultamos disponibilidad.",
      category: "envios",
      keywords: ["zonas", "envío", "argentina", "caba", "gba", "interior"],
    },
    {
      question: "¿Cómo funciona el envío gratis?",
      answer:
        "Envío gratuito en CABA y GBA para compras superiores a $50.000. Se aplica automáticamente en el checkout.",
      category: "envios",
      keywords: ["envío", "gratis", "gratuito", "caba", "gba"],
    },
    {
      question: "¿Puedo cambiar la dirección de envío?",
      answer:
        "Sí, mientras el pedido no haya sido despachado. Contáctanos inmediatamente para hacer el cambio.",
      category: "envios",
      keywords: ["dirección", "cambiar", "envío", "domicilio"],
    },

    // Pagos
    {
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "MercadoPago, transferencias bancarias, tarjetas de crédito/débito y efectivo para entregas en CABA.",
      category: "pagos",
      keywords: [
        "pago",
        "métodos",
        "mercadopago",
        "tarjeta",
        "transferencia",
        "efectivo",
      ],
    },
    {
      question: "¿Puedo pagar en cuotas?",
      answer:
        "Sí, a través de MercadoPago puedes financiar hasta 12 cuotas con tarjetas de crédito participantes.",
      category: "pagos",
      keywords: ["cuotas", "financiar", "mercadopago", "crédito"],
    },
    {
      question: "¿Es seguro comprar en su sitio?",
      answer:
        "Completamente seguro. Usamos encriptación SSL y procesadores certificados. No almacenamos datos de tarjetas.",
      category: "pagos",
      keywords: ["seguro", "seguridad", "ssl", "tarjeta", "datos"],
    },
    {
      question: "¿Qué hago si mi pago fue rechazado?",
      answer:
        "Verifica los datos de tu tarjeta, límites disponibles o intenta con otro método de pago. Contáctanos si persiste el problema.",
      category: "pagos",
      keywords: ["pago", "rechazado", "error", "tarjeta", "problema"],
    },

    // Productos
    {
      question: "¿Los productos son originales?",
      answer:
        "Sí, todos nuestros productos son 100% auténticos con garantía. Trabajamos con distribuidores autorizados.",
      category: "productos",
      keywords: ["originales", "auténticos", "garantía", "genuinos"],
    },
    {
      question: "¿Qué tipo de productos manejan?",
      answer:
        "Perfumes de lujo, fragancias exclusivas, productos de cuidado personal y accesorios premium de marcas internacionales.",
      category: "productos",
      keywords: ["productos", "perfumes", "fragancias", "cuidado", "premium"],
    },
    {
      question: "¿Tienen garantía los productos?",
      answer:
        "Todos los productos tienen garantía de calidad y autenticidad. Consulta nuestra página de garantía para detalles.",
      category: "productos",
      keywords: ["garantía", "calidad", "productos"],
    },
    {
      question: "¿Puedo devolver un producto?",
      answer:
        "Sí, aceptamos devoluciones dentro de 30 días si el producto está sin usar y en empaque original.",
      category: "productos",
      keywords: ["devolver", "devolución", "cambio", "30 días"],
    },

    // Cuenta
    {
      question: "¿Necesito crear una cuenta para comprar?",
      answer:
        "No es obligatorio, pero recomendado para seguir pedidos, ofertas exclusivas e historial de compras.",
      category: "cuenta",
      keywords: ["cuenta", "registro", "comprar", "obligatorio"],
    },
    {
      question: "¿Cómo recupero mi contraseña?",
      answer:
        'Haz clic en "¿Olvidaste tu contraseña?" en la página de login y sigue las instrucciones enviadas a tu email.',
      category: "cuenta",
      keywords: ["contraseña", "recuperar", "olvidé", "reset"],
    },
    {
      question: "¿Cómo actualizo mi información personal?",
      answer:
        'Ve a "Mi Perfil" en tu cuenta para actualizar datos personales, dirección y preferencias.',
      category: "cuenta",
      keywords: ["actualizar", "información", "perfil", "datos"],
    },
    {
      question: "¿Cómo veo mi historial de pedidos?",
      answer:
        'Ingresa a tu cuenta y ve a "Mis Pedidos" para ver todo tu historial de compras y descargar facturas.',
      category: "cuenta",
      keywords: ["historial", "pedidos", "compras", "facturas"],
    },
  ];

  // Función de búsqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTerms = query.toLowerCase().trim().split(" ");

    const results = allFAQs
      .filter((faq) => {
        const searchText = (
          faq.question +
          " " +
          faq.answer +
          " " +
          faq.keywords.join(" ")
        ).toLowerCase();
        return searchTerms.some((term) => searchText.includes(term));
      })
      .sort((a, b) => {
        // Priorizar coincidencias en la pregunta
        const aQuestionMatch = searchTerms.some((term) =>
          a.question.toLowerCase().includes(term)
        );
        const bQuestionMatch = searchTerms.some((term) =>
          b.question.toLowerCase().includes(term)
        );

        if (aQuestionMatch && !bQuestionMatch) return -1;
        if (!aQuestionMatch && bQuestionMatch) return 1;
        return 0;
      });

    setSearchResults(results.slice(0, 5)); // Mostrar máximo 5 resultados
  };

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  // Función para seleccionar categoría
  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    const filtered = allFAQs.filter((faq) => faq.category === category);
    setFilteredFAQs(filtered);
    setIsSearching(false);
    setSearchQuery("");
  };

  // Función para limpiar filtro de categoría
  const clearCategoryFilter = () => {
    setSelectedCategory(null);
    setFilteredFAQs([]);
  };

  // Remover el useEffect ya que no usamos URL params
  const helpCategories = [
    {
      icon: ShoppingBag,
      title: "Realizar Pedidos",
      description: "Aprende cómo navegar nuestra tienda y realizar compras",
      topics: [
        "Cómo buscar productos",
        "Agregar productos al carrito",
        "Proceso de checkout",
        "Métodos de pago disponibles",
      ],
      category: "pedidos",
    },
    {
      icon: Truck,
      title: "Envíos y Entregas",
      description: "Información sobre tiempos de entrega y seguimiento",
      topics: [
        "Zonas de entrega",
        "Tiempos de envío",
        "Seguimiento de pedidos",
        "Políticas de envío",
      ],
      category: "envios",
    },
    {
      icon: CreditCard,
      title: "Pagos y Facturación",
      description: "Todo sobre métodos de pago y facturación",
      topics: [
        "Métodos de pago aceptados",
        "Financiación disponible",
        "Problemas de pago",
        "Facturación y comprobantes",
      ],
      category: "pagos",
    },
    {
      icon: User,
      title: "Mi Cuenta",
      description: "Gestiona tu perfil y configuración",
      topics: [
        "Crear cuenta",
        "Recuperar contraseña",
        "Actualizar información",
        "Historial de pedidos",
      ],
      category: "cuenta",
    },
  ];

  const quickHelp = [
    {
      question: "¿Cómo puedo seguir mi pedido?",
      answer:
        'Ingresa a tu cuenta y ve a "Mis Pedidos" para ver el estado en tiempo real.',
    },
    {
      question: "¿Cuánto demora el envío?",
      answer: "CABA y GBA: 24-48 horas. Interior: 3-7 días hábiles.",
    },
    {
      question: "¿Puedo cambiar o cancelar mi pedido?",
      answer: "Sí, antes de que sea despachado. Contáctanos inmediatamente.",
    },
    {
      question: "¿Los productos son originales?",
      answer: "Sí, todos nuestros productos son 100% auténticos con garantía.",
    },
  ];

  const contactOptions = [
    {
      icon: Phone,
      title: "Teléfono",
      description: "+54 9 11 27060002",
      detail: "Lun-Vie 9:00-18:00",
      action: "tel:+5491127060002",
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Chat en vivo",
      detail: "Respuesta inmediata",
      action: "https://wa.me/5491127060002",
      color: "bg-green-50 text-green-600 border-green-200",
    },
    {
      icon: Mail,
      title: "Email",
      description: "notaimportados@gmail.com",
      detail: "Respuesta en 24h",
      action: "mailto:notaimportados@gmail.com",
      color: "bg-gray-50 text-gray-600 border-gray-200",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Centro de Ayuda
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Encuentra respuestas rápidas o ponte en contacto con nuestro
              equipo de soporte
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="¿En qué podemos ayudarte? Ej: seguir pedido, métodos de pago..."
              className="w-full pl-10 pr-12 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-foreground text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="mt-4 bg-card border border-border rounded-lg shadow-lg">
              {searchResults.length > 0 ? (
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    Encontramos {searchResults.length} respuesta
                    {searchResults.length > 1 ? "s" : ""}
                  </h3>
                  <div className="space-y-4">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="border-b border-border last:border-b-0 pb-4 last:pb-0"
                      >
                        <h4 className="font-semibold text-foreground mb-2 text-sm">
                          {result.question}
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {result.answer}
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                          {result.category}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground mb-2">
                      ¿No resolvió tu duda?
                    </p>
                    <div className="flex gap-2 justify-center">
                      <a
                        href="/contacto"
                        className="text-primary hover:text-primary/80 text-xs font-medium"
                      >
                        Ir a Contacto
                      </a>
                      <span className="text-muted-foreground text-xs">•</span>
                      <a
                        href="/faq"
                        className="text-primary hover:text-primary/80 text-xs font-medium"
                      >
                        Ver todas las FAQ
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="text-muted-foreground mb-4">
                    <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm mb-2">
                      No encontramos respuestas para "{searchQuery}"
                    </p>
                    <p className="text-xs">
                      Pero nuestro equipo puede ayudarte
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <a
                      href="/contacto"
                      className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                      Ir a Contacto
                    </a>
                    <a
                      href="https://wa.me/5491127060002"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Categories - Only show when not searching and no category filter */}
        {!isSearching && !selectedCategory && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Categorías de Ayuda
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {helpCategories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => selectCategory(category.category)}
                  className="block bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow text-left w-full"
                >
                  <div className="text-center">
                    <div className="bg-primary/10 p-3 rounded-lg inline-flex mb-4">
                      <category.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {category.description}
                    </p>

                    <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                      {category.topics.map((topic, idx) => (
                        <li key={idx}>• {topic}</li>
                      ))}
                    </ul>

                    <span className="text-primary hover:text-primary/80 font-medium text-sm">
                      Ver más →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Filtered FAQs by Category */}
        {selectedCategory && filteredFAQs.length > 0 && (
          <section className="mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  Preguntas sobre{" "}
                  {helpCategories.find(
                    (cat) => cat.category === selectedCategory
                  )?.title || selectedCategory}
                </h2>
                <button
                  onClick={clearCategoryFilter}
                  className="text-muted-foreground hover:text-foreground text-sm flex items-center space-x-1"
                >
                  <X className="h-4 w-4" />
                  <span>Limpiar filtro</span>
                </button>
              </div>

              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-lg p-6"
                  >
                    <h3 className="font-semibold text-foreground mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                      {faq.category}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={clearCategoryFilter}
                  className="inline-flex items-center justify-center border border-border hover:bg-accent px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Ver Todas las Categorías
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Quick Help - Only show when not searching and no category filter */}
        {!isSearching && !selectedCategory && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Preguntas Frecuentes
            </h2>

            <div className="max-w-3xl mx-auto space-y-4">
              {quickHelp.map((item, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <h3 className="font-semibold text-foreground mb-2">
                    {item.question}
                  </h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <a
                href="/faq"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Ver Todas las FAQ
              </a>
            </div>
          </section>
        )}

        {/* Contact Options */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            ¿Necesitas Más Ayuda?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {contactOptions.map((option, index) => (
              <a
                key={index}
                href={option.action}
                target={option.action.startsWith("http") ? "_blank" : undefined}
                rel={
                  option.action.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className={`block p-6 rounded-lg border-2 text-center hover:shadow-lg transition-all ${option.color}`}
              >
                <option.icon className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">{option.title}</h3>
                <p className="font-medium mb-1">{option.description}</p>
                <p className="text-sm opacity-75">{option.detail}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Troubleshooting Guide */}
        <section className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">
            Guía de Solución de Problemas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Problemas Comunes
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      No puedo completar mi pedido
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Verifica tu información de pago y dirección
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      No recibí mi confirmación
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Revisa tu bandeja de spam
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      Problema con el seguimiento
                    </p>
                    <p className="text-sm text-muted-foreground">
                      El número puede tardar 24h en activarse
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Consejos Útiles
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      Mantén actualizada tu información
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Email y dirección siempre al día
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      Guarda tu número de pedido
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Te ayudará en consultas futuras
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      Contacta pronto si hay problemas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mientras antes, mejor podemos ayudar
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              ¿Aún necesitas ayuda? Nuestro equipo está listo para asistirte
            </p>
            <a
              href="/contacto"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Contactar Soporte
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
