import { ShieldCheck, Truck, RotateCcw, CheckCircle } from "lucide-react";
import { Footer } from "@/components/footer";

export default function GarantiaPage() {
  const garantias = [
    {
      icon: ShieldCheck,
      title: "Garantía de Autenticidad",
      description: "Todos nuestros productos son 100% originales y auténticos.",
      details: [
        "Certificados de autenticidad disponibles",
        "Trabajamos con distribuidores autorizados",
        "Verificación de códigos de barras y hologramas",
        "Devolución inmediata si se comprueba falsificación",
      ],
    },
    {
      icon: CheckCircle,
      title: "Garantía de Calidad",
      description:
        "Garantizamos la calidad y estado de todos nuestros productos.",
      details: [
        "Productos en perfecto estado de conservación",
        "Fechas de vencimiento vigentes",
        "Empaque original e intacto",
        "Almacenamiento en condiciones óptimas",
      ],
    },
    {
      icon: Truck,
      title: "Garantía de Envío",
      description: "Tu pedido llegará en perfectas condiciones.",
      details: [
        "Embalaje seguro y protegido",
        "Seguro de envío incluido",
        "Seguimiento en tiempo real",
        "Reposición gratuita por daños en tránsito",
      ],
    },
    {
      icon: RotateCcw,
      title: "Garantía de Satisfacción",
      description: "Si no estás satisfecho, te devolvemos tu dinero.",
      details: [
        "30 días para devoluciones",
        "Reembolso completo del precio",
        "Sin preguntas innecesarias",
        "Proceso de devolución simple",
      ],
    },
  ];

  const condiciones = [
    {
      title: "Período de Garantía",
      items: [
        "Perfumes y fragancias: 30 días desde la compra",
        "Productos de cuidado personal: 30 días desde la compra",
        "Accesorios: 30 días desde la compra",
      ],
    },
    {
      title: "Condiciones para Hacer Válida la Garantía",
      items: [
        "Producto sin usar y en su empaque original",
        "Comprobante de compra disponible",
        "Producto en perfecto estado",
        "No haber transcurrido el período de garantía",
      ],
    },
    {
      title: "Qué Cubre la Garantía",
      items: [
        "Productos defectuosos de fábrica",
        "Productos dañados durante el envío",
        "Productos que no coinciden con la descripción",
        "Productos falsificados o no originales",
      ],
    },
    {
      title: "Qué NO Cubre la Garantía",
      items: [
        "Mal uso del producto",
        "Daños por almacenamiento inadecuado",
        "Productos utilizados parcialmente",
        "Cambio de opinión sin defecto del producto",
      ],
    },
  ];

  const proceso = [
    {
      paso: "1",
      titulo: "Contacta con nosotros",
      descripcion: "Escríbenos por WhatsApp, email o formulario de contacto",
    },
    {
      paso: "2",
      titulo: "Proporciona información",
      descripcion:
        "Número de pedido, fotos del producto y descripción del problema",
    },
    {
      paso: "3",
      titulo: "Evaluación",
      descripcion: "Nuestro equipo evalúa el caso en un máximo de 24 horas",
    },
    {
      paso: "4",
      titulo: "Resolución",
      descripcion: "Reemplazo, reembolso o solución según corresponda",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Garantía de Productos
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tu satisfacción es nuestra prioridad. Conoce nuestras garantías y
              políticas de protección al cliente
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tipos de Garantía */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Nuestras Garantías
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {garantias.map((garantia, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                    <garantia.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {garantia.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {garantia.description}
                    </p>
                    <ul className="space-y-2">
                      {garantia.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Condiciones y Términos */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Términos y Condiciones
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {condiciones.map((condicion, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {condicion.title}
                </h3>
                <ul className="space-y-3">
                  {condicion.items.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Proceso de Garantía */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Proceso de Garantía
          </h2>

          <div className="relative">
            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
              {proceso.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.paso}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.titulo}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Información de Contacto para Garantías */}
        <section className="bg-card border border-border rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            ¿Necesitas Hacer Valer tu Garantía?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Nuestro equipo de atención al cliente está listo para ayudarte con
            cualquier problema relacionado con tu compra
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5491127060002"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
              WhatsApp
            </a>

            <a
              href="/contacto"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Contactar Soporte
            </a>

            <a
              href="mailto:notaimportados@gmail.com"
              className="inline-flex items-center justify-center bg-muted text-muted-foreground hover:bg-muted/80 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Email Garantías
            </a>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Tiempo de respuesta: 24-48 horas • Resolución garantizada
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
