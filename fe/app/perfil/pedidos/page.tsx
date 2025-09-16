"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/footer";
import { getMyOrders } from "@/services/private";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  CheckCircle,
  Truck,
  Clock,
  Eye,
  Calendar,
  MapPin,
  CreditCard,
  X,
} from "lucide-react";
import Link from "next/link";
import { OrderTrackingComponent } from "@/components/orders/OrderTrackingComponent";

export default function UserOrdersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { loading: ordersLoading, callEndpoint } = useFetchAndLoad();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/perfil/pedidos");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Load user orders when authenticated
    const loadOrders = async () => {
      if (user && isAuthenticated) {
        try {
          const response = await callEndpoint(getMyOrders());
          if (response && response.data && response.data.data) {
            // Filtrar solo pedidos de productos (excluir suscripciones)
            const allOrders = response.data.data.data;
            const productOrders = allOrders.filter((order) => {
              // Filtrar por tipo de orden o por productos
              const isSubscription =
                order.orderType?.toLowerCase().includes("suscripción") ||
                order.orderType?.toLowerCase().includes("subscription") ||
                (order.items &&
                  order.items.some(
                    (item) =>
                      item.type?.toLowerCase().includes("suscripción") ||
                      item.type?.toLowerCase().includes("subscription")
                  ));
              return !isSubscription;
            });

            setOrders(productOrders);
            setFilteredOrders(productOrders);
          }
        } catch (error) {
          if (error.name !== "CanceledError" && error.name !== "AbortError") {
            console.error("Error loading orders:", error);
          }
        }
      }
    };

    loadOrders();
  }, [user, isAuthenticated, callEndpoint]);

  useEffect(() => {
    // Filter orders based on status
    const ordersArray = orders ?? [];
    const activeShippingOrder = getActiveShippingOrder();

    if (statusFilter === "all") {
      // Si hay un pedido en camino mostrado en el card especial, excluirlo de la lista
      if (activeShippingOrder) {
        setFilteredOrders(
          ordersArray.filter((order) => order._id !== activeShippingOrder._id)
        );
      } else {
        setFilteredOrders(ordersArray);
      }
    } else if (statusFilter === "shipping") {
      // Filtro especial para "En camino" que incluye múltiples estados
      const shippingOrders = ordersArray.filter(
        (order) =>
          order.status?.toLowerCase() === "shipped" ||
          order.status?.toLowerCase() === "shipping" ||
          order.status?.toLowerCase() === "en camino" ||
          order.status?.toLowerCase() === "enviado"
      );
      // Si hay un pedido activo en el card, excluirlo de esta lista también
      if (activeShippingOrder) {
        setFilteredOrders(
          shippingOrders.filter(
            (order) => order._id !== activeShippingOrder._id
          )
        );
      } else {
        setFilteredOrders(shippingOrders);
      }
    } else {
      const filtered = ordersArray.filter(
        (order) => order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
      // Si hay un pedido activo en el card y coincide con el filtro, excluirlo
      if (
        activeShippingOrder &&
        activeShippingOrder.status?.toLowerCase() === statusFilter.toLowerCase()
      ) {
        setFilteredOrders(
          filtered.filter((order) => order._id !== activeShippingOrder._id)
        );
      } else {
        setFilteredOrders(filtered);
      }
    }
  }, [orders, statusFilter]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Avoid flash of unauthorized page before redirect
  if (!isAuthenticated || !user) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      // Estados de la API
      case "pending_payment":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "payment_confirmed":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "preparing_order":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "stock_verification":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "awaiting_supplier":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "ordering_overseas":
        return "bg-violet-50 border-violet-200 text-violet-800";
      case "overseas_processing":
        return "bg-violet-50 border-violet-200 text-violet-800";
      case "international_shipping":
        return "bg-cyan-50 border-cyan-200 text-cyan-800";
      case "in_transit_international":
        return "bg-cyan-50 border-cyan-200 text-cyan-800";
      case "customs_clearance":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "customs_inspection":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "customs_approved":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "paying_duties":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "arrived_local_warehouse":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "quality_inspection":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "local_processing":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "ready_for_dispatch":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "dispatched":
        return "bg-cyan-50 border-cyan-200 text-cyan-800";
      case "out_for_delivery":
        return "bg-cyan-50 border-cyan-200 text-cyan-800";
      case "delivery_attempted":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "delivered":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "on_hold":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "returned_to_sender":
        return "bg-red-50 border-red-200 text-red-800";
      case "cancelled":
        return "bg-gray-50 border-gray-200 text-gray-800";
      case "refunded":
        return "bg-gray-50 border-gray-200 text-gray-800";
      case "lost_in_transit":
        return "bg-red-50 border-red-200 text-red-800";
      case "damaged":
        return "bg-red-50 border-red-200 text-red-800";
      case "awaiting_customer_action":
        return "bg-amber-50 border-amber-200 text-amber-800";

      // Estados legacy para compatibilidad
      case "shipped":
      case "en_transito":
        return "bg-indigo-50 border-indigo-200 text-indigo-800";
      case "entregado":
        return "bg-green-50 border-green-200 text-green-800";
      case "cancelado":
        return "bg-red-50 border-red-200 text-red-800";
      case "processing":
      case "procesando":
      case "en preparación":
        return "bg-orange-50 border-orange-200 text-orange-800";
      case "confirmed":
      case "confirmado":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "pending":
      case "pendiente":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "order_ready":
        return "bg-purple-50 border-purple-200 text-purple-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      // Estados de la API
      case "pending_payment":
        return "Pendiente de Pago";
      case "payment_confirmed":
        return "Pago Confirmado";
      case "preparing_order":
        return "Preparando Pedido";
      case "stock_verification":
        return "Verificando Stock";
      case "awaiting_supplier":
        return "Esperando Proveedor";
      case "ordering_overseas":
        return "Pedido Internacional";
      case "overseas_processing":
        return "Procesando en Origen";
      case "international_shipping":
        return "Enviado desde Origen";
      case "in_transit_international":
        return "En Tránsito Internacional";
      case "customs_clearance":
        return "En Proceso Aduanero";
      case "customs_inspection":
        return "Inspección Aduanera";
      case "customs_approved":
        return "Aprobado por Aduana";
      case "paying_duties":
        return "Pagando Aranceles";
      case "arrived_local_warehouse":
        return "En Depósito Local";
      case "quality_inspection":
        return "Inspección de Calidad";
      case "local_processing":
        return "Procesamiento Local";
      case "ready_for_dispatch":
        return "Listo para Despacho";
      case "dispatched":
        return "Despachado";
      case "out_for_delivery":
        return "En Reparto";
      case "delivery_attempted":
        return "Intento de Entrega";
      case "delivered":
        return "Entregado";
      case "on_hold":
        return "En Espera";
      case "returned_to_sender":
        return "Devuelto al Remitente";
      case "cancelled":
        return "Cancelado";
      case "refunded":
        return "Reembolsado";
      case "lost_in_transit":
        return "Perdido en Tránsito";
      case "damaged":
        return "Dañado";
      case "awaiting_customer_action":
        return "Esperando tu Acción";

      // Estados legacy para compatibilidad
      case "shipped":
      case "en_transito":
        return "En Camino";
      case "entregado":
        return "Entregado";
      case "cancelado":
        return "Cancelado";
      case "processing":
      case "procesando":
      case "en preparación":
        return "En preparación";
      case "confirmed":
      case "confirmado":
        return "Confirmado";
      case "pending":
      case "pendiente":
        return "Pendiente";
      case "ready_pickup":
      case "listo para recoger":
        return "Listo para recoger";
      case "waiting_schedule":
      case "esperando horario":
        return "Esperando horario";
      case "order_ready":
        return "Pedido Listo";
      default:
        return status || "Sin estado";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      // Estados de la API (usando colores de STATUS_COLORS pero en formato Tailwind)
      case "pending_payment":
        return "bg-amber-600";
      case "payment_confirmed":
        return "bg-emerald-600";
      case "preparing_order":
        return "bg-blue-600";
      case "stock_verification":
        return "bg-blue-600";
      case "awaiting_supplier":
        return "bg-amber-600";
      case "ordering_overseas":
        return "bg-violet-600";
      case "overseas_processing":
        return "bg-violet-600";
      case "international_shipping":
        return "bg-cyan-600";
      case "in_transit_international":
        return "bg-cyan-600";
      case "customs_clearance":
        return "bg-amber-600";
      case "customs_inspection":
        return "bg-amber-600";
      case "customs_approved":
        return "bg-emerald-600";
      case "paying_duties":
        return "bg-amber-600";
      case "arrived_local_warehouse":
        return "bg-emerald-600";
      case "quality_inspection":
        return "bg-blue-600";
      case "local_processing":
        return "bg-blue-600";
      case "ready_for_dispatch":
        return "bg-emerald-600";
      case "dispatched":
        return "bg-cyan-600";
      case "out_for_delivery":
        return "bg-cyan-600";
      case "delivery_attempted":
        return "bg-amber-600";
      case "delivered":
        return "bg-emerald-600";
      case "on_hold":
        return "bg-amber-600";
      case "returned_to_sender":
        return "bg-red-600";
      case "cancelled":
        return "bg-gray-600";
      case "refunded":
        return "bg-gray-600";
      case "lost_in_transit":
        return "bg-red-600";
      case "damaged":
        return "bg-red-600";
      case "awaiting_customer_action":
        return "bg-amber-600";

      // Estados legacy para compatibilidad
      case "shipped":
      case "en_transito":
        return "bg-indigo-600";
      case "entregado":
        return "bg-green-600";
      case "cancelado":
        return "bg-red-600";
      case "processing":
      case "procesando":
      case "en preparación":
        return "bg-orange-600";
      case "confirmed":
      case "confirmado":
        return "bg-blue-600";
      case "ready_pickup":
      case "listo para recoger":
        return "bg-orange-600";
      case "waiting_schedule":
      case "esperando horario":
        return "bg-cyan-600";
      case "pending":
      case "pendiente":
        return "bg-yellow-600";
      case "order_ready":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  // Función para obtener el progreso del pedido (0-100) - Estados exactos de la API
  const getOrderProgress = (status) => {
    const progressMap = {
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
      on_hold: 50, // Progreso estimado
      returned_to_sender: 0,
      cancelled: 0,
      refunded: 0,
      lost_in_transit: 0,
      damaged: 0,
      awaiting_customer_action: 50, // Progreso estimado

      // Estados legacy para compatibilidad
      pending: 0,
      pendiente: 0,
      confirmed: 5,
      confirmado: 5,
      processing: 10,
      procesando: 10,
      shipped: 97,
      enviado: 97,
      entregado: 100,
      order_ready: 95,
    };

    return progressMap[status?.toLowerCase()] || 0;
  };

  // Función para obtener el icono del estado
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      // Estados iniciales
      case "pending_payment":
      case "pending":
      case "pendiente":
        return <Clock className="h-4 w-4" />;
      case "payment_confirmed":
      case "confirmed":
      case "confirmado":
        return <CheckCircle className="h-4 w-4" />;

      // Estados de preparación y verificación
      case "preparing_order":
      case "processing":
      case "procesando":
      case "stock_verification":
        return <Package className="h-4 w-4" />;
      case "awaiting_supplier":
        return <Clock className="h-4 w-4" />;

      // Estados de importación
      case "ordering_overseas":
      case "overseas_processing":
        return <Package className="h-4 w-4" />;
      case "international_shipping":
      case "in_transit_international":
        return <Truck className="h-4 w-4" />;

      // Estados aduaneros
      case "customs_clearance":
      case "customs_inspection":
      case "paying_duties":
        return <Clock className="h-4 w-4" />;
      case "customs_approved":
        return <CheckCircle className="h-4 w-4" />;

      // Estados locales
      case "arrived_local_warehouse":
      case "local_processing":
        return <Package className="h-4 w-4" />;
      case "quality_inspection":
        return <Clock className="h-4 w-4" />;
      case "ready_for_dispatch":
      case "order_ready":
        return <Package className="h-4 w-4" />;

      // Estados de entrega
      case "dispatched":
      case "out_for_delivery":
      case "shipped":
      case "en_transito":
        return <Truck className="h-4 w-4" />;
      case "delivery_attempted":
        return <Clock className="h-4 w-4" />;
      case "delivered":
      case "entregado":
        return <CheckCircle className="h-4 w-4" />;

      // Estados especiales
      case "on_hold":
      case "awaiting_customer_action":
        return <Clock className="h-4 w-4" />;
      case "returned_to_sender":
      case "lost_in_transit":
      case "damaged":
      case "cancelled":
      case "cancelado":
        return <X className="h-4 w-4" />;
      case "refunded":
        return <CheckCircle className="h-4 w-4" />;

      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Función para obtener los pasos del pedido - Estados de la API
  const getOrderSteps = () => {
    return [
      {
        key: "pending_payment",
        label: "Pendiente Pago",
        icon: <Clock className="h-4 w-4" />,
      },
      {
        key: "payment_confirmed",
        label: "Pago Confirmado",
        icon: <CheckCircle className="h-4 w-4" />,
      },
      {
        key: "awaiting_supplier",
        label: "Esperando Proveedor",
        icon: <Clock className="h-4 w-4" />,
      },
      {
        key: "ordering_overseas",
        label: "Pedido Internacional",
        icon: <Package className="h-4 w-4" />,
      },
      {
        key: "in_transit_international",
        label: "En Tránsito",
        icon: <Truck className="h-4 w-4" />,
      },
      {
        key: "customs_approved",
        label: "Aprobado Aduana",
        icon: <CheckCircle className="h-4 w-4" />,
      },
      {
        key: "arrived_local_warehouse",
        label: "Almacén Local",
        icon: <Package className="h-4 w-4" />,
      },
      {
        key: "out_for_delivery",
        label: "En Reparto",
        icon: <Truck className="h-4 w-4" />,
      },
      {
        key: "delivered",
        label: "Entregado",
        icon: <CheckCircle className="h-4 w-4" />,
      },
    ];
  };

  // Función para obtener el estado de cada paso - Estados de la API
  const getStepStatus = (stepKey, currentStatus, order = null) => {
    // Si tenemos trackingSteps del backend, usar esa información primero
    if (order?.trackingSteps && Array.isArray(order.trackingSteps)) {
      const trackingStep = order.trackingSteps.find(
        (step) => step.status === stepKey
      );
      if (trackingStep) {
        if (trackingStep.current) return "current";
        if (trackingStep.completed) return "completed";
        return "pending";
      }
    }

    // Orden de los estados de la API
    const statusOrder = [
      "pending_payment",
      "payment_confirmed",
      "preparing_order",
      "stock_verification",
      "awaiting_supplier",
      "ordering_overseas",
      "overseas_processing",
      "international_shipping",
      "in_transit_international",
      "customs_clearance",
      "customs_inspection",
      "customs_approved",
      "paying_duties",
      "arrived_local_warehouse",
      "quality_inspection",
      "local_processing",
      "ready_for_dispatch",
      "dispatched",
      "out_for_delivery",
      "delivery_attempted",
      "delivered",
    ];

    const currentIndex = statusOrder.indexOf(currentStatus?.toLowerCase());
    const stepIndex = statusOrder.indexOf(stepKey);

    // Estados especiales
    if (
      [
        "cancelled",
        "refunded",
        "lost_in_transit",
        "damaged",
        "returned_to_sender",
      ].includes(currentStatus?.toLowerCase())
    ) {
      return "cancelled";
    }

    if (
      currentStatus?.toLowerCase() === "on_hold" ||
      currentStatus?.toLowerCase() === "awaiting_customer_action"
    ) {
      // Para estados en espera, mostrar progreso hasta donde llegó
      if (stepIndex <= currentIndex) {
        return "completed";
      } else {
        return "pending";
      }
    }

    // Lógica especial para preparing_order - no debe completar pasos futuros
    if (
      currentStatus?.toLowerCase() === "preparing_order" ||
      currentStatus?.toLowerCase() === "stock_verification"
    ) {
      // Si está en preparación, solo mostrar como completado pending_payment y payment_confirmed
      if (stepKey === "pending_payment" || stepKey === "payment_confirmed") {
        return "completed";
      } else if (stepKey === "awaiting_supplier") {
        return "current"; // El siguiente paso lógico
      } else {
        return "pending";
      }
    }

    // Lógica especial para overseas_processing - mostrar progreso correcto
    if (currentStatus?.toLowerCase() === "overseas_processing") {
      // Estados completados hasta overseas_processing
      const completedSteps = [
        "pending_payment",
        "payment_confirmed",
        "preparing_order",
        "stock_verification",
        "awaiting_supplier",
        "ordering_overseas",
      ];

      if (completedSteps.includes(stepKey)) {
        return "completed";
      } else if (stepKey === "overseas_processing") {
        return "current";
      } else {
        return "pending";
      }
    }

    // Mapeo para estados legacy
    const statusMapping = {
      pending: "pending_payment",
      pendiente: "pending_payment",
      confirmed: "payment_confirmed",
      confirmado: "payment_confirmed",
      processing: "preparing_order",
      procesando: "preparing_order",
      shipped: "dispatched",
      enviado: "dispatched",
      entregado: "delivered",
      order_ready: "ready_for_dispatch",
    };

    const mappedStatus =
      statusMapping[currentStatus?.toLowerCase()] ||
      currentStatus?.toLowerCase();
    const mappedCurrentIndex = statusOrder.indexOf(mappedStatus);
    const finalCurrentIndex =
      mappedCurrentIndex !== -1 ? mappedCurrentIndex : currentIndex;

    if (stepIndex < finalCurrentIndex) {
      return "completed";
    } else if (stepIndex === finalCurrentIndex) {
      return "current";
    } else {
      return "pending";
    }
  };

  const formatOrderId = (id) => {
    return `#${id.slice(-6).toUpperCase()}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleReorderProducts = (order) => {
    try {
      // Obtener los productos del pedido
      const orderItems = order.items || [];

      if (orderItems.length === 0) {
        toast({
          title: "Error",
          description: "Este pedido no tiene productos para volver a pedir",
          variant: "destructive",
        });
        return;
      }

      // Si es un solo producto, redirigir con parámetros específicos
      if (orderItems.length === 1) {
        const item = orderItems[0];
        const params = new URLSearchParams();

        // Determinar el tipo de producto
        if (
          item.type?.toLowerCase().includes("subscription") ||
          item.type?.toLowerCase().includes("suscripción")
        ) {
          params.set("product", item.productId || item.id);
          params.set("type", "subscription");
          if (item.productType) {
            params.set("product-type", item.productType);
          }
        } else {
          // Es un producto
          params.set("product", item.productId || item.id);
          params.set("type", "product");
        }

        // Redirigir al checkout con los parámetros
        router.push(`/checkout?${params.toString()}`);
        return;
      }

      // Para múltiples productos, usar localStorage como respaldo
      // Crear productos para agregar al carrito
      const cartItems = orderItems.map((item) => ({
        id: item.productId || item.id,
        type:
          item.type?.toLowerCase().includes("subscription") ||
          item.type?.toLowerCase().includes("suscripción")
            ? "subscription"
            : "product",
        quantity: item.quantity || 1,
        product: {
          id: item.productId || item.id,
          name: item.name,
          price: item.price,
          type: item.type || "product",
          image: item.image || "/placeholder.jpg",
          stock: 100, // Valor por defecto
          ...(item.productType && { productType: item.productType }),
        },
      }));

      // Guardar en localStorage para que el checkout lo cargue
      localStorage.setItem("pendingCartItems", JSON.stringify(cartItems));

      // Mostrar mensaje de éxito
      toast({
        title: "Productos agregados",
        description: `${orderItems.length} producto(s) agregado(s) al carrito`,
      });

      // Redirigir al carrito
      router.push("/checkout");
    } catch (error) {
      console.error("Error al agregar productos al carrito:", error);
      toast({
        title: "Error",
        description: "Error al agregar productos al carrito",
        variant: "destructive",
      });
    }
  };

  const renderProgressBar = (order) => {
    // No mostrar barra de progreso para pedidos completados o cancelados
    const status = order.status?.toLowerCase();
    if (
      status === "delivered" ||
      status === "cancelled" ||
      status === "entregado" ||
      status === "cancelado"
    ) {
      return null;
    }

    const progress = getOrderProgress(order.status);

    return (
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progreso del pedido</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              status === "cancelled" || status === "cancelado"
                ? "bg-red-400"
                : status === "delivered" || status === "entregado"
                ? "bg-green-500"
                : "bg-amber-500"
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  // Función para obtener el pedido más reciente en camino
  const getActiveShippingOrder = () => {
    return (orders ?? []).find(
      (order) =>
        order.status?.toLowerCase() === "shipped" ||
        order.status?.toLowerCase() === "shipping" ||
        order.status?.toLowerCase() === "en camino" ||
        order.status?.toLowerCase() === "enviado"
    );
  };

  // Función para calcular rango horario de entrega
  const getDeliveryTimeRange = (order) => {
    if (order.deliveryTime?.timeRange) {
      return order.deliveryTime.timeRange;
    }

    // Si no hay timeRange específico, calcularlo basado en la hora del pedido
    const orderDate = new Date(order.date);
    const orderHour = orderDate.getHours();

    // Agregar 2 horas para el rango de entrega
    const startHour = orderHour;
    const endHour = orderHour + 2;

    const formatHour = (hour) => {
      const adjustedHour = hour > 23 ? hour - 24 : hour;
      return `${adjustedHour.toString().padStart(2, "0")}:00`;
    };

    return `${formatHour(startHour)} - ${formatHour(endHour)}`;
  };

  const statusOptions = [
    { value: "all", label: "Todos los pedidos", count: (orders ?? []).length },
    {
      value: "pending",
      label: "Pendientes",
      count: (orders ?? []).filter(
        (o) =>
          o.status?.toLowerCase() === "pending" ||
          o.status?.toLowerCase() === "pendiente" ||
          o.status?.toLowerCase() === "confirmed" ||
          o.status?.toLowerCase() === "confirmado" ||
          o.status?.toLowerCase() === "processing" ||
          o.status?.toLowerCase() === "procesando" ||
          o.status?.toLowerCase() === "en preparación" ||
          o.status?.toLowerCase() === "shipped" ||
          o.status?.toLowerCase() === "shipping" ||
          o.status?.toLowerCase() === "en camino" ||
          o.status?.toLowerCase() === "enviado" ||
          o.status?.toLowerCase() === "ready_pickup" ||
          o.status?.toLowerCase() === "listo para recoger" ||
          o.status?.toLowerCase() === "waiting_schedule" ||
          o.status?.toLowerCase() === "esperando horario"
      ).length,
    },

    {
      value: "delivered",
      label: "Entregados",
      count: (orders ?? []).filter(
        (o) =>
          o.status?.toLowerCase() === "delivered" ||
          o.status?.toLowerCase() === "entregado"
      ).length,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <ProfileHeader
        title="Mis Pedidos"
        subtitle="Gestiona y revisa el historial de todos tus pedidos de productos"
        backUrl="/perfil"
        backLabel="Volver al Perfil"
      />

      {/* Content */}
      <div className="container py-8">
        {/* Filters */}
        <Card className="mb-6 bg-white/70 backdrop-blur-sm border-amber-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Filtrar pedidos</CardTitle>
            <CardDescription>
              Filtra tus pedidos por estado para encontrar lo que buscas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={
                    statusFilter === option.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setStatusFilter(option.value)}
                  className={
                    statusFilter === option.value
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "border-amber-300 hover:bg-amber-50"
                  }
                >
                  {option.label}
                  {option.count > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-white/20 text-current"
                    >
                      {option.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card de Progreso del Pedido en Camino */}
        {getActiveShippingOrder() && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-600 p-3 rounded-full">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900">
                    ¡Tu pedido está en camino! 🚚
                  </h3>
                  <p className="text-blue-700">
                    Pedido {formatOrderId(getActiveShippingOrder()._id)} -
                    Total: {formatPrice(getActiveShippingOrder().total || 0)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-300 hover:bg-blue-50 text-blue-700"
                  onClick={() => openOrderDetails(getActiveShippingOrder())}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Button>
              </div>

              {/* Barra de Progreso */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium text-blue-800">
                  <span>Progreso del envío</span>
                  <span>En tránsito</span>
                </div>

                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full relative overflow-hidden"
                    style={{ width: "75%" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>

                {/* Estados del Progreso */}
                <div className="flex justify-between text-xs text-blue-700 mt-2">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mb-1"></div>
                    <span>Confirmado</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mb-1"></div>
                    <span>Preparando</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mb-1 animate-pulse"></div>
                    <span>En camino</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-300 rounded-full mb-1"></div>
                    <span>Entregado</span>
                  </div>
                </div>
              </div>

              {/* Información de tiempo de entrega */}
              <div className="mt-4 p-4 bg-white/60 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-blue-800 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-semibold">
                    Tiempo estimado de entrega:
                  </span>
                  <span className="font-bold text-blue-900">
                    {getDeliveryTimeRange(getActiveShippingOrder())}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Tu pedido llegará pronto a{" "}
                    {getActiveShippingOrder().shippingAddress ||
                      getActiveShippingOrder().shippingInfo?.address ||
                      "tu dirección registrada"}
                  </span>
                </div>
              </div>

              {/* Información de productos si está disponible */}
              {getActiveShippingOrder().products &&
                getActiveShippingOrder().products.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-2">
                      Productos en este pedido:
                    </div>
                    <div className="space-y-1">
                      {getActiveShippingOrder()
                        .products.slice(0, 3)
                        .map((product, index) => (
                          <div
                            key={index}
                            className="text-blue-700 text-sm flex justify-between"
                          >
                            <span>
                              {product.quantity}x {product.name}
                            </span>
                            <span className="font-medium">
                              {formatPrice(product.price * product.quantity)}
                            </span>
                          </div>
                        ))}
                      {getActiveShippingOrder().products.length > 3 && (
                        <div className="text-blue-600 text-sm font-medium">
                          y {getActiveShippingOrder().products.length - 3}{" "}
                          productos más...
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        {ordersLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        ) : (filteredOrders ?? []).length > 0 ? (
          <div className="space-y-4">
            {(filteredOrders ?? []).map((order) => (
              <Card
                key={order._id}
                className="bg-white/70 backdrop-blur-sm border-amber-200 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <h3 className="font-semibold text-lg">
                            Pedido {order.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Realizado el{" "}
                            {formatDate(order.createdAt || new Date())}
                          </p>
                        </div>
                        <Badge
                          className={`${getStatusBadgeColor(
                            order.status
                          )} text-white`}
                        >
                          {getStatusText(order.status)}
                        </Badge>
                      </div>

                      {/* Barra de progreso */}
                      <div className="mb-3">{renderProgressBar(order)}</div>

                      {/* Order Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            {order.items?.length || 0} artículo(s)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {formatPrice(order.total || 0)}
                          </span>
                        </div>
                        {order.shippingAddress && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600 truncate">
                              {order.shippingAddress}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Items Preview */}
                      {order.items && order.items.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Artículos del pedido:
                          </p>
                          <div className="space-y-1">
                            {order.items.slice(0, 3).map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-gray-600">
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="font-medium">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-xs text-gray-500">
                                +{order.items.length - 3} artículo(s) más
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-amber-300 hover:bg-amber-50"
                        onClick={() => openOrderDetails(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                      {(order.status?.toLowerCase() === "delivered" ||
                        order.status?.toLowerCase() === "entregado") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 hover:bg-green-50 text-green-700"
                          onClick={() => handleReorderProducts(order)}
                        >
                          Volver a Pedir
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {statusFilter === "all"
                  ? "No tienes pedidos aún"
                  : `No tienes pedidos ${statusOptions
                      .find((o) => o.value === statusFilter)
                      ?.label.toLowerCase()}`}
              </h3>
              <p className="text-gray-600 mb-6">
                {statusFilter === "all"
                  ? "¡Explora nuestros productos y haz tu primer pedido!"
                  : "Prueba con un filtro diferente o explora nuestros productos."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {statusFilter !== "all" && (
                  <Button
                    variant="outline"
                    onClick={() => setStatusFilter("all")}
                    className="border-amber-300 hover:bg-amber-50"
                  >
                    Ver todos los pedidos
                  </Button>
                )}
                <Link href="/productos">
                  <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                    Explorar Productos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Detalles del Pedido */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-600" />
              Detalles del Pedido #{selectedOrder?.id}
            </DialogTitle>
            <DialogDescription>
              Información completa de tu pedido
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Usar el componente OrderTrackingComponent */}
              <OrderTrackingComponent
                orderId={selectedOrder.id || selectedOrder._id}
              />

              {/* Acciones del Modal */}
              <div className="flex justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={closeOrderDetails}
                  className="flex-1"
                >
                  Cerrar
                </Button>
                {(selectedOrder.status?.toLowerCase() === "delivered" ||
                  selectedOrder.status?.toLowerCase() === "entregado") && (
                  <Button
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                    onClick={() => handleReorderProducts(selectedOrder)}
                  >
                    Volver a Pedir
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
