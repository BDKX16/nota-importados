"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Footer } from "@/components/footer";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  // Productos
  {
    question: "¿Qué tipo de productos manejan?",
    answer:
      "En Nota Importados nos especializamos en productos importados de alta calidad: perfumes de lujo, productos de cuidado personal, fragancias exclusivas y accesorios premium. Trabajamos con marcas reconocidas internacionalmente para garantizar autenticidad y calidad.",
    category: "productos",
  },
  {
    question: "¿Los productos son originales?",
    answer:
      "Sí, absolutamente. Todos nuestros productos son 100% originales y auténticos. Trabajamos directamente con distribuidores autorizados y tenemos certificados de autenticidad para cada marca que manejamos.",
    category: "productos",
  },
  {
    question: "¿Tienen garantía los productos?",
    answer:
      "Todos nuestros productos cuentan con garantía de calidad. Los perfumes y fragancias tienen garantía de autenticidad y calidad. Para más detalles, consulta nuestra página de garantía.",
    category: "productos",
  },

  // Envíos
  {
    question: "¿A qué zonas realizan envíos?",
    answer:
      "Realizamos envíos a toda Argentina. Para CABA y GBA los envíos son gratuitos en compras superiores a $50.000. Para el interior del país, consultamos disponibilidad y tarifas según la ubicación.",
    category: "envios",
  },
  {
    question: "¿Cuánto demora el envío?",
    answer:
      "En CABA y GBA: 24-48 horas. Interior del país: 3-7 días hábiles según la ubicación. Todos los envíos incluyen número de seguimiento.",
    category: "envios",
  },
  {
    question: "¿Puedo cambiar la dirección de envío?",
    answer:
      "Sí, puedes cambiar la dirección mientras el pedido no haya sido despachado. Contáctanos inmediatamente para realizar el cambio.",
    category: "envios",
  },

  // Pagos
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos MercadoPago, transferencias bancarias, tarjetas de crédito y débito. También aceptamos pagos en efectivo para entregas en CABA.",
    category: "pagos",
  },
  {
    question: "¿Puedo pagar en cuotas?",
    answer:
      "Sí, a través de MercadoPago puedes financiar tu compra en hasta 12 cuotas con tarjetas de crédito participantes.",
    category: "pagos",
  },
  {
    question: "¿Es seguro comprar en su sitio?",
    answer:
      "Completamente seguro. Utilizamos encriptación SSL y trabajamos con procesadores de pago certificados. Nunca almacenamos datos de tarjetas de crédito.",
    category: "pagos",
  },

  // Devoluciones
  {
    question: "¿Puedo devolver un producto?",
    answer:
      "Sí, aceptamos devoluciones dentro de los 30 días posteriores a la compra, siempre que el producto esté sin usar y en su empaque original.",
    category: "devoluciones",
  },
  {
    question: "¿Cómo inicio una devolución?",
    answer:
      "Contáctanos a través de nuestro formulario de contacto o WhatsApp indicando el número de pedido y motivo de la devolución. Te guiaremos en el proceso.",
    category: "devoluciones",
  },

  // Cuenta
  {
    question: "¿Necesito crear una cuenta para comprar?",
    answer:
      "No es obligatorio, pero recomendamos crear una cuenta para poder seguir tus pedidos, acceder a ofertas exclusivas y tener un historial de compras.",
    category: "cuenta",
  },
  {
    question: "¿Cómo puedo seguir mi pedido?",
    answer:
      "Con una cuenta creada, puedes seguir tu pedido desde 'Mis Pedidos' en tu perfil. También enviamos actualizaciones por email con el número de seguimiento.",
    category: "cuenta",
  },
];

const categories = [
  { id: "todos", name: "Todas las preguntas" },
  { id: "productos", name: "Productos" },
  { id: "envios", name: "Envíos" },
  { id: "pagos", name: "Pagos" },
  { id: "devoluciones", name: "Devoluciones" },
  { id: "cuenta", name: "Mi Cuenta" },
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const filteredFAQs =
    selectedCategory === "todos"
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Preguntas Frecuentes
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Encuentra respuestas a las preguntas más comunes sobre nuestros
              productos y servicios
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-foreground pr-4">
                  {faq.question}
                </h3>
                {openFAQ === index ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {openFAQ === index && (
                <div className="px-6 pb-4">
                  <div className="border-t border-border pt-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            ¿No encontraste lo que buscabas?
          </h2>
          <p className="text-muted-foreground mb-6">
            Nuestro equipo está aquí para ayudarte con cualquier consulta
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contacto"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Contactar Soporte
            </a>
            <a
              href="https://wa.me/5491127060002"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
