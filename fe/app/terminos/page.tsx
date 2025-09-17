import { FileText, Scale, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/footer";

export default function TerminosPage() {
  const sections = [
    {
      title: "1. Definiciones",
      content: [
        '• "Nota Importados" se refiere a la empresa prestadora de servicios.',
        '• "Usuario" o "Cliente" se refiere a la persona que utiliza nuestros servicios.',
        '• "Productos" se refiere a perfumes, fragancias y productos de cuidado personal.',
        '• "Servicios" incluye la venta online, entrega y soporte postventa.',
      ],
    },
    {
      title: "2. Aceptación de Términos",
      content: [
        "Al utilizar nuestro sitio web y servicios, usted acepta estar sujeto a estos términos y condiciones.",
        "Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.",
        "Nos reservamos el derecho de modificar estos términos en cualquier momento.",
        "Los cambios serán efectivos inmediatamente después de su publicación en el sitio web.",
      ],
    },
    {
      title: "3. Uso del Sitio Web",
      content: [
        "Nuestro sitio web está destinado para uso personal y no comercial.",
        "Está prohibido utilizar el sitio para actividades ilegales o no autorizadas.",
        "No debe interferir con el funcionamiento del sitio web o servidores.",
        "Debe proporcionar información veraz y actualizada al registrarse.",
      ],
    },
    {
      title: "4. Productos y Precios",
      content: [
        "Todos los productos están sujetos a disponibilidad.",
        "Los precios pueden cambiar sin previo aviso.",
        "Nos reservamos el derecho de limitar las cantidades de compra.",
        "Las imágenes de productos son referenciales y pueden diferir del producto real.",
      ],
    },
    {
      title: "5. Proceso de Compra",
      content: [
        "Al realizar un pedido, usted hace una oferta de compra de los productos seleccionados.",
        "Todas las órdenes están sujetas a confirmación y aceptación por nuestra parte.",
        "Nos reservamos el derecho de rechazar cualquier pedido por cualquier motivo.",
        "La confirmación de pedido se enviará por email una vez procesado el pago.",
      ],
    },
    {
      title: "6. Pagos",
      content: [
        "Aceptamos los métodos de pago indicados en nuestro sitio web.",
        "El pago debe completarse antes del envío de los productos.",
        "Los precios incluyen impuestos aplicables según la legislación vigente.",
        "En caso de pagos con tarjeta, se requiere autorización del emisor.",
      ],
    },
    {
      title: "7. Envíos y Entregas",
      content: [
        "Los tiempos de entrega son estimativos y pueden variar.",
        "El riesgo de pérdida o daño se transfiere al cliente al momento de la entrega.",
        "Es responsabilidad del cliente proporcionar una dirección de entrega correcta.",
        "Los costos de envío se calcularán según la zona de destino.",
      ],
    },
    {
      title: "8. Devoluciones y Reembolsos",
      content: [
        "Las devoluciones deben solicitarse dentro de los 30 días posteriores a la compra.",
        "Los productos deben estar sin usar y en su empaque original.",
        "Los gastos de envío de devolución corren por cuenta del cliente.",
        "Los reembolsos se procesarán en el mismo método de pago utilizado.",
      ],
    },
    {
      title: "9. Propiedad Intelectual",
      content: [
        "Todo el contenido del sitio web es propiedad de Nota Importados o sus licenciantes.",
        "Está prohibida la reproducción, distribución o modificación del contenido.",
        "Las marcas registradas mostradas pertenecen a sus respectivos propietarios.",
        "Cualquier uso no autorizado constituye una violación de derechos de autor.",
      ],
    },
    {
      title: "10. Limitación de Responsabilidad",
      content: [
        "Nota Importados no será responsable por daños indirectos o consecuenciales.",
        "Nuestra responsabilidad se limita al valor del producto o servicio contratado.",
        "No garantizamos que el servicio sea ininterrumpido o libre de errores.",
        "El usuario utiliza el sitio web bajo su propio riesgo.",
      ],
    },
    {
      title: "11. Privacidad y Datos Personales",
      content: [
        "El tratamiento de datos personales se rige por nuestra Política de Privacidad.",
        "Al utilizar nuestros servicios, acepta el procesamiento de sus datos personales.",
        "Implementamos medidas de seguridad para proteger su información.",
        "Puede solicitar acceso, rectificación o eliminación de sus datos personales.",
      ],
    },
    {
      title: "12. Ley Aplicable y Jurisdicción",
      content: [
        "Estos términos se rigen por las leyes de la República Argentina.",
        "Cualquier disputa será resuelta por los tribunales competentes de Buenos Aires.",
        "En caso de conflicto, prevalecerá la versión en español de estos términos.",
        "Si alguna cláusula es inválida, el resto de los términos permanecerá vigente.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <FileText className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Términos de uso de nuestros servicios y plataforma digital
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Última actualización: 15 de septiembre de 2025
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introducción */}
        <div className="bg-card border border-border rounded-lg p-8 mb-12">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Scale className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                Introducción
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Estos términos y condiciones regulan el uso del sitio web y
                servicios de Nota Importados. Al acceder y utilizar nuestros
                servicios, usted acepta cumplir con estos términos. Por favor,
                léalos cuidadosamente antes de realizar cualquier compra.
              </p>
            </div>
          </div>
        </div>

        {/* Términos */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.content.map((item, idx) => (
                  <p
                    key={idx}
                    className="text-muted-foreground leading-relaxed"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contacto Legal */}
        <div className="mt-12 bg-card border border-border rounded-lg p-8">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-3">
                Información Legal
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong>Razón Social:</strong> Nota Importados S.A.
                </p>
                <p>
                  <strong>Domicilio Legal:</strong> Buenos Aires, Argentina
                </p>
                <p>
                  <strong>Email Legal:</strong> notaimportados@gmail.com
                </p>
                <p>
                  <strong>Defensa del Consumidor:</strong> En caso de disputa,
                  puede contactar a la Dirección Nacional de Defensa del
                  Consumidor o acceder a los mecanismos alternativos de
                  resolución de conflictos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Aceptación */}
        <div className="mt-8 text-center bg-primary/5 border border-primary/20 rounded-lg p-6">
          <p className="text-muted-foreground">
            Al continuar utilizando nuestros servicios, usted confirma que ha
            leído, entendido y acepta estar sujeto a estos términos y
            condiciones.
          </p>
          <div className="mt-4 space-x-4">
            <a
              href="/privacidad"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Política de Privacidad
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href="/cookies"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Política de Cookies
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href="/contacto"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Contacto Legal
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
