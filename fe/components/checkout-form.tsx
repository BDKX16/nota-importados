"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Truck, Shield } from "lucide-react";
import { useCart } from "@/hooks/redux-hooks";
import { useState } from "react";

export function CheckoutForm() {
  const { cart, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cartTotal;
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Clear cart and show success
    clearCart();
    setIsProcessing(false);
    alert("¡Pedido realizado con éxito! Recibirás un email de confirmación.");
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
        <p className="text-muted-foreground mb-6">
          Agrega algunos productos antes de proceder al checkout.
        </p>
        <Button asChild>
          <a href="/productos">Ir a Productos</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Checkout Form */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Información de Envío
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" placeholder="Juan" required />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" placeholder="Pérez" required />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@ejemplo.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" placeholder="Calle Principal 123" required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" placeholder="Madrid" required />
              </div>
              <div>
                <Label htmlFor="state">Provincia</Label>
                <Input id="state" placeholder="Madrid" required />
              </div>
              <div>
                <Label htmlFor="zip">Código Postal</Label>
                <Input id="zip" placeholder="28001" required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Información de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Número de Tarjeta</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Fecha de Vencimiento</Label>
                <Input id="expiry" placeholder="MM/AA" required />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" required />
              </div>
            </div>
            <div>
              <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
              <Input id="cardName" placeholder="Juan Pérez" required />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Tus datos están protegidos con encriptación SSL</span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={item.images?.[0] || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-balance leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{item.brand}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {item.quantity}x
                  </Badge>
                  <p className="text-sm font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Envío:</span>
                <span>
                  {shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Impuestos:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            {shipping === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium">
                  ¡Envío gratuito aplicado!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? "Procesando..." : `Pagar $${total.toFixed(2)}`}
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Al realizar el pedido, aceptas nuestros términos y condiciones.</p>
          <p>Recibirás un email de confirmación una vez procesado el pago.</p>
        </div>
      </div>
    </div>
  );
}
