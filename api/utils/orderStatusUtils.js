const {
  ORDER_STATUSES,
  STATUS_DESCRIPTIONS,
  STATUS_COLORS,
  STATUS_PROGRESS,
} = require("../constants/orderStatuses");

/**
 * Obtiene la información completa de un estado
 * @param {string} status - El estado de la orden
 * @returns {object} Información completa del estado
 */
function getStatusInfo(status) {
  return {
    status,
    ...STATUS_DESCRIPTIONS[status],
    color: STATUS_COLORS[status],
    progress: STATUS_PROGRESS[status],
  };
}

/**
 * Obtiene todos los estados disponibles con su información
 * @returns {array} Array de objetos con información de estados
 */
function getAllStatusInfo() {
  return Object.keys(ORDER_STATUSES).map((key) => ({
    key,
    value: ORDER_STATUSES[key],
    ...STATUS_DESCRIPTIONS[ORDER_STATUSES[key]],
    color: STATUS_COLORS[ORDER_STATUSES[key]],
    progress: STATUS_PROGRESS[ORDER_STATUSES[key]],
  }));
}

/**
 * Verifica si un estado es válido
 * @param {string} status - El estado a verificar
 * @returns {boolean} True si es válido
 */
function isValidStatus(status) {
  return Object.values(ORDER_STATUSES).includes(status);
}

/**
 * Obtiene los próximos estados posibles desde un estado actual
 * @param {string} currentStatus - Estado actual
 * @returns {array} Array de próximos estados posibles
 */
function getNextPossibleStatuses(currentStatus) {
  const statusFlow = {
    [ORDER_STATUSES.PENDING_PAYMENT]: [
      ORDER_STATUSES.PAYMENT_CONFIRMED,
      ORDER_STATUSES.CANCELLED,
    ],
    [ORDER_STATUSES.PAYMENT_CONFIRMED]: [
      ORDER_STATUSES.PREPARING_ORDER,
      ORDER_STATUSES.CANCELLED,
    ],
    [ORDER_STATUSES.PREPARING_ORDER]: [
      ORDER_STATUSES.STOCK_VERIFICATION,
      ORDER_STATUSES.ON_HOLD,
      ORDER_STATUSES.CANCELLED,
    ],
    [ORDER_STATUSES.STOCK_VERIFICATION]: [
      ORDER_STATUSES.AWAITING_SUPPLIER,
      ORDER_STATUSES.ORDERING_OVERSEAS,
      ORDER_STATUSES.LOCAL_PROCESSING,
      ORDER_STATUSES.ON_HOLD,
    ],
    [ORDER_STATUSES.AWAITING_SUPPLIER]: [
      ORDER_STATUSES.ORDERING_OVERSEAS,
      ORDER_STATUSES.ON_HOLD,
      ORDER_STATUSES.CANCELLED,
    ],
    [ORDER_STATUSES.ORDERING_OVERSEAS]: [
      ORDER_STATUSES.OVERSEAS_PROCESSING,
      ORDER_STATUSES.ON_HOLD,
    ],
    [ORDER_STATUSES.OVERSEAS_PROCESSING]: [
      ORDER_STATUSES.INTERNATIONAL_SHIPPING,
      ORDER_STATUSES.ON_HOLD,
    ],
    [ORDER_STATUSES.INTERNATIONAL_SHIPPING]: [
      ORDER_STATUSES.IN_TRANSIT_INTERNATIONAL,
      ORDER_STATUSES.LOST_IN_TRANSIT,
    ],
    [ORDER_STATUSES.IN_TRANSIT_INTERNATIONAL]: [
      ORDER_STATUSES.CUSTOMS_CLEARANCE,
      ORDER_STATUSES.LOST_IN_TRANSIT,
    ],
    [ORDER_STATUSES.CUSTOMS_CLEARANCE]: [
      ORDER_STATUSES.CUSTOMS_INSPECTION,
      ORDER_STATUSES.CUSTOMS_APPROVED,
      ORDER_STATUSES.ON_HOLD,
    ],
    [ORDER_STATUSES.CUSTOMS_INSPECTION]: [
      ORDER_STATUSES.CUSTOMS_APPROVED,
      ORDER_STATUSES.PAYING_DUTIES,
      ORDER_STATUSES.ON_HOLD,
      ORDER_STATUSES.RETURNED_TO_SENDER,
    ],
    [ORDER_STATUSES.CUSTOMS_APPROVED]: [
      ORDER_STATUSES.PAYING_DUTIES,
      ORDER_STATUSES.ARRIVED_LOCAL_WAREHOUSE,
    ],
    [ORDER_STATUSES.PAYING_DUTIES]: [
      ORDER_STATUSES.ARRIVED_LOCAL_WAREHOUSE,
      ORDER_STATUSES.AWAITING_CUSTOMER_ACTION,
    ],
    [ORDER_STATUSES.ARRIVED_LOCAL_WAREHOUSE]: [
      ORDER_STATUSES.QUALITY_INSPECTION,
    ],
    [ORDER_STATUSES.QUALITY_INSPECTION]: [
      ORDER_STATUSES.LOCAL_PROCESSING,
      ORDER_STATUSES.DAMAGED,
      ORDER_STATUSES.ON_HOLD,
    ],
    [ORDER_STATUSES.LOCAL_PROCESSING]: [ORDER_STATUSES.READY_FOR_DISPATCH],
    [ORDER_STATUSES.READY_FOR_DISPATCH]: [ORDER_STATUSES.DISPATCHED],
    [ORDER_STATUSES.DISPATCHED]: [
      ORDER_STATUSES.OUT_FOR_DELIVERY,
      ORDER_STATUSES.LOST_IN_TRANSIT,
    ],
    [ORDER_STATUSES.OUT_FOR_DELIVERY]: [
      ORDER_STATUSES.DELIVERED,
      ORDER_STATUSES.DELIVERY_ATTEMPTED,
      ORDER_STATUSES.RETURNED_TO_SENDER,
    ],
    [ORDER_STATUSES.DELIVERY_ATTEMPTED]: [
      ORDER_STATUSES.OUT_FOR_DELIVERY,
      ORDER_STATUSES.DELIVERED,
      ORDER_STATUSES.RETURNED_TO_SENDER,
    ],
    // Estados finales o especiales
    [ORDER_STATUSES.DELIVERED]: [],
    [ORDER_STATUSES.CANCELLED]: [ORDER_STATUSES.REFUNDED],
    [ORDER_STATUSES.REFUNDED]: [],
    [ORDER_STATUSES.LOST_IN_TRANSIT]: [ORDER_STATUSES.REFUNDED],
    [ORDER_STATUSES.DAMAGED]: [ORDER_STATUSES.REFUNDED],
    [ORDER_STATUSES.RETURNED_TO_SENDER]: [
      ORDER_STATUSES.REFUNDED,
      ORDER_STATUSES.DISPATCHED,
    ],
    [ORDER_STATUSES.ON_HOLD]: [
      ORDER_STATUSES.CANCELLED,
      ORDER_STATUSES.AWAITING_CUSTOMER_ACTION,
    ],
    [ORDER_STATUSES.AWAITING_CUSTOMER_ACTION]: [],
  };

  return statusFlow[currentStatus] || [];
}

/**
 * Calcula el tiempo estimado total basado en el estado actual
 * @param {string} currentStatus - Estado actual
 * @returns {number|null} Días estimados restantes o null si no aplicable
 */
function getEstimatedDaysRemaining(currentStatus) {
  const statusOrder = [
    ORDER_STATUSES.PENDING_PAYMENT,
    ORDER_STATUSES.PAYMENT_CONFIRMED,
    ORDER_STATUSES.PREPARING_ORDER,
    ORDER_STATUSES.STOCK_VERIFICATION,
    ORDER_STATUSES.AWAITING_SUPPLIER,
    ORDER_STATUSES.ORDERING_OVERSEAS,
    ORDER_STATUSES.OVERSEAS_PROCESSING,
    ORDER_STATUSES.INTERNATIONAL_SHIPPING,
    ORDER_STATUSES.IN_TRANSIT_INTERNATIONAL,
    ORDER_STATUSES.CUSTOMS_CLEARANCE,
    ORDER_STATUSES.CUSTOMS_INSPECTION,
    ORDER_STATUSES.CUSTOMS_APPROVED,
    ORDER_STATUSES.PAYING_DUTIES,
    ORDER_STATUSES.ARRIVED_LOCAL_WAREHOUSE,
    ORDER_STATUSES.QUALITY_INSPECTION,
    ORDER_STATUSES.LOCAL_PROCESSING,
    ORDER_STATUSES.READY_FOR_DISPATCH,
    ORDER_STATUSES.DISPATCHED,
    ORDER_STATUSES.OUT_FOR_DELIVERY,
    ORDER_STATUSES.DELIVERED,
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);
  if (currentIndex === -1) return null;

  let totalDays = 0;
  for (let i = currentIndex; i < statusOrder.length - 1; i++) {
    const statusInfo = STATUS_DESCRIPTIONS[statusOrder[i]];
    if (statusInfo.estimatedDays) {
      totalDays += statusInfo.estimatedDays;
    }
  }

  return totalDays || null;
}

/**
 * Determina si un estado requiere acción del cliente
 * @param {string} status - Estado a evaluar
 * @returns {boolean} True si requiere acción del cliente
 */
function requiresCustomerAction(status) {
  const statusInfo = STATUS_DESCRIPTIONS[status];
  return statusInfo && statusInfo.customerAction !== null;
}

/**
 * Obtiene los estados que representan problemas o alertas
 * @returns {array} Array de estados problemáticos
 */
function getProblemStatuses() {
  return [
    ORDER_STATUSES.ON_HOLD,
    ORDER_STATUSES.DELIVERY_ATTEMPTED,
    ORDER_STATUSES.LOST_IN_TRANSIT,
    ORDER_STATUSES.DAMAGED,
    ORDER_STATUSES.RETURNED_TO_SENDER,
    ORDER_STATUSES.AWAITING_CUSTOMER_ACTION,
  ];
}

/**
 * Obtiene los estados finales (no pueden cambiar más)
 * @returns {array} Array de estados finales
 */
function getFinalStatuses() {
  return [
    ORDER_STATUSES.DELIVERED,
    ORDER_STATUSES.CANCELLED,
    ORDER_STATUSES.REFUNDED,
  ];
}

/**
 * Crea un tracking step automáticamente
 * @param {string} status - Estado del tracking step
 * @param {object} options - Opciones adicionales
 * @returns {object} Objeto tracking step
 */
function createTrackingStep(status, options = {}) {
  const statusInfo = STATUS_DESCRIPTIONS[status];
  return {
    status,
    statusDisplayName: statusInfo.title,
    description: options.description || statusInfo.description,
    date: options.date || new Date(),
    completed: options.completed || false,
    current: options.current || false,
    estimatedDate: options.estimatedDate,
    location: options.location,
    updatedBy: options.updatedBy || "system",
    additionalInfo: options.additionalInfo,
  };
}

module.exports = {
  getStatusInfo,
  getAllStatusInfo,
  isValidStatus,
  getNextPossibleStatuses,
  getEstimatedDaysRemaining,
  requiresCustomerAction,
  getProblemStatuses,
  getFinalStatuses,
  createTrackingStep,
};
