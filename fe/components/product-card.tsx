"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Heart } from "lucide-react";
import type { Product } from "@/redux/slices/productSlice";
import { useCart } from "@/hooks/redux-hooks";
import { useState, memo, useCallback } from "react";
import CachedImage from "@/components/ui/cached-image";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = memo(function ProductCard({
  product,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = useCallback(() => {
    addToCart(product);
  }, [addToCart, product]);

  const handleToggleLike = useCallback(() => {
    setIsLiked((prev) => !prev);
  }, []);

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 rounded-none py-0">
      <div className="relative aspect-square overflow-hidden bg-muted py-0">
        <CachedImage
          src={product.images?.[0] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          fallback="/placeholder.svg"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={handleToggleLike}
        >
          <Heart
            className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
          />
        </Button>
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
          {product.brand}
        </Badge>
      </div>

      <CardContent className="p-6 space-y-4 pt-0">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-balance leading-tight">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground text-pretty line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {product.volume || "N/A"}
            </span>
            <span className="text-2xl font-bold text-primary">
              ${product.price}
            </span>
          </div>
        </div>

        <Button onClick={handleAddToCart} className="w-full" size="lg">
          <ShoppingBag className="mr-2 h-4 w-4" />
          Agregar al Carrito
        </Button>
      </CardContent>
    </Card>
  );
});
