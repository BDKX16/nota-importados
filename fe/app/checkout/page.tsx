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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { validateDiscount } from "@/services/public";
import {
  createMercadoPagoPreference,
  processDirectPayment,
  updateUserProfile,
} from "@/services/private";
import MercadoPagoOptions from "@/components/checkout/MercadoPagoOptions";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ShippingCostCard from "@/components/checkout/ShippingCostCard";

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
  // Usar Redux cart
  const {
    cart,
    cartTotal,
    cartCount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [checkoutStep, setCheckoutStep] = useState<"cart" | "auth" | "payment">(
    "cart"
  );
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [loadingDiscount, setLoadingDiscount] = useState(false);
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
  const [calculatedShippingCost, setCalculatedShippingCost] =
    useState<number>(0);

  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user, updateUser } = useAuth();
  const { callEndpoint } = useFetchAndLoad();

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
  }, [isAuthenticated, user]);

  // Funciones para manejo de dirección de entrega
  const handleEditAddress = () => {
    setIsEditingAddress(true);
    setTempAddress(deliveryAddress);
  };

  const handleSaveAddress = () => {
    if (tempAddress.trim().length < 10) {
      toast({
        title: "Dirección inválida",
        description:
          "La dirección debe ser más específica (al menos 10 caracteres)",
        variant: "destructive",
      });
      return;
    }
    setDeliveryAddress(tempAddress.trim());
    setHasValidAddress(true);
    setIsEditingAddress(false);
    toast({
      title: "Dirección actualizada",
      description:
        "La dirección de entrega ha sido actualizada para este pedido",
    });
  };

  const handleCancelEditAddress = () => {
    setTempAddress(deliveryAddress);
    setIsEditingAddress(false);
  };

  // Handler para el cálculo de envío
  const handleShippingCalculated = (cost: number) => {
    setCalculatedShippingCost(cost);
  };

  // Cálculos para el carrito
  const calculateSubtotal = () => {
    return cartTotal;
  };

  const calculateDiscountAmount = () => {
    if (!appliedDiscount) return 0;

    const subtotal = calculateSubtotal();
    let applicableSubtotal = subtotal;

    if (appliedDiscount.appliesTo && appliedDiscount.appliesTo !== "all") {
      applicableSubtotal = cart
        .filter((item) =>
          appliedDiscount.appliesTo === "product"
            ? item.type === "perfume"
            : appliedDiscount.appliesTo === "subscription"
            ? item.type === "subscription"
            : true
        )
        .reduce((total, item) => total + item.price * item.quantity, 0);
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

    if (hasSubscription || subtotal >= 100) {
      return 0;
    }

    // Si hay un costo calculado por Andreani, usarlo; sino usar el por defecto
    return calculatedShippingCost > 0 ? calculatedShippingCost : 15;
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

        if (
          discount.minPurchase &&
          calculateSubtotal() < discount.minPurchase
        ) {
          setDiscountError(
            `Este descuento requiere una compra mínima de $${discount.minPurchase}`
          );
          return;
        }

        setAppliedDiscount(discount);
        toast({
          title: "¡Descuento aplicado!",
          description: `Has ahorrado ${
            discount.type === "percentage"
              ? `${discount.value}%`
              : `$${discount.value}`
          }`,
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/nota-logo-black.jpg"
                alt="Nota Importados"
                width={40}
                height={40}
                className="object-cover rounded"
              />
              <span className="text-xl font-bold">Nota Importados</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium flex items-center gap-1 hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a la tienda
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Tu Carrito</h1>
            <p className="text-muted-foreground mt-1">
              Revisa y completa tu compra
            </p>
          </div>

          {/* Información de envío */}
          <div className="mb-6">
            <Alert
              className={`${
                calculateShippingCost() === 0
                  ? "bg-green-50 border-green-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <Truck
                className={`h-4 w-4 ${
                  calculateShippingCost() === 0
                    ? "text-green-600"
                    : "text-amber-600"
                }`}
              />
              <AlertDescription
                className={
                  calculateShippingCost() === 0
                    ? "text-green-800"
                    : "text-amber-800"
                }
              >
                {calculateShippingCost() === 0 ? (
                  <span>
                    <span className="font-bold">¡Envío GRATIS!</span>
                    {cart.some((item) => item.type === "subscription")
                      ? " Tienes una suscripción en tu carrito."
                      : ` Tu compra supera los $100.`}
                  </span>
                ) : (
                  <span>
                    <span className="font-bold">Envío gratis</span> a partir de
                    $50.000. Te faltan ${(50 - calculateSubtotal()).toFixed(2)}{" "}
                    para envío gratis.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          </div>

          {checkoutStep === "cart" && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                {/* Carrito vacío */}
                {cart.length === 0 && (
                  <div className="rounded-lg border border-dashed p-12 text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">
                      Tu carrito está vacío
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Parece que aún no has añadido ningún producto a tu
                      carrito.
                    </p>
                    <Button asChild className="mt-6 rounded-full">
                      <Link href="/productos">Explorar productos</Link>
                    </Button>
                  </div>
                )}

                {/* Productos en el carrito */}
                {cart.length > 0 && (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-start gap-4 w-full">
                            <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                              <Image
                                src={item.images?.[0] || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-lg truncate">
                                {item.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {item.brand}
                              </p>
                              {item.volume && (
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {item.volume}
                                </p>
                              )}

                              {/* Controles de cantidad - solo en móvil */}
                              <div className="mt-2 flex items-center gap-2 sm:hidden">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    if (item.quantity > 1) {
                                      updateQuantity(
                                        item.id,
                                        item.quantity - 1
                                      );
                                    } else {
                                      removeFromCart(item.id);
                                    }
                                  }}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  disabled={item.quantity >= item.stock}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Precio y controles - lado derecho */}
                            <div className="flex flex-col items-end gap-2">
                              <div className="text-right">
                                <p className="text-sm sm:text-lg font-semibold">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  ${item.price.toFixed(2)} c/u
                                </p>
                              </div>

                              {/* Controles de cantidad - solo en desktop */}
                              <div className="hidden sm:flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    if (item.quantity > 1) {
                                      updateQuantity(
                                        item.id,
                                        item.quantity - 1
                                      );
                                    } else {
                                      removeFromCart(item.id);
                                    }
                                  }}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-12 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  disabled={item.quantity >= item.stock}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Botón eliminar */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                <span className="sm:inline">Eliminar</span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar de resumen */}
              {cart.length > 0 && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Resumen del pedido
                      </h3>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Subtotal ({cartCount} productos)</span>
                          <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>

                        {appliedDiscount && (
                          <div className="flex justify-between text-green-600">
                            <span>Descuento aplicado</span>
                            <span>
                              -${calculateDiscountAmount().toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span>Envío</span>
                          <span>
                            {calculateShippingCost() === 0
                              ? "Gratis"
                              : `$${calculateShippingCost().toFixed(2)}`}
                          </span>
                        </div>

                        <Separator />

                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total</span>
                          <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Código de descuento */}
                      <div className="mt-6 pt-6 border-t">
                        <Label
                          htmlFor="discount"
                          className="text-sm font-medium"
                        >
                          Código de descuento
                        </Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="discount"
                            placeholder="Ingresa tu código"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            disabled={loadingDiscount || !!appliedDiscount}
                          />
                          {appliedDiscount ? (
                            <Button
                              variant="outline"
                              onClick={removeDiscount}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              onClick={applyDiscount}
                              disabled={loadingDiscount || !discountCode.trim()}
                            >
                              {loadingDiscount ? "..." : "Aplicar"}
                            </Button>
                          )}
                        </div>
                        {discountError && (
                          <p className="text-sm text-red-600 mt-1">
                            {discountError}
                          </p>
                        )}
                        {appliedDiscount && (
                          <p className="text-sm text-green-600 mt-1">
                            ¡Descuento aplicado! {appliedDiscount.description}
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={proceedToAuth}
                        className="w-full mt-6"
                        size="lg"
                      >
                        Continuar al checkout
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Calculadora de envío */}
                  <ShippingCostCard
                    cartItems={cart}
                    onShippingCalculated={handleShippingCalculated}
                  />
                </div>
              )}
            </div>
          )}

          {/* Paso de autenticación */}
          {checkoutStep === "auth" && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Iniciar sesión</h2>
                <p className="text-muted-foreground">
                  Inicia sesión para continuar con tu compra
                </p>
              </div>
              <Card>
                <CardContent className="p-6">
                  <UserAuthForm />
                  <div className="mt-4 text-center">
                    <Button
                      variant="ghost"
                      onClick={() => setCheckoutStep("cart")}
                    >
                      Volver al carrito
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Paso de pago */}
          {checkoutStep === "payment" && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Finalizar compra</h2>
                <p className="text-muted-foreground">
                  Revisa tu información y procede al pago
                </p>
              </div>

              <div className="flex flex-col gap-8 lg:grid lg:grid-cols-3">
                {/* Información de entrega y resumen - Móvil primero, Desktop segundo */}
                <div className="order-1 lg:order-2 lg:col-span-1 space-y-6">
                  {/* Dirección de entrega */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Dirección de entrega
                      </h3>

                      {hasValidAddress ? (
                        <div className="flex items-center justify-between">
                          <p className="text-sm">{deliveryAddress}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditAddress}
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground mb-4">
                            Necesitas proporcionar una dirección de entrega
                          </p>
                          <Button onClick={() => setShowAddressModal(true)}>
                            Agregar dirección
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Resumen final */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">Resumen final</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        {appliedDiscount && (
                          <div className="flex justify-between text-green-600">
                            <span>Descuento</span>
                            <span>
                              -${calculateDiscountAmount().toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Envío</span>
                          <span>
                            {calculateShippingCost() === 0
                              ? "Gratis"
                              : `$${calculateShippingCost().toFixed(2)}`}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Opciones de pago - Móvil segundo, Desktop primero */}
                <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">Método de pago</h3>
                      <MercadoPagoOptions
                        cart={cart}
                        user={user}
                        deliveryAddress={deliveryAddress}
                        appliedDiscount={appliedDiscount}
                        discountCode={discountCode}
                        calculateTotal={calculateTotal}
                        calculateSubtotal={calculateSubtotal}
                        calculateDiscountAmount={calculateDiscountAmount}
                        onPaymentSuccess={() => {
                          clearCart();
                          toast({
                            title: "¡Pago exitoso!",
                            description:
                              "Tu pedido ha sido procesado correctamente",
                          });
                          router.push("/pedidos");
                        }}
                        onPaymentError={(error) => {
                          toast({
                            title: "Error en el pago",
                            description: error,
                            variant: "destructive",
                          });
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Botón de navegación */}
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => setCheckoutStep("cart")}
                      className="w-full"
                    >
                      Volver al carrito
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal para dirección */}
      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Información de entrega</DialogTitle>
            <DialogDescription>
              Proporciona tu información de contacto y dirección de entrega
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={modalPhone}
                onChange={(e) => setModalPhone(e.target.value)}
                placeholder="Ej: +54 11 1234-5678"
              />
              {modalErrors.phone && (
                <p className="text-sm text-red-600 mt-1">{modalErrors.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Dirección completa</Label>
              <Input
                id="address"
                value={modalAddress}
                onChange={(e) => setModalAddress(e.target.value)}
                placeholder="Calle, número, piso, departamento, localidad"
              />
              {modalErrors.address && (
                <p className="text-sm text-red-600 mt-1">
                  {modalErrors.address}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddressModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                // Validaciones
                const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
                const errors = { phone: "", address: "" };

                if (!modalPhone.trim()) {
                  errors.phone = "El teléfono es obligatorio";
                } else if (!phoneRegex.test(modalPhone.trim())) {
                  errors.phone = "Formato de teléfono inválido";
                }

                if (!modalAddress.trim() || modalAddress.trim().length < 10) {
                  errors.address =
                    "La dirección debe ser más específica (mínimo 10 caracteres)";
                }

                setModalErrors(errors);

                if (errors.phone || errors.address) {
                  return;
                }

                setSavingAddress(true);

                try {
                  const updateData = {
                    phone: modalPhone.trim(),
                    address: modalAddress.trim(),
                  };

                  const result = await callEndpoint(
                    updateUserProfile(updateData)
                  );

                  if (result?.success) {
                    setDeliveryAddress(modalAddress.trim());
                    setHasValidAddress(true);

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
                      description:
                        "Tu información de contacto y dirección han sido guardadas",
                    });
                  } else {
                    throw new Error("Error al actualizar perfil");
                  }
                } catch (error) {
                  console.error("Error al actualizar dirección:", error);
                  toast({
                    title: "Error",
                    description:
                      "No se pudo actualizar la información. Intenta nuevamente.",
                    variant: "destructive",
                  });
                } finally {
                  setSavingAddress(false);
                }
              }}
              disabled={savingAddress}
            >
              {savingAddress ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
