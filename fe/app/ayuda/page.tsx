import {
  HelpCircle,
  MessageCircle,
  Truck,
  CreditCard,
  User,
  ShoppingBag,
  Phone,
  Mail,
} from "lucide-react";
import { Footer } from "@/components/footer";

export default function AyudaPage() {
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
      link: "/ayuda/pedidos",
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
      link: "/ayuda/envios",
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
      link: "/ayuda/pagos",
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
      link: "/ayuda/cuenta",
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
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="¿En qué podemos ayudarte?"
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Help Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Categorías de Ayuda
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
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

                  <button className="text-primary hover:text-primary/80 font-medium text-sm">
                    Ver más →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Help */}
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
