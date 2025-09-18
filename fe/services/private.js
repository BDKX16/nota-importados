import { loadAbort } from "@/utils/load-abort-controller";
import axios from "axios";
import { store } from "../redux/store";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const getAxiosHeaders = () => {
  const state = store.getState();
  if (!state.user.token) {
    return null;
  }
  return {
    headers: {
      token: state.user.token,
      "Content-Type": "application/json",
    },
  };
};

/**********
 * CONTENT
 ************/

export const addContent = (data) => {
  const controller = loadAbort();

  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/admin/content", data, headers, {
        signal: controller.signal,
      }),
    controller,
  };
};

/**********
 * GESTIÓN DE PRODUCTOS - CERVEZAS
 ************/

// Obtener todas las cervezas
export const getAdminBeers = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(process.env.NEXT_PUBLIC_API_URL + "/admin/products/beers", headers, {
        signal: controller.signal,
      }),
    controller,
  };
};

// Obtener una cerveza por ID
export const getAdminBeerById = (beerId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL + `/admin/products/beers/${beerId}`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Crear una nueva cerveza
export const createBeer = (beerData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/admin/products/beers",
        beerData,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Actualizar una cerveza
export const updateBeer = (beerId, beerData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .put(
        process.env.NEXT_PUBLIC_API_URL + `/admin/products/beers/${beerId}`,
        beerData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Eliminar una cerveza
export const deleteBeer = (beerId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(
        process.env.NEXT_PUBLIC_API_URL + `/admin/products/beers/${beerId}`,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

/**********
 * GESTIÓN DE PRODUCTOS GENERALES
 ************/

// Obtener todos los productos
export const getAdminProducts = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(process.env.NEXT_PUBLIC_API_URL + "/admin/products", headers, {
        signal: controller.signal,
      }),
    controller,
  };
};

// Obtener un producto por ID
export const getAdminProductById = (productId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL + `/admin/products/${productId}`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Crear un nuevo producto
export const createProduct = (productData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/admin/products",
        productData,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Actualizar un producto
export const updateProduct = (productId, productData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .put(
        process.env.NEXT_PUBLIC_API_URL + `/admin/products/${productId}`,
        productData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Eliminar un producto
export const deleteProduct = (productId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(
        process.env.NEXT_PUBLIC_API_URL + `/admin/products/${productId}`,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

/**
 * GESTIÓN DE CATEGORÍAS
 */

// Obtener todas las categorías
export const getAdminCategories = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL + "/admin/products/categories",
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Obtener una categoría por ID
export const getCategoryById = (categoryId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/products/categories/${categoryId}`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Crear una nueva categoría
export const createCategory = (categoryData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/admin/products/categories",
        categoryData,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Actualizar una categoría
export const updateCategory = (categoryId, categoryData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .put(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/products/categories/${categoryId}`,
        categoryData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Eliminar una categoría
export const deleteCategory = (categoryId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/products/categories/${categoryId}`,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

/**********
 * GESTIÓN DE PRODUCTOS - SUSCRIPCIONES
 ************/

// Obtener todos los planes de suscripción (Para el panel de administración)
export const getAdminSubscriptionPlans = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL + "/admin/products/subscription-plans",
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Obtener un plan de suscripción por ID
export const getAdminSubscriptionPlanById = (planId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/products/subscription-plan/${planId}`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Crear un nuevo plan de suscripción
export const createSubscriptionPlan = (planData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/admin/products/subscriptions",
        planData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Actualizar un plan de suscripción
export const updateSubscriptionPlan = (planId, planData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .put(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/products/subscriptions/${planId}`,
        planData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Eliminar un plan de suscripción
export const deleteSubscriptionPlan = (planId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/products/subscriptions/${planId}`,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

/**********
 * GESTIÓN DE DESCUENTOS
 ************/

// Obtener todos los descuentos
export const getAdminDiscounts = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL + "/admin/products/discounts",
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Obtener un descuento por ID
export const getAdminDiscountById = (discountId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/products/discounts/${discountId}`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Crear un nuevo descuento
export const createDiscount = (discountData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/admin/products/discounts",
        discountData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Actualizar un descuento
export const updateDiscount = (discountId, discountData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .put(
        process.env.NEXT_PUBLIC_API_URL + `/admin/discounts/${discountId}`,
        discountData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Eliminar un descuento
export const deleteDiscount = (discountId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(
        process.env.NEXT_PUBLIC_API_URL + `/admin/discounts/${discountId}`,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Activar/desactivar un descuento
export const toggleDiscount = (discountId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .patch(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/discounts/${discountId}/toggle`,
        {},
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

/**********
 * GESTIÓN DE ÓRDENES/VENTAS
 ************/

// Obtener todas las órdenes con filtros
export const getAdminOrders = (filters = {}) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  // Convertir los filtros a parámetros de consulta
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.startDate) queryParams.append("startDate", filters.startDate);
  if (filters.endDate) queryParams.append("endDate", filters.endDate);
  if (filters.limit) queryParams.append("limit", filters.limit);
  if (filters.page) queryParams.append("page", filters.page);

  const queryString = queryParams.toString()
    ? `?${queryParams.toString()}`
    : "";

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/payments/orders${queryString}`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Obtener una orden específica
export const getAdminOrderById = (orderId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL + `/admin/payments/orders/${orderId}`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Actualizar el estado de una orden
export const updateOrderStatus = (orderId, status) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .patch(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/payments/orders/${orderId}/status`,
        { status },
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Actualizar los datos de entrega de una orden
export const updateOrderDelivery = (orderId, deliveryTime) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .patch(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/payments/orders/${orderId}/delivery`,
        { deliveryTime },
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Cancelar una orden
export const cancelOrder = (orderId, cancellationReason) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .patch(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/payments/orders/${orderId}/cancel`,
        { cancellationReason },
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Obtener estadísticas de ventas
export const getAdminOrderStats = (period = "month") => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/payments/stats?period=${period}`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Enviar email para solicitar fecha de entrega
export const sendDeliveryScheduleEmail = (orderData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL +
          "/admin/emails/send/delivery-schedule",
        {
          email: orderData.customer.email,
          orderId: orderData._id, // Usar el ObjectId de MongoDB
          customerName: orderData.customer.name,
          orderData: {
            orderId: orderData.id, // Mantener el ID personalizado para mostrar al cliente
            orderDate: orderData.date,
            total: orderData.total,
            items: orderData.items,
          },
        },
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

/**********
 * GESTIÓN DE SUSCRIPCIONES DE USUARIOS
 ************/

// Obtener todas las suscripciones de usuarios
export const getAdminUserSubscriptions = (filters = {}) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  // Convertir los filtros a parámetros de consulta
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.userId) queryParams.append("userId", filters.userId);
  if (filters.limit) queryParams.append("limit", filters.limit);
  if (filters.page) queryParams.append("page", filters.page);

  const queryString = queryParams.toString()
    ? `?${queryParams.toString()}`
    : "";

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL + `/admin/subscriptions${queryString}`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Obtener una suscripción específica
export const getAdminUserSubscriptionById = (subscriptionId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/subscriptions/${subscriptionId}`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Actualizar estado de suscripción
export const updateAdminSubscriptionStatus = (
  subscriptionId,
  status,
  reason
) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .patch(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/subscriptions/${subscriptionId}/status`,
        { status, reason },
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Registrar una nueva entrega en una suscripción
export const addSubscriptionDelivery = (subscriptionId, deliveryData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/subscriptions/${subscriptionId}/deliveries`,
        deliveryData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Actualizar el estado de una entrega
export const updateDeliveryStatus = (subscriptionId, deliveryIndex, status) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .patch(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/subscriptions/${subscriptionId}/deliveries/${deliveryIndex}`,
        { status },
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Obtener estadísticas de suscripciones
export const getSubscriptionStats = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL + `/admin/products/subscriptions/stats`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

/**********
 * GESTIÓN DE RECETAS
 ************/

// Obtener todas las recetas
export const getRecipes = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL + "/admin/products/recipes",
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Obtener una receta por ID
export const getRecipeById = (recipeId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL + `/admin/products/recipes/${recipeId}`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Crear una nueva receta
export const createRecipe = (recipeData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/admin/products/recipes",
        recipeData,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Actualizar una receta
export const updateRecipe = (recipeId, recipeData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .put(
        process.env.NEXT_PUBLIC_API_URL + `/admin/products/recipes/${recipeId}`,
        recipeData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Eliminar una receta
export const deleteRecipe = (recipeId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(
        process.env.NEXT_PUBLIC_API_URL + `/admin/products/recipes/${recipeId}`,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Iniciar el proceso de cocción de una receta
export const startBrewing = (recipeId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + `/admin/recipes/${recipeId}/start`,
        {},
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Pausar el proceso de cocción
export const pauseBrewing = (recipeId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + `/admin/recipes/${recipeId}/pause`,
        {},
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Reanudar el proceso de cocción
export const resumeBrewing = (recipeId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + `/admin/recipes/${recipeId}/resume`,
        {},
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Completar el proceso de cocción
export const completeBrewing = (recipeId, data = {}) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + `/admin/recipes/${recipeId}/complete`,
        data,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Obtener el estado actual de brewing
export const getBrewingStatus = (recipeId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL + `/admin/recipes/${recipeId}/status`,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Marcar un paso como completado
export const completeStep = (recipeId, stepId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/recipes/${recipeId}/steps/${stepId}/complete`,
        {},
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Desmarcar un paso como no completado
export const uncompleteStep = (recipeId, stepId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/recipes/${recipeId}/steps/${stepId}/complete`,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Actualizar el tiempo actual de cocción
export const updateBrewingTime = (recipeId, currentTime) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .patch(
        process.env.NEXT_PUBLIC_API_URL + `/admin/recipes/${recipeId}/time`,
        { currentTime },
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Actualizar mediciones de gravedad y ABV
export const updateGravityMeasurements = (recipeId, data) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .patch(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/products/recipes/${recipeId}/gravity`,
        data,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Obtener historial de sesiones de brewing
export const getBrewingSessions = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL + "/admin/products/brewing-sessions",
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Eliminar una sesión de brewing
export const deleteBrewingSession = (sessionId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/products/brewing-sessions/${sessionId}`,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Actualizar fecha de envasado de una sesión de brewing
export const updateBrewingSessionPackaging = (sessionId, packagingData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .patch(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/products/brewing-sessions/${sessionId}/packaging`,
        packagingData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Agregar un nuevo paso a la receta
export const addRecipeStep = (recipeId, stepData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/products/recipes/${recipeId}/steps`,
        stepData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Actualizar un paso existente
export const updateRecipeStep = (recipeId, stepId, stepData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .put(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/recipes/${recipeId}/steps/${stepId}`,
        stepData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Eliminar un paso de la receta
export const deleteRecipeStep = (recipeId, stepId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/recipes/${recipeId}/steps/${stepId}`,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Agregar paso personalizado a sesión de brewing
export const addSessionCustomStep = (recipeId, sessionId, stepData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/recipes/${recipeId}/brewing-sessions/${sessionId}/custom-steps`,
        stepData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Actualizar paso personalizado de sesión
export const updateSessionCustomStep = (
  recipeId,
  sessionId,
  stepId,
  stepData
) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .put(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/recipes/${recipeId}/brewing-sessions/${sessionId}/custom-steps/${stepId}`,
        stepData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Eliminar paso personalizado de sesión
export const deleteSessionCustomStep = (recipeId, sessionId, stepId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(
        process.env.NEXT_PUBLIC_API_URL +
          `/admin/recipes/${recipeId}/brewing-sessions/${sessionId}/custom-steps/${stepId}`,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

/**********
 * Dashboard Analytics
 ************/

export const getDashboardStats = () => {
  const controller = loadAbort();

  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(`${baseUrl}/admin/payments/dashboard`, headers, {
        signal: controller.signal,
      }),
    controller,
  };
};

export const getTopProducts = (limit = 5) => {
  const controller = loadAbort();

  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(
        `${baseUrl}/admin/payments/dashboard/top-products?limit=${limit}`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

export const getRecentOrders = (limit = 5) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(
        `${baseUrl}/admin/payments/dashboard/recent-orders?limit=${limit}`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

/**********
 * PASOS PERSONALIZADOS DE SESIÓN
 ************/

// Agregar paso personalizado a una sesión específica
export const addCustomStepToSession = (sessionId, stepData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios
      .post(
        `${baseUrl}/admin/products/brewing-sessions/${sessionId}/custom-steps`,
        stepData,
        {
          ...headers,
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Editar paso personalizado de una sesión específica
export const updateCustomStepInSession = (sessionId, stepId, stepData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios
      .put(
        `${baseUrl}/admin/products/brewing-sessions/${sessionId}/custom-steps/${stepId}`,
        stepData,
        {
          ...headers,
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Eliminar paso personalizado de una sesión específica
export const deleteCustomStepFromSession = (sessionId, stepId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios
      .delete(
        `${baseUrl}/admin/products/brewing-sessions/${sessionId}/custom-steps/${stepId}`,
        {
          ...headers,
          signal: controller.signal,
        }
      ),
    controller,
  };
};

/**********
 * GESTIÓN DE USUARIOS
 ************/

// Obtener todos los usuarios (solo admins)
export const getAllUsers = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios
      .get(`${baseUrl}/admin/users`, {
        ...headers,
        signal: controller.signal,
      }),
    controller,
  };
};

// Obtener pedidos de un usuario específico
export const getUserOrders = (userId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios
      .get(`${baseUrl}/admin/users/${userId}/orders`, {
        ...headers,
        signal: controller.signal,
      }),
    controller,
  };
};

// Obtener un pedido específico del usuario por ID
export const getUserOrderById = (orderId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios
      .get(`${baseUrl}/payments/orders/${orderId}`, {
        ...headers,
        signal: controller.signal,
      }),
    controller,
  };
};

// Actualizar horario de entrega de un pedido del usuario
export const updateUserOrderDeliveryTime = (orderId, deliveryTime) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios
      .patch(
        `${baseUrl}/payments/orders/${orderId}/delivery-time`,
        { deliveryTime },
        {
          ...headers,
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Actualizar estado de un usuario
export const updateUserStatus = (userId, statusData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios
      .put(`${baseUrl}/admin/users/${userId}/status`, statusData, {
        ...headers,
        signal: controller.signal,
      }),
    controller,
  };
};

// Eliminar usuario
export const deleteUser = (userId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios
      .delete(`${baseUrl}/admin/users/${userId}`, {
        ...headers,
        signal: controller.signal,
      }),
    controller,
  };
};

// Actualizar perfil del usuario actual
export const updateUserProfile = (profileData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios
      .put(`${baseUrl}/users/profile`, profileData, {
        ...headers,
        signal: controller.signal,
      }),
    controller,
  };
};

// Obtener pedidos del usuario actual
export const getMyOrders = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios.get(`${baseUrl}/payments/my-orders`, {
      ...headers,
      signal: controller.signal,
    }),
    controller,
  };
};

// Obtener estado de una orden específica
export const getOrderStatus = (orderId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios.get(`${baseUrl}/payments/order-status/${orderId}`, {
      ...headers,
      signal: controller.signal,
    }),
    controller,
  };
};

/**********
 * CHECKOUT Y PAGOS
 ************/

// Crear preferencia de MercadoPago
export const createMercadoPagoPreference = (checkoutData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios
      .post(`${baseUrl}/payments/create-preference`, checkoutData, {
        ...headers,
        signal: controller.signal,
      }),
    controller,
  };
};

// Procesar pago directo con tarjeta
export const processDirectPayment = (paymentData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios
      .post(`${baseUrl}/payments/process-payment`, paymentData, {
        ...headers,
        signal: controller.signal,
      }),
    controller,
  };
};

// Crear orden de pago en efectivo
export const createCashOrder = (orderData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return Promise.reject(new Error("No authenticated"));
  }

  return {
    call: axios
      .post(`${baseUrl}/payments/create-cash-order`, orderData, {
        ...headers,
        signal: controller.signal,
      }),
    controller,
  };
};

/**********
 * GESTIÓN DE MARCAS
 ************/

// Obtener todas las marcas
export const getAdminBrands = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(process.env.NEXT_PUBLIC_API_URL + "/admin/brands", headers, {
        signal: controller.signal,
      }),
    controller,
  };
};

// Obtener una marca por ID
export const getAdminBrandById = (brandId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL + `/admin/brands/${brandId}`,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Crear una nueva marca
export const createBrand = (brandData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/admin/brands",
        brandData,
        headers,
        {
          signal: controller.signal,
        }
      ),
    controller,
  };
};

// Actualizar una marca
export const updateBrand = (brandId, brandData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .put(
        process.env.NEXT_PUBLIC_API_URL + `/admin/brands/${brandId}`,
        brandData,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Eliminar una marca
export const deleteBrand = (brandId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(
        process.env.NEXT_PUBLIC_API_URL + `/admin/brands/${brandId}`,
        headers,
        { signal: controller.signal }
      ),
    controller,
  };
};

// Exportar todas las funciones de imagen
export * from "./imageService.js";
