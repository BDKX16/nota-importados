"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Truck, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { calculateShipping } from "@/services/public";

interface ShippingCostCardProps {
  cartItems: any[];
  onShippingCalculated?: (cost: number) => void;
}

export default function ShippingCostCard({
  cartItems,
  onShippingCalculated,
}: ShippingCostCardProps) {
  const [postalCode, setPostalCode] = useState("");
  const [shippingData, setShippingData] = useState<{
    cost: number;
    estimatedDays: string;
    postalCode: string;
  } | null>(null);
  const { toast } = useToast();
  const { callEndpoint, loading } = useFetchAndLoad();

  const handleCalculateShipping = async () => {
    if (!postalCode || postalCode.length < 4) {
      toast({
        title: "Código postal inválido",
        description: "Ingresa un código postal válido",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await callEndpoint(
        calculateShipping(postalCode, cartItems)
      );

      if (response.success && response.data) {
        const {
          cost,
          estimatedDays,
          postalCode: cleanPostalCode,
        } = response.data;

        setShippingData({
          cost,
          estimatedDays,
          postalCode: cleanPostalCode,
        });

        if (onShippingCalculated) {
          onShippingCalculated(cost);
        }

        toast({
          title: "Costo calculado",
          description: `Envío: $${cost.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          })}`,
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Error calculating shipping:", error);

      // El error ya viene procesado del backend
      let errorMessage = "Error al calcular el envío";

      if (error.error) {
        switch (error.error) {
          case "INVALID_POSTAL_CODE":
          case "INVALID_POSTAL_CODE_FORMAT":
            errorMessage = "Código postal inválido";
            break;
          case "INVALID_ITEMS":
            errorMessage = "Error con los productos del carrito";
            break;
          case "SERVICE_NOT_AVAILABLE":
            errorMessage = "Servicio no disponible para esta ubicación";
            break;
          case "TIMEOUT_ERROR":
            errorMessage = "Tiempo de espera agotado, intenta nuevamente";
            break;
          case "CONNECTION_ERROR":
            errorMessage = "Error de conexión, intenta nuevamente";
            break;
          case "RATE_LIMIT_EXCEEDED":
            errorMessage = "Demasiadas consultas, espera un momento";
            break;
          default:
            errorMessage = error.message || "Error al calcular el envío";
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="h-5 w-5" />
          Costo de Envío
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Ingresa tu código postal</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="postalCode"
                placeholder="Ej: 1425"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleCalculateShipping}
              disabled={!postalCode || loading}
              className="whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                "Calcular"
              )}
            </Button>
          </div>
        </div>

        {shippingData && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">
                Envío a {shippingData.postalCode}
              </span>
              <span className="text-lg font-bold text-green-900">
                {formatPrice(shippingData.cost)}
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Entrega estimada: {shippingData.estimatedDays} días hábiles
            </p>
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              •{" "}
              {cartItems.reduce(
                (total, item) => total + (item.quantity || 1),
                0
              )}{" "}
              producto(s) en el carrito
            </p>
            <p>
              • Total:{" "}
              {formatPrice(
                cartItems.reduce(
                  (total, item) => total + item.price * (item.quantity || 1),
                  0
                )
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
