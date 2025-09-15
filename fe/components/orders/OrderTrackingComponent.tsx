import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getOrderStatus } from "@/services/private";
import {
  Package,
  Truck,
  Plane,
  Ship,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  FileText,
  Calendar,
} from "lucide-react";

interface OrderTrackingProps {
  orderId: string;
}

interface TrackingStep {
  status: string;
  statusDisplayName: string;
  description: string;
  date: string;
  completed: boolean;
  current: boolean;
  location?: string;
  statusInfo: {
    title: string;
    description: string;
    color: string;
    progress: number | null;
    customerAction: string | null;
  };
}

interface OrderTracking {
  orderId: string;
  currentStatus: string;
  currentStatusInfo: {
    title: string;
    description: string;
    color: string;
    progress: number | null;
    customerAction: string | null;
  };
  trackingSteps: TrackingStep[];
  importInfo?: {
    supplierCountry?: string;
    trackingNumber?: string;
    internationalTrackingNumber?: string;
    estimatedArrivalDate?: string;
    actualArrivalDate?: string;
    customsReference?: string;
    dutiesAmount?: number;
    shippingMethod?: string;
  };
  issues?: Array<{
    type: string;
    description: string;
    date: string;
    resolved: boolean;
    resolutionDescription?: string;
  }>;
  documents?: Array<{
    type: string;
    filename: string;
    url: string;
    uploadDate: string;
  }>;
}

const getStatusIcon = (
  status: string,
  completed: boolean,
  current: boolean
) => {
  const iconProps = {
    className: `w-5 h-5 ${
      completed ? "text-green-600" : current ? "text-blue-600" : "text-gray-400"
    }`,
  };

  if (status.includes("international") || status.includes("overseas")) {
    return <Plane {...iconProps} />;
  }
  if (status.includes("customs") || status.includes("duties")) {
    return <FileText {...iconProps} />;
  }
  if (status.includes("delivery") || status.includes("dispatch")) {
    return <Truck {...iconProps} />;
  }
  if (status.includes("warehouse") || status.includes("local")) {
    return <Package {...iconProps} />;
  }
  if (status.includes("shipping") || status.includes("transit")) {
    return <Ship {...iconProps} />;
  }

  return completed ? <CheckCircle {...iconProps} /> : <Circle {...iconProps} />;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getShippingMethodIcon = (method: string) => {
  switch (method) {
    case "air":
      return <Plane className="w-4 h-4" />;
    case "sea":
      return <Ship className="w-4 h-4" />;
    case "land":
      return <Truck className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

// Funciones auxiliares para adaptación de datos
const getStatusDisplayName = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    // Estados iniciales
    pending_payment: "Pendiente de Pago",
    payment_confirmed: "Pago Confirmado",

    // Estados de preparación
    preparing_order: "Preparando Pedido",
    stock_verification: "Verificando Stock",
    awaiting_supplier: "Esperando Proveedor",

    // Estados de importación
    ordering_overseas: "Pedido Internacional",
    overseas_processing: "Procesando en Origen",
    international_shipping: "Enviado desde Origen",
    in_transit_international: "En Tránsito Internacional",

    // Estados aduaneros
    customs_clearance: "En Proceso Aduanero",
    customs_inspection: "Inspección Aduanera",
    customs_approved: "Aprobado por Aduana",
    paying_duties: "Pagando Aranceles",

    // Estados locales
    arrived_local_warehouse: "En Depósito Local",
    quality_inspection: "Inspección de Calidad",
    local_processing: "Procesamiento Local",
    ready_for_dispatch: "Listo para Despacho",

    // Estados de entrega
    dispatched: "Despachado",
    out_for_delivery: "En Reparto",
    delivery_attempted: "Intento de Entrega",
    delivered: "Entregado",

    // Estados especiales
    on_hold: "En Espera",
    returned_to_sender: "Devuelto al Remitente",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
    lost_in_transit: "Perdido en Tránsito",
    damaged: "Dañado",
    awaiting_customer_action: "Esperando tu Acción",

    // Estados legacy para compatibilidad
    shipped: "Enviado",
    order_ready: "Pedido Listo",
  };
  return statusMap[status] || status;
};

const getStatusDescription = (status: string): string => {
  const descriptions: { [key: string]: string } = {
    // Estados iniciales
    pending_payment:
      "📋 Estamos esperando la confirmación de tu pago para comenzar a procesar tu pedido.",
    payment_confirmed:
      "✅ ¡Perfecto! Tu pago ha sido confirmado y hemos comenzado a procesar tu pedido.",

    // Estados de preparación
    preparing_order:
      "📦 Estamos revisando tu pedido y preparando todo para comenzar el proceso de importación.",
    stock_verification:
      "🔍 Verificamos la disponibilidad de todos los productos que solicitaste.",
    awaiting_supplier:
      "⏳ Algunos productos no están disponibles localmente. Estamos contactando a nuestros proveedores internacionales para conseguirlos.",

    // Estados de importación
    ordering_overseas:
      "🌍 ¡Excelente! Ya realizamos el pedido oficial a nuestro proveedor en el extranjero.",
    overseas_processing:
      "🏭 El proveedor internacional está preparando tu pedido para el envío. Este proceso puede tomar varios días.",
    international_shipping:
      "✈️ ¡Tu pedido ya salió del país de origen! Está viajando hacia Argentina en este momento.",
    in_transit_international:
      "🌊 Tu pedido está cruzando fronteras internacionales. Pronto llegará a Argentina (tiempo estimado: 7-15 días).",

    // Estados aduaneros
    customs_clearance:
      "🛃 Tu pedido llegó a Argentina y está siendo procesado por la aduana. Es un paso obligatorio para todos los productos importados.",
    customs_inspection:
      "🔎 La AFIP está inspeccionando tu pedido para verificar que todo esté en orden. Este es un proceso estándar que puede tomar unos días.",
    customs_approved:
      "✅ ¡Excelente noticia! La aduana argentina aprobó tu pedido sin inconvenientes.",
    paying_duties:
      "💰 Estamos procesando el pago de los impuestos y aranceles requeridos por la AFIP para liberar tu pedido.",

    // Estados locales
    arrived_local_warehouse:
      "🏢 ¡Tu pedido ya está en Argentina! Ha llegado a nuestro depósito local y está listo para los controles finales.",
    quality_inspection:
      "🔍 Estamos realizando un control de calidad minucioso para asegurar que todos tus productos llegaron en perfecto estado.",
    local_processing:
      "📋 Preparando la documentación final y empacando tu pedido para el envío dentro de Argentina.",
    ready_for_dispatch:
      "🎯 ¡Tu pedido está listo! Está empacado y programado para salir hacia tu dirección muy pronto.",

    // Estados de entrega
    dispatched:
      "🚚 ¡Tu pedido está en camino! El transportista ya lo retiró y está viajando hacia tu dirección.",
    out_for_delivery:
      "🏃‍♂️ ¡Tu pedido sale para entrega HOY! El repartidor está en ruta hacia tu dirección. ¡Mantente atento!",
    delivery_attempted:
      "🚪 Se intentó entregar tu pedido pero no había nadie en casa. Te contactaremos para coordinar una nueva entrega.",
    delivered:
      "🎉 ¡ENTREGADO! Tu pedido ha llegado exitosamente. ¡Esperamos que disfrutes tus productos de lujo!",

    // Estados especiales
    on_hold:
      "⏸️ Tu pedido está temporalmente pausado debido a un inconveniente menor que estamos resolviendo.",
    returned_to_sender:
      "↩️ Tu pedido tuvo que ser devuelto por algún inconveniente en la entrega. Te contactaremos para resolverlo.",
    cancelled:
      "❌ Tu pedido ha sido cancelado. Si tienes dudas, no dudes en contactarnos.",
    refunded:
      "💳 El reembolso de tu pedido ha sido procesado y aparecerá en tu método de pago original.",
    lost_in_transit:
      "😰 Tu pedido se perdió durante el envío. Estamos investigando con urgencia y te mantendremos informado.",
    damaged:
      "💔 Tu pedido llegó con daños durante el transporte. Estamos procesando un reemplazo inmediato sin costo adicional.",
    awaiting_customer_action:
      "📞 Necesitamos que nos contactes o realices alguna acción para continuar con tu pedido. Revisa tu email o WhatsApp.",

    // Estados legacy
    shipped: "🚚 Tu pedido está en camino hacia tu dirección",
    order_ready: "✅ Tu pedido está listo y programado para envío",
  };
  return (
    descriptions[status] || "📦 Tu pedido está siendo procesado correctamente"
  );
};

const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    // Estados iniciales
    pending_payment: "bg-amber-100 text-amber-800",
    payment_confirmed: "bg-emerald-100 text-emerald-800",

    // Estados de preparación
    preparing_order: "bg-blue-100 text-blue-800",
    stock_verification: "bg-blue-100 text-blue-800",
    awaiting_supplier: "bg-amber-100 text-amber-800",

    // Estados de importación
    ordering_overseas: "bg-violet-100 text-violet-800",
    overseas_processing: "bg-violet-100 text-violet-800",
    international_shipping: "bg-cyan-100 text-cyan-800",
    in_transit_international: "bg-cyan-100 text-cyan-800",

    // Estados aduaneros
    customs_clearance: "bg-amber-100 text-amber-800",
    customs_inspection: "bg-amber-100 text-amber-800",
    customs_approved: "bg-emerald-100 text-emerald-800",
    paying_duties: "bg-amber-100 text-amber-800",

    // Estados locales
    arrived_local_warehouse: "bg-emerald-100 text-emerald-800",
    quality_inspection: "bg-blue-100 text-blue-800",
    local_processing: "bg-blue-100 text-blue-800",
    ready_for_dispatch: "bg-emerald-100 text-emerald-800",

    // Estados de entrega
    dispatched: "bg-cyan-100 text-cyan-800",
    out_for_delivery: "bg-cyan-100 text-cyan-800",
    delivery_attempted: "bg-amber-100 text-amber-800",
    delivered: "bg-emerald-100 text-emerald-800",

    // Estados especiales
    on_hold: "bg-amber-100 text-amber-800",
    returned_to_sender: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
    refunded: "bg-gray-100 text-gray-800",
    lost_in_transit: "bg-red-100 text-red-800",
    damaged: "bg-red-100 text-red-800",
    awaiting_customer_action: "bg-amber-100 text-amber-800",

    // Estados legacy
    shipped: "bg-indigo-100 text-indigo-800",
    order_ready: "bg-purple-100 text-purple-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getStatusProgress = (status: string): number | null => {
  const progressMap: { [key: string]: number } = {
    // Estados de la API (valores exactos de STATUS_PROGRESS)
    pending_payment: 0,
    payment_confirmed: 5,
    preparing_order: 10,
    stock_verification: 15,
    awaiting_supplier: 20,
    ordering_overseas: 25,
    overseas_processing: 30,
    international_shipping: 40,
    in_transit_international: 50,
    customs_clearance: 60,
    customs_inspection: 65,
    customs_approved: 70,
    paying_duties: 75,
    arrived_local_warehouse: 80,
    quality_inspection: 85,
    local_processing: 90,
    ready_for_dispatch: 95,
    dispatched: 97,
    out_for_delivery: 99,
    delivery_attempted: 99,
    delivered: 100,

    // Estados especiales (sin progreso específico)
    on_hold: null,
    returned_to_sender: null,
    cancelled: null,
    refunded: null,
    lost_in_transit: null,
    damaged: null,
    awaiting_customer_action: null,

    // Estados legacy para compatibilidad
    shipped: 97,
    order_ready: 95,
  };
  return progressMap[status] || null;
};

export function OrderTrackingComponent({ orderId }: OrderTrackingProps) {
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const result = getOrderStatus(orderId);

        // Verificar si el resultado tiene la propiedad 'call'
        if (result && typeof result === "object" && "call" in result) {
          const { call } = result;
          const response = await call;
          const data = response.data;

          if (data && data.order) {
            // Adaptar la estructura de datos al formato esperado
            const adaptedTracking: OrderTracking = {
              orderId: data.order.id,
              currentStatus: data.order.status,
              currentStatusInfo: {
                title: getStatusDisplayName(data.order.status),
                description: getStatusDescription(data.order.status),
                color: getStatusColor(data.order.status),
                progress: getStatusProgress(data.order.status),
                customerAction: null,
              },
              trackingSteps:
                data.order.trackingSteps?.map((step: any) => ({
                  ...step,
                  statusInfo: {
                    title: step.statusDisplayName || step.status,
                    description: step.description,
                    color: getStatusColor(step.status),
                    progress: null,
                    customerAction: null,
                  },
                })) || [],
            };
            setTracking(adaptedTracking);
          } else {
            setError(data.error || "Error al cargar el tracking");
          }
        } else {
          setError("Error en el servicio de seguimiento");
        }
      } catch (err) {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [orderId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !tracking) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error || "No se pudo cargar la información del pedido"}
        </AlertDescription>
      </Alert>
    );
  }

  const unresolvedIssues =
    tracking.issues?.filter((issue) => !issue.resolved) || [];
  const progress = tracking.currentStatusInfo.progress || 0;

  return (
    <div className="space-y-6">
      {/* Estado actual y progreso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pedido #{tracking.orderId}</span>
            <Badge
              style={{ backgroundColor: tracking.currentStatusInfo.color }}
              className="text-white"
            >
              {tracking.currentStatusInfo.title}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            {tracking.currentStatusInfo.description}
          </p>

          {tracking.currentStatusInfo.customerAction && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Acción requerida:</strong>{" "}
                {tracking.currentStatusInfo.customerAction}
              </AlertDescription>
            </Alert>
          )}

          {progress !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progreso del pedido</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de importación */}
      {tracking.importInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Información de Importación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tracking.importInfo.supplierCountry && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>País de origen:</strong>{" "}
                    {tracking.importInfo.supplierCountry}
                  </span>
                </div>
              )}

              {tracking.importInfo.shippingMethod && (
                <div className="flex items-center gap-2">
                  {getShippingMethodIcon(tracking.importInfo.shippingMethod)}
                  <span className="text-sm">
                    <strong>Método de envío:</strong>{" "}
                    {tracking.importInfo.shippingMethod}
                  </span>
                </div>
              )}

              {tracking.importInfo.trackingNumber && (
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>N° de seguimiento:</strong>{" "}
                    {tracking.importInfo.trackingNumber}
                  </span>
                </div>
              )}

              {tracking.importInfo.estimatedArrivalDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Llegada estimada:</strong>{" "}
                    {formatDate(tracking.importInfo.estimatedArrivalDate)}
                  </span>
                </div>
              )}
            </div>

            {tracking.importInfo.dutiesAmount &&
              tracking.importInfo.dutiesAmount > 0 && (
                <Alert>
                  <AlertDescription>
                    <strong>Aranceles e impuestos:</strong> $
                    {tracking.importInfo.dutiesAmount.toLocaleString()}
                  </AlertDescription>
                </Alert>
              )}
          </CardContent>
        </Card>
      )}

      {/* Problemas no resueltos */}
      {unresolvedIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Problemas Reportados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unresolvedIssues.map((issue, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p>
                        <strong>Tipo:</strong> {issue.type}
                      </p>
                      <p>{issue.description}</p>
                      <p className="text-xs text-gray-500">
                        Reportado el {formatDate(issue.date)}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline de seguimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Historial de Seguimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tracking.trackingSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step.completed
                      ? "bg-green-50 border-green-200"
                      : step.current
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {getStatusIcon(step.status, step.completed, step.current)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`font-medium ${
                        step.completed
                          ? "text-green-800"
                          : step.current
                          ? "text-blue-800"
                          : "text-gray-600"
                      }`}
                    >
                      {step.statusDisplayName}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatDate(step.date)}
                    </span>
                  </div>

                  {step.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {step.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentos */}
      {tracking.documents && tracking.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tracking.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{doc.type}</p>
                      <p className="text-xs text-gray-500">
                        Subido el {formatDate(doc.uploadDate)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      Ver
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
