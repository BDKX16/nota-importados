"use client";

import { HeaderSecondary } from "@/components/header-secondary";
import { ProductGrid } from "@/components/product-grid";
import { ProductFilters } from "@/components/product-filters";
import { ImageCacheDebug } from "@/components/debug/ImageCacheDebug";
import { useState, useCallback } from "react";

interface Filters {
  category?: string;
  type?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export default function ProductsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [productsCount, setProductsCount] = useState<number>(0);

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleProductsCountChange = useCallback((count: number) => {
    setProductsCount(count);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HeaderSecondary />
      <main className="container mx-auto px-4 py-8 bg-white">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Nuestra Colección
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Descubre perfumes exclusivos de las mejores marcas del mundo
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ProductFilters onFiltersChange={handleFiltersChange} />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {productsCount > 0
                  ? `Mostrando ${productsCount} producto${
                      productsCount !== 1 ? "s" : ""
                    }`
                  : "Cargando productos..."}
              </span>
              <select className="text-sm border rounded-md px-3 py-1 bg-background">
                <option>Ordenar por precio</option>
                <option>Precio: menor a mayor</option>
                <option>Precio: mayor a menor</option>
                <option>Más populares</option>
              </select>
            </div>
            <ProductGrid
              filters={filters}
              onProductsCountChange={handleProductsCountChange}
            />
          </div>
        </div>
      </main>

      {/* Debug component - solo en desarrollo */}
      <ImageCacheDebug />
    </div>
  );
}
