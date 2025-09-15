// Constantes para estados de órdenes de productos importados
const ORDER_STATUSES = {
  // Estados iniciales
  PENDING_PAYMENT: "pending_payment",
  PAYMENT_CONFIRMED: "payment_confirmed",

  // Estados de preparación
  PREPARING_ORDER: "preparing_order",
  STOCK_VERIFICATION: "stock_verification",
  AWAITING_SUPPLIER: "awaiting_supplier",

  // Estados de importación
  ORDERING_OVERSEAS: "ordering_overseas",
  OVERSEAS_PROCESSING: "overseas_processing",
  INTERNATIONAL_SHIPPING: "international_shipping",
  IN_TRANSIT_INTERNATIONAL: "in_transit_international",

  // Estados aduaneros
  CUSTOMS_CLEARANCE: "customs_clearance",
  CUSTOMS_INSPECTION: "customs_inspection",
  CUSTOMS_APPROVED: "customs_approved",
  PAYING_DUTIES: "paying_duties",

  // Estados locales
  ARRIVED_LOCAL_WAREHOUSE: "arrived_local_warehouse",
  QUALITY_INSPECTION: "quality_inspection",
  LOCAL_PROCESSING: "local_processing",
  READY_FOR_DISPATCH: "ready_for_dispatch",

  // Estados de entrega
  DISPATCHED: "dispatched",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERY_ATTEMPTED: "delivery_attempted",
  DELIVERED: "delivered",

  // Estados especiales
  ON_HOLD: "on_hold",
  RETURNED_TO_SENDER: "returned_to_sender",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  LOST_IN_TRANSIT: "lost_in_transit",
  DAMAGED: "damaged",
  AWAITING_CUSTOMER_ACTION: "awaiting_customer_action",
};

// Descripciones de estados en español para mostrar al cliente
const STATUS_DESCRIPTIONS = {
  [ORDER_STATUSES.PENDING_PAYMENT]: {
    title: "Pendiente de Pago",
    description:
      "Estamos esperando la confirmación de tu pago para procesar el pedido.",
    customerAction: "Completa el pago para continuar con tu pedido.",
    estimatedDays: null,
  },
  [ORDER_STATUSES.PAYMENT_CONFIRMED]: {
    title: "Pago Confirmado",
    description: "Tu pago ha sido confirmado. Comenzamos a procesar tu pedido.",
    customerAction: null,
    estimatedDays: 1,
  },
  [ORDER_STATUSES.PREPARING_ORDER]: {
    title: "Preparando Pedido",
    description:
      "Estamos preparando tu pedido y verificando todos los detalles.",
    customerAction: null,
    estimatedDays: 2,
  },
  [ORDER_STATUSES.STOCK_VERIFICATION]: {
    title: "Verificando Stock",
    description:
      "Confirmamos la disponibilidad de todos los productos en tu pedido.",
    customerAction: null,
    estimatedDays: 1,
  },
  [ORDER_STATUSES.AWAITING_SUPPLIER]: {
    title: "Esperando Proveedor",
    description:
      "Algunos productos no están en stock local. Contactando proveedores internacionales.",
    customerAction: null,
    estimatedDays: 3,
  },
  [ORDER_STATUSES.ORDERING_OVERSEAS]: {
    title: "Pedido Internacional",
    description:
      "Hemos realizado el pedido a nuestros proveedores en el exterior.",
    customerAction: null,
    estimatedDays: 5,
  },
  [ORDER_STATUSES.OVERSEAS_PROCESSING]: {
    title: "Procesando en Origen",
    description:
      "Nuestro proveedor está preparando tu pedido para el envío internacional.",
    customerAction: null,
    estimatedDays: 7,
  },
  [ORDER_STATUSES.INTERNATIONAL_SHIPPING]: {
    title: "Enviado desde Origen",
    description:
      "Tu pedido ha sido enviado desde el país de origen y está en camino.",
    customerAction: null,
    estimatedDays: 15,
  },
  [ORDER_STATUSES.IN_TRANSIT_INTERNATIONAL]: {
    title: "En Tránsito Internacional",
    description:
      "Tu pedido está viajando hacia Argentina. Puedes seguirlo con el número de tracking.",
    customerAction: null,
    estimatedDays: 10,
  },
  [ORDER_STATUSES.CUSTOMS_CLEARANCE]: {
    title: "En Proceso Aduanero",
    description:
      "Tu pedido ha llegado a Argentina y está siendo procesado por la aduana.",
    customerAction: null,
    estimatedDays: 5,
  },
  [ORDER_STATUSES.CUSTOMS_INSPECTION]: {
    title: "Inspección Aduanera",
    description:
      "La aduana está inspeccionando tu pedido. Este es un proceso normal.",
    customerAction: null,
    estimatedDays: 3,
  },
  [ORDER_STATUSES.CUSTOMS_APPROVED]: {
    title: "Aprobado por Aduana",
    description: "Tu pedido ha sido aprobado por la aduana argentina.",
    customerAction: null,
    estimatedDays: 1,
  },
  [ORDER_STATUSES.PAYING_DUTIES]: {
    title: "Pagando Aranceles",
    description:
      "Estamos procesando el pago de los impuestos y aranceles correspondientes.",
    customerAction: "Es posible que debas pagar impuestos adicionales.",
    estimatedDays: 2,
  },
  [ORDER_STATUSES.ARRIVED_LOCAL_WAREHOUSE]: {
    title: "En Depósito Local",
    description: "Tu pedido ha llegado a nuestro depósito en Argentina.",
    customerAction: null,
    estimatedDays: 1,
  },
  [ORDER_STATUSES.QUALITY_INSPECTION]: {
    title: "Inspección de Calidad",
    description:
      "Estamos verificando que todos los productos llegaron en perfecto estado.",
    customerAction: null,
    estimatedDays: 1,
  },
  [ORDER_STATUSES.LOCAL_PROCESSING]: {
    title: "Procesamiento Local",
    description:
      "Preparando tu pedido para el envío final dentro de Argentina.",
    customerAction: null,
    estimatedDays: 2,
  },
  [ORDER_STATUSES.READY_FOR_DISPATCH]: {
    title: "Listo para Despacho",
    description:
      "Tu pedido está empacado y listo para ser enviado a tu dirección.",
    customerAction: null,
    estimatedDays: 1,
  },
  [ORDER_STATUSES.DISPATCHED]: {
    title: "Despachado",
    description: "Tu pedido ha sido enviado y está en camino a tu dirección.",
    customerAction: null,
    estimatedDays: 3,
  },
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: {
    title: "En Reparto",
    description:
      "Tu pedido está siendo entregado hoy. Mantente atento a la llegada del repartidor.",
    customerAction: "Asegúrate de estar disponible para recibir el pedido.",
    estimatedDays: 0,
  },
  [ORDER_STATUSES.DELIVERY_ATTEMPTED]: {
    title: "Intento de Entrega",
    description:
      "Se intentó entregar tu pedido pero no se encontró a nadie. Se reagendará la entrega.",
    customerAction: "Contacta con nosotros para reagendar la entrega.",
    estimatedDays: 1,
  },
  [ORDER_STATUSES.DELIVERED]: {
    title: "Entregado",
    description:
      "¡Tu pedido ha sido entregado exitosamente! Esperamos que disfrutes tus productos.",
    customerAction:
      "Si tienes algún problema, contáctanos dentro de las 48 horas.",
    estimatedDays: null,
  },
  [ORDER_STATUSES.ON_HOLD]: {
    title: "En Espera",
    description:
      "Tu pedido está temporalmente en espera debido a un inconveniente menor.",
    customerAction: "Te contactaremos pronto con más información.",
    estimatedDays: null,
  },
  [ORDER_STATUSES.RETURNED_TO_SENDER]: {
    title: "Devuelto al Remitente",
    description:
      "Tu pedido ha sido devuelto por algún inconveniente en la entrega.",
    customerAction: "Contáctanos para resolver la situación.",
    estimatedDays: null,
  },
  [ORDER_STATUSES.CANCELLED]: {
    title: "Cancelado",
    description: "Tu pedido ha sido cancelado.",
    customerAction: "Si tienes dudas sobre la cancelación, contáctanos.",
    estimatedDays: null,
  },
  [ORDER_STATUSES.REFUNDED]: {
    title: "Reembolsado",
    description: "El reembolso de tu pedido ha sido procesado.",
    customerAction:
      "El dinero debería aparecer en tu cuenta en 3-5 días hábiles.",
    estimatedDays: null,
  },
  [ORDER_STATUSES.LOST_IN_TRANSIT]: {
    title: "Perdido en Tránsito",
    description:
      "Tu pedido se ha perdido durante el envío. Estamos investigando la situación.",
    customerAction: "Te contactaremos pronto para resolver esta situación.",
    estimatedDays: null,
  },
  [ORDER_STATUSES.DAMAGED]: {
    title: "Dañado",
    description:
      "Tu pedido llegó con daños. Estamos procesando un reemplazo o reembolso.",
    customerAction: "Te contactaremos pronto para ofrecerte una solución.",
    estimatedDays: null,
  },
  [ORDER_STATUSES.AWAITING_CUSTOMER_ACTION]: {
    title: "Esperando tu Acción",
    description:
      "Necesitamos que realices alguna acción para continuar con tu pedido.",
    customerAction: "Revisa tu email o contáctanos para saber qué necesitamos.",
    estimatedDays: null,
  },
};

// Colores para los estados (para UI)
const STATUS_COLORS = {
  [ORDER_STATUSES.PENDING_PAYMENT]: "#f59e0b", // amber
  [ORDER_STATUSES.PAYMENT_CONFIRMED]: "#10b981", // emerald
  [ORDER_STATUSES.PREPARING_ORDER]: "#3b82f6", // blue
  [ORDER_STATUSES.STOCK_VERIFICATION]: "#3b82f6", // blue
  [ORDER_STATUSES.AWAITING_SUPPLIER]: "#f59e0b", // amber
  [ORDER_STATUSES.ORDERING_OVERSEAS]: "#8b5cf6", // violet
  [ORDER_STATUSES.OVERSEAS_PROCESSING]: "#8b5cf6", // violet
  [ORDER_STATUSES.INTERNATIONAL_SHIPPING]: "#06b6d4", // cyan
  [ORDER_STATUSES.IN_TRANSIT_INTERNATIONAL]: "#06b6d4", // cyan
  [ORDER_STATUSES.CUSTOMS_CLEARANCE]: "#f59e0b", // amber
  [ORDER_STATUSES.CUSTOMS_INSPECTION]: "#f59e0b", // amber
  [ORDER_STATUSES.CUSTOMS_APPROVED]: "#10b981", // emerald
  [ORDER_STATUSES.PAYING_DUTIES]: "#f59e0b", // amber
  [ORDER_STATUSES.ARRIVED_LOCAL_WAREHOUSE]: "#10b981", // emerald
  [ORDER_STATUSES.QUALITY_INSPECTION]: "#3b82f6", // blue
  [ORDER_STATUSES.LOCAL_PROCESSING]: "#3b82f6", // blue
  [ORDER_STATUSES.READY_FOR_DISPATCH]: "#10b981", // emerald
  [ORDER_STATUSES.DISPATCHED]: "#06b6d4", // cyan
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: "#06b6d4", // cyan
  [ORDER_STATUSES.DELIVERY_ATTEMPTED]: "#f59e0b", // amber
  [ORDER_STATUSES.DELIVERED]: "#10b981", // emerald
  [ORDER_STATUSES.ON_HOLD]: "#f59e0b", // amber
  [ORDER_STATUSES.RETURNED_TO_SENDER]: "#ef4444", // red
  [ORDER_STATUSES.CANCELLED]: "#6b7280", // gray
  [ORDER_STATUSES.REFUNDED]: "#6b7280", // gray
  [ORDER_STATUSES.LOST_IN_TRANSIT]: "#ef4444", // red
  [ORDER_STATUSES.DAMAGED]: "#ef4444", // red
  [ORDER_STATUSES.AWAITING_CUSTOMER_ACTION]: "#f59e0b", // amber
};

// Progreso porcentual aproximado para cada estado
const STATUS_PROGRESS = {
  [ORDER_STATUSES.PENDING_PAYMENT]: 0,
  [ORDER_STATUSES.PAYMENT_CONFIRMED]: 5,
  [ORDER_STATUSES.PREPARING_ORDER]: 10,
  [ORDER_STATUSES.STOCK_VERIFICATION]: 15,
  [ORDER_STATUSES.AWAITING_SUPPLIER]: 20,
  [ORDER_STATUSES.ORDERING_OVERSEAS]: 25,
  [ORDER_STATUSES.OVERSEAS_PROCESSING]: 30,
  [ORDER_STATUSES.INTERNATIONAL_SHIPPING]: 40,
  [ORDER_STATUSES.IN_TRANSIT_INTERNATIONAL]: 50,
  [ORDER_STATUSES.CUSTOMS_CLEARANCE]: 60,
  [ORDER_STATUSES.CUSTOMS_INSPECTION]: 65,
  [ORDER_STATUSES.CUSTOMS_APPROVED]: 70,
  [ORDER_STATUSES.PAYING_DUTIES]: 75,
  [ORDER_STATUSES.ARRIVED_LOCAL_WAREHOUSE]: 80,
  [ORDER_STATUSES.QUALITY_INSPECTION]: 85,
  [ORDER_STATUSES.LOCAL_PROCESSING]: 90,
  [ORDER_STATUSES.READY_FOR_DISPATCH]: 95,
  [ORDER_STATUSES.DISPATCHED]: 97,
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: 99,
  [ORDER_STATUSES.DELIVERY_ATTEMPTED]: 99,
  [ORDER_STATUSES.DELIVERED]: 100,
  // Estados especiales no tienen progreso específico
  [ORDER_STATUSES.ON_HOLD]: null,
  [ORDER_STATUSES.RETURNED_TO_SENDER]: null,
  [ORDER_STATUSES.CANCELLED]: null,
  [ORDER_STATUSES.REFUNDED]: null,
  [ORDER_STATUSES.LOST_IN_TRANSIT]: null,
  [ORDER_STATUSES.DAMAGED]: null,
  [ORDER_STATUSES.AWAITING_CUSTOMER_ACTION]: null,
};

module.exports = {
  ORDER_STATUSES,
  STATUS_DESCRIPTIONS,
  STATUS_COLORS,
  STATUS_PROGRESS,
};
