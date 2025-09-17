import { ShieldCheck, Eye, Lock, User, FileText, Settings } from "lucide-react";
import { Footer } from "@/components/footer";

export default function PrivacidadPage() {
  const dataTypes = [
    {
      icon: User,
      title: "Información Personal",
      description: "Datos que nos proporcionas directamente",
      examples: [
        "Nombre y apellido",
        "Dirección de email",
        "Número de teléfono",
        "Dirección de entrega",
        "Fecha de nacimiento (opcional)",
      ],
    },
    {
      icon: Settings,
      title: "Información de Uso",
      description: "Datos sobre cómo utilizas nuestro sitio",
      examples: [
        "Páginas visitadas",
        "Productos vistos",
        "Tiempo de navegación",
        "Historial de compras",
        "Preferencias de usuario",
      ],
    },
    {
      icon: FileText,
      title: "Información Técnica",
      description: "Datos técnicos de tu dispositivo y navegador",
      examples: [
        "Dirección IP",
        "Tipo de navegador",
        "Sistema operativo",
        "Resolución de pantalla",
        "Cookies y tecnologías similares",
      ],
    },
  ];

  const purposes = [
    {
      title: "Procesamiento de Pedidos",
      description: "Para gestionar tus compras y entregas",
      details: [
        "Confirmar y procesar pedidos",
        "Gestionar pagos y facturación",
        "Coordinar entregas",
        "Proporcionar soporte postventa",
      ],
    },
    {
      title: "Comunicación",
      description: "Para mantenerte informado sobre tus pedidos",
      details: [
        "Confirmaciones de pedido",
        "Updates de estado de envío",
        "Notificaciones importantes",
        "Responder consultas de soporte",
      ],
    },
    {
      title: "Mejora del Servicio",
      description: "Para optimizar tu experiencia en nuestro sitio",
      details: [
        "Analizar patrones de uso",
        "Personalizar recomendaciones",
        "Mejorar la funcionalidad del sitio",
        "Desarrollo de nuevas características",
      ],
    },
    {
      title: "Marketing (Opcional)",
      description: "Para enviarte ofertas relevantes (con tu consentimiento)",
      details: [
        "Promociones y descuentos",
        "Lanzamiento de nuevos productos",
        "Newsletter con contenido de interés",
        "Invitaciones a eventos especiales",
      ],
    },
  ];

  const rights = [
    {
      title: "Derecho de Acceso",
      description: "Conocer qué datos personales tenemos sobre ti",
    },
    {
      title: "Derecho de Rectificación",
      description: "Corregir datos inexactos o incompletos",
    },
    {
      title: "Derecho de Eliminación",
      description: "Solicitar la eliminación de tus datos personales",
    },
    {
      title: "Derecho de Limitación",
      description: "Restringir el procesamiento de tus datos",
    },
    {
      title: "Derecho de Portabilidad",
      description: "Recibir tus datos en un formato estructurado",
    },
    {
      title: "Derecho de Oposición",
      description: "Oponerte al procesamiento de tus datos",
    },
  ];

  const securityMeasures = [
    {
      icon: Lock,
      title: "Encriptación SSL",
      description: "Todas las comunicaciones están encriptadas",
    },
    {
      icon: ShieldCheck,
      title: "Acceso Restringido",
      description: "Solo personal autorizado accede a tus datos",
    },
    {
      icon: Eye,
      title: "Monitoreo Continuo",
      description: "Supervisamos constantemente nuestros sistemas",
    },
    {
      icon: Settings,
      title: "Actualizaciones Regulares",
      description: "Mantenemos nuestros sistemas actualizados",
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
                <ShieldCheck className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Política de Privacidad
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tu privacidad es importante para nosotros. Conoce cómo protegemos
              y utilizamos tu información
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
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Nuestro Compromiso con tu Privacidad
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            En Nota Importados respetamos y protegemos la privacidad de nuestros
            usuarios. Esta política explica qué información recopilamos, cómo la
            utilizamos, y cuáles son tus derechos respecto a tus datos
            personales.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Cumplimos con la Ley de Protección de Datos Personales de Argentina
            (Ley 25.326) y otros marcos regulatorios aplicables para garantizar
            el manejo responsable de tu información.
          </p>
        </div>

        {/* Qué Información Recopilamos */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            ¿Qué Información Recopilamos?
          </h2>

          <div className="space-y-6">
            {dataTypes.map((type, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <type.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {type.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {type.description}
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {type.examples.map((example, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {example}
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

        {/* Cómo Utilizamos la Información */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            ¿Cómo Utilizamos tu Información?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {purposes.map((purpose, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {purpose.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {purpose.description}
                </p>
                <ul className="space-y-2">
                  {purpose.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Medidas de Seguridad */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Seguridad de tus Datos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityMeasures.map((measure, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 text-center"
              >
                <div className="bg-green-50 p-3 rounded-lg inline-flex mb-4">
                  <measure.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {measure.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {measure.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-2">
              Importante sobre la Seguridad
            </h3>
            <p className="text-blue-700 text-sm">
              Aunque implementamos medidas de seguridad robustas, ningún sistema
              es 100% seguro. Te recomendamos usar contraseñas fuertes y
              mantener tu información de acceso confidencial.
            </p>
          </div>
        </section>

        {/* Tus Derechos */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Tus Derechos sobre tus Datos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rights.map((right, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6"
              >
                <h3 className="font-semibold text-foreground mb-2">
                  {right.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {right.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              ¿Cómo Ejercer tus Derechos?
            </h3>
            <p className="text-muted-foreground mb-4">
              Para ejercer cualquiera de estos derechos, contáctanos a través
              de:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:notaimportados@gmail.com"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                notaimportados@gmail.com
              </a>
              <a
                href="/contacto"
                className="inline-flex items-center justify-center bg-muted text-muted-foreground hover:bg-muted/80 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Formulario de Contacto
              </a>
            </div>
          </div>
        </section>

        {/* Compartir Información */}
        <section className="mb-12">
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              ¿Compartimos tu Información?
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  NO vendemos tus datos
                </h3>
                <p className="text-muted-foreground">
                  Nunca vendemos, alquilamos o comercializamos tu información
                  personal a terceros.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Compartimos solo cuando es necesario:
                </h3>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Proveedores de servicios:</strong> Para procesar
                      pagos, envíos y soporte técnico
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Cumplimiento legal:</strong> Cuando lo requiera la
                      ley o autoridades competentes
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Protección de derechos:</strong> Para proteger
                      nuestros derechos, propiedad o seguridad
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Retención y Contacto */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                ¿Cuánto Tiempo Conservamos tus Datos?
              </h3>
              <p className="text-muted-foreground mb-3">
                Conservamos tu información personal solo durante el tiempo
                necesario para:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Cumplir con los fines para los que fue recopilada
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Cumplir con obligaciones legales
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Resolver disputas y hacer cumplir acuerdos
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Cambios en esta Política
              </h3>
              <p className="text-muted-foreground mb-3">
                Podemos actualizar esta política ocasionalmente. Te
                notificaremos sobre cambios importantes:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Por email a usuarios registrados
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Mediante aviso en nuestro sitio web
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Actualizando la fecha en esta página
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Información de Contacto */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Contacto sobre Privacidad
          </h2>
          <p className="text-muted-foreground mb-6">
            Si tienes preguntas sobre esta política de privacidad o el manejo de
            tus datos personales
          </p>

          <div className="space-y-3 mb-6">
            <p className="text-muted-foreground">
              <strong>Email de Privacidad:</strong> notaimportados@gmail.com
            </p>
            <p className="text-muted-foreground">
              <strong>Domicilio Legal:</strong> Buenos Aires, Argentina
            </p>
            <p className="text-muted-foreground">
              <strong>Horario de Atención:</strong> Lunes a Viernes de 9:00 a
              18:00
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contacto"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Contactar Soporte
            </a>
            <a
              href="/terminos"
              className="inline-flex items-center justify-center bg-muted text-muted-foreground hover:bg-muted/80 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Ver Términos y Condiciones
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
