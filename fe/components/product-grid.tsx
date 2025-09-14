"use client";

import { ProductCard } from "./product-card";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getAllProducts } from "@/services/productsService";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  brand?: string;
  volume?: string;
  concentration?: string;
  stock: number;
  category: string;
  categoryId: string;
  type: string;
  categories?: string[];
  categoryNames?: string[];
}

interface ProductGridProps {
  filters?: {
    category?: string;
    type?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  onProductsCountChange?: (count: number) => void;
}

export function ProductGrid({
  filters,
  onProductsCountChange,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(9); // Mostrar 9 productos inicialmente
  const { loading, callEndpoint } = useFetchAndLoad();

  useEffect(() => {
    loadProducts();
  }, []);

  // Memoizar el filtrado de productos
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (filters) {
      // Filtrar por categoría (usando categoryNames)
      if (filters.category) {
        filtered = filtered.filter((product) => {
          // Buscar en el array de nombres de categorías
          if (product.categoryNames && Array.isArray(product.categoryNames)) {
            return product.categoryNames.some((catName) =>
              catName.toLowerCase().includes(filters.category!.toLowerCase())
            );
          }
          // Fallback a campos individuales si no hay categoryNames
          return (
            product.categoryId === filters.category ||
            product.category === filters.category
          );
        });
      }

      // Filtrar por tipo
      if (filters.type) {
        filtered = filtered.filter((product) => product.type === filters.type);
      }

      // Filtrar por marca
      if (filters.brand) {
        filtered = filtered.filter((product) =>
          product.brand?.toLowerCase().includes(filters.brand!.toLowerCase())
        );
      }

      // Filtrar por búsqueda
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.brand?.toLowerCase().includes(searchTerm)
        );
      }

      // Filtrar por precio
      if (filters.minPrice !== undefined) {
        filtered = filtered.filter(
          (product) => product.price >= filters.minPrice!
        );
      }

      if (filters.maxPrice !== undefined) {
        filtered = filtered.filter(
          (product) => product.price <= filters.maxPrice!
        );
      }
    }

    return filtered;
  }, [products, filters]);

  // Productos visibles (limitados por visibleCount)
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Efecto para notificar cambios en el conteo
  useEffect(() => {
    onProductsCountChange?.(filteredProducts.length);
  }, [filteredProducts.length, onProductsCountChange]);

  // Resetear visibleCount cuando cambian los filtros
  useEffect(() => {
    setVisibleCount(9);
  }, [filters]);

  const loadMoreProducts = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 9, filteredProducts.length));
  }, [filteredProducts.length]);

  const loadProducts = async () => {
    try {
      const response = await callEndpoint(getAllProducts());
      if (response && response.data && response.data.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleProducts.map((product, index) => (
          <ProductCard 
            key={product.id} 
            product={product}
          />
        ))}
      </div>
      
      {/* Botón para cargar más productos */}
      {visibleCount < filteredProducts.length && (
        <div className="flex justify-center">
          <Button 
            onClick={loadMoreProducts}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            Cargar más productos ({filteredProducts.length - visibleCount} restantes)
          </Button>
        </div>
      )}
      
      {/* Mensaje cuando no hay productos */}
      {filteredProducts.length === 0 && !loading && (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">
            No se encontraron productos que coincidan con los filtros.
          </p>
        </div>
      )}
    </div>
  );
}
