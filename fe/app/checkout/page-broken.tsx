"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Check,
  Info,
  Truck,
  Tag,
  X,
  ArrowLeft,
  MapPin,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserAuthForm from "@/components/auth/user-auth-form";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/redux-hooks";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import {
  getBeers,
  getSubscriptionPlans,
  validateDiscount,
} from "@/services/public";
import {
  createMercadoPagoPreference,
  processDirectPayment,
  updateUserProfile,
} from "@/services/private";
import MercadoPagoOptions from "@/components/checkout/MercadoPagoOptions";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Definición de tipos para perfumes
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  description?: string;
  volume?: string;
  concentration?: string;
  stock: number;
  category: string;
  categoryId: string;
  type: string;
}

interface Subscription {
  id: string;
  name: string;
  deliveryFrequency: number; // días entre entregas
  price: number;
  perfumeCategories?: string[];
  features: string[];
  popular?: boolean;
}

interface Discount {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase?: number;
  validUntil?: string;
  description: string;
  appliesTo?: "all" | "product" | "subscription";
}

export default function CheckoutPage() {
  // Usar Redux cart en lugar de estado local
  const { 
    cart, 
    cartTotal, 
    cartCount, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    addToCart
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<Subscription[]>([]);
  const [showSubscriptionSuggestion, setShowSubscriptionSuggestion] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "auth" | "payment">("cart");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [loadingDiscount, setLoadingDiscount] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "cash">("mercadopago");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState("");
  const [hasValidAddress, setHasValidAddress] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [modalPhone, setModalPhone] = useState("");
  const [modalAddress, setModalAddress] = useState("");
  const [modalErrors, setModalErrors] = useState({ phone: "", address: "" });
  const [savingAddress, setSavingAddress] = useState(false);
  
  // Cargar datos del backend
  useEffect(() => {
    const loadProductsData = async () => {
      try {
        // Cargar productos (adaptado de cervezas)
        setLoadingProducts(true);
        const productsResponse = await callEndpoint(getBeers()); // Cambiar por getProducts cuando exista
        if (productsResponse && productsResponse.data && productsResponse.data.beers) {
          // Mapear cervezas a productos de perfume temporalmente
          const mappedProducts = productsResponse.data.beers.map((beer: any) => ({
            id: beer.id,
            name: beer.name,
            brand: beer.type || "Sin marca", // Mapear type a brand temporalmente
            price: beer.price,
            images: [beer.image || "/placeholder.svg"],
            description: beer.description,
            volume: "50ml", // Valor por defecto para perfumes
            concentration: "Eau de Parfum", // Valor por defecto
            stock: beer.stock,
            category: "Perfume",
            categoryId: "perfume",
            type: "perfume"
          }));
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setError("Error al cargar productos");
      } finally {
        setLoadingProducts(false);
      }

      try {
        // Cargar planes de suscripción
        setLoadingSubscriptions(true);
        const subsResponse = await callEndpoint(getSubscriptionPlans());
        if (subsResponse && subsResponse.data && subsResponse.data.subscriptions) {
          const subsWithDefaults = subsResponse.data.subscriptions.map((sub: any) => ({
            ...sub,
            deliveryFrequency: 30, // 30 días por defecto
            perfumeCategories: ["Fragancias masculinas", "Fragancias femeninas"]
          }));
          setSubscriptionPlans(subsWithDefaults);
        }
      } catch (error) {
        console.error("Error al cargar planes de suscripción:", error);
        setError("Error al cargar planes de suscripción");
      } finally {
        setLoadingSubscriptions(false);
      }
    };

    loadProductsData();
  }, []);

  // Simular que venimos de una página anterior con un producto ya seleccionado
  useEffect(() => {
    if (typeof window !== "undefined" && !loadingProducts && !loadingSubscriptions) {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get("product");
      const productType = params.get("type");

      if (productId && productType) {
        // Verificar si ya existe un producto del mismo tipo en Redux cart
        const existingOfSameType = cart.find((item) => item.id === productId);

        if (!existingOfSameType) {
          if (productType === "product" || productType === "beer") {
            const product = products.find((p) => p.id === productId);
            if (product) {
              addToCart(product);
            }
          } else if (productType === "subscription") {
            const subscription = subscriptionPlans.find((s) => s.id === productId);
            if (subscription) {
              // Para suscripciones, necesitaríamos una lógica especial
              // Por ahora las tratamos como productos normales
              addToCart({
                id: subscription.id,
                name: subscription.name,
                brand: "Suscripción",
                price: subscription.price,
                images: ["/placeholder.svg"],
                description: subscription.features.join(", "),
                volume: "Variado",
                concentration: "Variado",
                stock: 99,
                category: "Suscripción",
                categoryId: "subscription",
                type: "subscription"
              });
            }
          }
        }
      }
    }
  }, [products, subscriptionPlans, loadingProducts, loadingSubscriptions, cart, addToCart]);

  // Verificar si debemos mostrar sugerencias de suscripción
  useEffect(() => {
    const hasSubscription = cart.some((item) => item.type === "subscription");
    const hasOnlyProducts = cart.length > 0 && cart.every((item) => item.type !== "subscription");

    setShowSubscriptionSuggestion(hasOnlyProducts && !hasSubscription);
  }, [cart]);

  // Inicializar dirección de entrega cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user?.address) {
      setDeliveryAddress(user.address);
      setTempAddress(user.address);
      setHasValidAddress(true);
    } else if (isAuthenticated) {
      setDeliveryAddress("");
      setTempAddress("");
      setHasValidAddress(false);
    }
  // Funciones para manejo de dirección de entrega
  const handleEditAddress = () => {
    setIsEditingAddress(true);
    setTempAddress(deliveryAddress);
  };

  const handleSaveAddress = () => {
    if (tempAddress.trim().length < 10) {
      toast({
        title: "Dirección inválida",
        description: "La dirección debe ser más específica (al menos 10 caracteres)",
        variant: "destructive",
      });
      return;
    }
    setDeliveryAddress(tempAddress.trim());
    setHasValidAddress(true);
    setIsEditingAddress(false);
    toast({
      title: "Dirección actualizada",
      description: "La dirección de entrega ha sido actualizada para este pedido",
    });
  };

  const handleCancelEditAddress = () => {
    setTempAddress(deliveryAddress);
    setIsEditingAddress(false);
  };

  // Cálculos para el carrito (adaptado para perfumes)
  const calculateItemPrice = (item: any) => {
    return item.price * item.quantity;
  };

  const calculateSubtotal = () => {
    return cartTotal; // Usar el total calculado en Redux
  };

  const calculateDiscountAmount = () => {
    if (!appliedDiscount) return 0;

    const subtotal = calculateSubtotal();
    let applicableSubtotal = subtotal;

    // Si el descuento aplica solo a ciertos productos
    if (appliedDiscount.appliesTo && appliedDiscount.appliesTo !== "all") {
      applicableSubtotal = cart
        .filter((item) => 
          appliedDiscount.appliesTo === "product" ? item.type === "perfume" : 
          appliedDiscount.appliesTo === "subscription" ? item.type === "subscription" : true
        )
        .reduce((total, item) => total + calculateItemPrice(item), 0);
    }

    if (appliedDiscount.type === "percentage") {
      return Math.round((applicableSubtotal * appliedDiscount.value) / 100);
    } else {
      return Math.min(appliedDiscount.value, applicableSubtotal);
    }
  };

  const calculateShippingCost = () => {
    const subtotal = calculateSubtotal();
    const hasSubscription = cart.some((item) => item.type === "subscription");
    
    // Envío gratis para suscripciones o compras mayores a $100
    if (hasSubscription || subtotal >= 100) {
      return 0;
    }
    
    // Costo base de envío
    return 15;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscountAmount();
    const shippingCost = calculateShippingCost();
    return subtotal - discountAmount + shippingCost;
  };

  // Funciones para descuentos
  const applyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Por favor ingresa un código de descuento");
      return;
    }

    setLoadingDiscount(true);
    setDiscountError("");

    try {
      const result = await callEndpoint(validateDiscount(discountCode.trim()));
      
      if (result && result.data && result.data.valid) {
        const discount = result.data.discount;
        
        // Verificar compra mínima
        if (discount.minPurchase && calculateSubtotal() < discount.minPurchase) {
          setDiscountError(`Este descuento requiere una compra mínima de $${discount.minPurchase}`);
          return;
        }

        setAppliedDiscount(discount);
        toast({
          title: "¡Descuento aplicado!",
          description: `Has ahorrado ${discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`}`,
        });
      } else {
        setDiscountError("Código de descuento inválido o expirado");
      }
    } catch (error) {
      setDiscountError("Error al validar el descuento");
    } finally {
      setLoadingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
  };

  // Funciones de checkout
  const proceedToAuth = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de continuar",
        variant: "destructive",
      });
      return;
    }

    if (isAuthenticated) {
      setCheckoutStep("payment");
    } else {
      setCheckoutStep("auth");
    }
  };

  const proceedToPayment = () => {
    if (!isAuthenticated) {
      toast({
        title: "Autenticación requerida",
        description: "Debes estar autenticado para continuar",
        variant: "destructive",
      });
      return;
    }

    if (!hasValidAddress) {
      setShowAddressModal(true);
      return;
    }

    setCheckoutStep("payment");
  };

  const processOrder = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para realizar el pedido",
        variant: "destructive",
      });
      return;
    }

    if (!hasValidAddress) {
      toast({
        title: "Dirección requerida",
        description: "Debes proporcionar una dirección de entrega",
        variant: "destructive",
      });
      return;
    }

    setLoadingCheckout(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: calculateSubtotal(),
        discount: appliedDiscount,
        discountAmount: calculateDiscountAmount(),
        shippingCost: calculateShippingCost(),
        total: calculateTotal(),
        deliveryAddress,
        paymentMethod
      };

      if (paymentMethod === "mercadopago") {
        const preferenceResult = await callEndpoint(createMercadoPagoPreference(orderData));
        
        if (preferenceResult?.data?.preferenceId) {
          window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceResult.data.preferenceId}`;
        } else {
          throw new Error("No se pudo crear la preferencia de pago");
        }
      } else {
        const paymentResult = await callEndpoint(processDirectPayment(orderData));
        
        if (paymentResult?.success) {
          clearCart();
          toast({
            title: "¡Pedido realizado!",
            description: "Tu pedido ha sido procesado exitosamente",
          });
          router.push("/pedidos");
        } else {
          throw new Error("Error al procesar el pago");
        }
      }
    } catch (error) {
      console.error("Error en checkout:", error);
      toast({
        title: "Error en el checkout",
        description: "Hubo un problema al procesar tu pedido. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingCheckout(false);
    }
  };

  // Función para manejar la actualización de dirección desde el modal
  const handleSaveAddressFromModal = async () => {
    // Validaciones
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    const errors = { phone: "", address: "" };

    if (!modalPhone.trim()) {
      errors.phone = "El teléfono es obligatorio";
    } else if (!phoneRegex.test(modalPhone.trim())) {
      errors.phone = "Formato de teléfono inválido";
    }

    if (!modalAddress.trim() || modalAddress.trim().length < 10) {
      errors.address = "La dirección debe ser más específica (mínimo 10 caracteres)";
    }

    setModalErrors(errors);

    if (errors.phone || errors.address) {
      return;
    }

    setSavingAddress(true);

    try {
      // Actualizar perfil del usuario
      const updateData = {
        phone: modalPhone.trim(),
        address: modalAddress.trim(),
      };

      const result = await callEndpoint(updateUserProfile(updateData));

      if (result?.success) {
        // Actualizar estado local
        setDeliveryAddress(modalAddress.trim());
        setHasValidAddress(true);
        
        // Actualizar contexto de usuario
        if (updateUser) {
          updateUser({
            ...user,
            phone: modalPhone.trim(),
            address: modalAddress.trim(),
          });
        }

        setShowAddressModal(false);
        toast({
          title: "Información actualizada",
          description: "Tu información de contacto y dirección han sido guardadas",
        });
      } else {
        throw new Error("Error al actualizar perfil");
      }
    } catch (error) {
      console.error("Error al actualizar dirección:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSavingAddress(false);
    }
  };

  if (loadingProducts || loadingSubscriptions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error al cargar datos</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }
  const { isAuthenticated, user } = useAuth();

  // Calcular totales
  const subtotal = cartTotal;
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep("payment");
  };

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Limpiar carrito y mostrar éxito
      clearCart();
      toast({
        title: "¡Pedido realizado con éxito!",
        description: "Recibirás un email de confirmación pronto.",
      });
      router.push("/pedidos");
    } catch (error) {
      toast({
        title: "Error en el pago",
        description: "Hubo un problema procesando tu pago. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
            <p className="text-gray-600 mb-6">
              Agrega algunos productos antes de proceder al checkout.
            </p>
            <Button asChild>
              <Link href="/productos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ir a Productos
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" asChild>
              <Link href="/productos">
                <ChevronLeft className="h-4 w-4" />
                Continuar Comprando
              </Link>
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {["cart", "shipping", "payment"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${checkoutStep === step 
                    ? "bg-primary text-white" 
                    : index < ["cart", "shipping", "payment"].indexOf(checkoutStep)
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                  }
                `}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index < ["cart", "shipping", "payment"].indexOf(checkoutStep) 
                      ? "bg-green-500" 
                      : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {checkoutStep === "cart" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Carrito de Compras</h2>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.images?.[0] || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-balance leading-tight">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.brand}</p>
                          <p className="text-sm text-gray-600">{item.volume}</p>
                          <p className="text-lg font-semibold text-primary">${item.price}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => decreaseQuantity(item.id)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      onClick={() => setCheckoutStep("shipping")}
                      className="w-full"
                      size="lg"
                    >
                      Continuar al Envío
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {checkoutStep === "shipping" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Información de Envío</h2>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          value={shippingInfo.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                          id="lastName"
                          value={shippingInfo.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={shippingInfo.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={shippingInfo.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">Ciudad</Label>
                        <Input
                          id="city"
                          value={shippingInfo.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Provincia</Label>
                        <Input
                          id="state"
                          value={shippingInfo.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">Código Postal</Label>
                        <Input
                          id="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setCheckoutStep("cart")}
                        className="flex-1"
                      >
                        Volver al Carrito
                      </Button>
                      <Button type="submit" className="flex-1">
                        Continuar al Pago
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {checkoutStep === "payment" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Información de Pago</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Vencimiento</Label>
                        <Input id="expiry" placeholder="MM/AA" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
                      <Input id="cardName" placeholder="Juan Pérez" />
                    </div>
                    
                    <div className="flex gap-4 mt-6">
                      <Button 
                        variant="outline"
                        onClick={() => setCheckoutStep("shipping")}
                        className="flex-1"
                      >
                        Volver al Envío
                      </Button>
                      <Button 
                        onClick={handlePaymentSubmit}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? "Procesando..." : `Pagar $${total.toFixed(2)}`}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Resumen del Pedido</h3>
                
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartCount} items):</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                {shipping === 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        ¡Envío gratuito aplicado!
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}