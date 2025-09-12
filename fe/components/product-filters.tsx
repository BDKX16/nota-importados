"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { useState } from "react"

export function ProductFilters() {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const brands = ["Chanel", "Dior", "Tom Ford", "Creed", "YSL", "Maison Margiela"]
  const priceRanges = ["$0 - $100", "$100 - $200", "$200 - $300", "$300+"]

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar perfumes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Brand Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Marcas</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <Badge
              key={brand}
              variant={selectedBrand === brand ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
            >
              {brand}
            </Badge>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-3">
        <span className="font-medium">Precio</span>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map((range) => (
            <Badge
              key={range}
              variant="outline"
              className="cursor-pointer hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              {range}
            </Badge>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full bg-transparent"
        onClick={() => {
          setSelectedBrand(null)
          setSearchTerm("")
        }}
      >
        Limpiar Filtros
      </Button>
    </div>
  )
}
