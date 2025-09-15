"use client";

import { HeaderSecondary } from "@/components/header-secondary";
import { ProductGrid } from "@/components/product-grid";
import { ProductFilters } from "@/components/product-filters";
import { ImageCacheDebug } from "@/components/debug/ImageCacheDebug";
import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface Filters {
  category?: string;
  type?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({});
  const [productsCount, setProductsCount] = useState<number>(0);
  const [initialFiltersLoaded, setInitialFiltersLoaded] = useState(false);

  // Leer parámetros de URL al cargar la página
  useEffect(() => {
    const urlFilters: Filters = {};

    // Leer todos los parámetros de URL posibles
    if (searchParams.get("brand")) {
      urlFilters.brand = searchParams.get("brand")!;
    }
    if (searchParams.get("category")) {
      urlFilters.category = searchParams.get("category")!;
    }
    if (searchParams.get("type")) {
      urlFilters.type = searchParams.get("type")!;
    }
    if (searchParams.get("search")) {
      urlFilters.search = searchParams.get("search")!;
    }
    if (searchParams.get("minPrice")) {
      urlFilters.minPrice = Number(searchParams.get("minPrice"));
    }
    if (searchParams.get("maxPrice")) {
      urlFilters.maxPrice = Number(searchParams.get("maxPrice"));
    }

    // Solo actualizar si hay filtros de URL o si es la primera carga
    if (Object.keys(urlFilters).length > 0 || !initialFiltersLoaded) {
      setFilters(urlFilters);
      setInitialFiltersLoaded(true);
    }
  }, [searchParams, initialFiltersLoaded]);

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleProductsCountChange = useCallback((count: number) => {
    setProductsCount(count);
  }, []);

  // Obtener el título dinámico basado en los filtros
  const getPageTitle = () => {
    if (filters.brand) {
      return `Productos de ${filters.brand}`;
    }
    if (filters.category) {
      return `Productos en ${filters.category}`;
    }
    if (filters.search) {
      return `Resultados para "${filters.search}"`;
    }
    return "Nuestra Colección";
  };

  const getPageSubtitle = () => {
    if (filters.brand) {
      return `Descubre todos los productos auténticos de la marca ${filters.brand}`;
    }
    if (filters.category) {
      return `Explora nuestra selección de productos en la categoría ${filters.category}`;
    }
    if (filters.search) {
      return `Productos que coinciden con tu búsqueda`;
    }
    return "Descubre perfumes exclusivos de las mejores marcas del mundo";
  };

  return (
    <div className="min-h-screen bg-white">
      <HeaderSecondary />
      <main className="container mx-auto px-4 py-8 bg-white">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            {getPageTitle()}
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            {getPageSubtitle()}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ProductFilters
                initialFilters={initialFiltersLoaded ? filters : undefined}
                onFiltersChange={handleFiltersChange}
              />
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
