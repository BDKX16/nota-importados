"use client";

import { ProductCard } from "./product-card";
import { useState, useEffect } from "react";
import { getAllProducts } from "@/services/productsService";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";

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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { loading, callEndpoint } = useFetchAndLoad();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

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

  const applyFilters = () => {
    let filtered = [...products];

    if (filters) {
      // Filtrar por categoría
      if (filters.category) {
        filtered = filtered.filter(
          (product) =>
            product.categoryId === filters.category ||
            product.category === filters.category
        );
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

    setFilteredProducts(filtered);
    onProductsCountChange?.(filtered.length);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
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
