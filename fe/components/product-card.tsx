"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Heart } from "lucide-react"
import type { Product } from "@/lib/store"
import { useStore } from "@/lib/store"
import { useState } from "react"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { dispatch } = useStore()
  const [isLiked, setIsLiked] = useState(false)

  const handleAddToCart = () => {
    dispatch({ type: "ADD_TO_CART", product })
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">{product.brand}</Badge>
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-balance leading-tight">{product.name}</h3>
          <p className="text-sm text-muted-foreground text-pretty line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{product.size}</span>
            <span className="text-2xl font-bold text-primary">${product.price}</span>
          </div>
        </div>

        <Button onClick={handleAddToCart} className="w-full" size="lg">
          <ShoppingBag className="mr-2 h-4 w-4" />
          Agregar al Carrito
        </Button>
      </CardContent>
    </Card>
  )
}
