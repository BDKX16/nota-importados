"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { getCategories } from "@/services/productsService";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { getBrands } from "@/services/public";
import { useToast } from "@/hooks/use-toast";
interface Category {
  _id: string;
  name: string;
  type: string;
}

interface ProductFiltersProps {
  initialFilters?: {
    category?: string;
    type?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  onFiltersChange?: (filters: {
    category?: string;
    type?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
}
interface Brand {
  _id: string;
  id: string;
  name: string;
  description?: string;
  logo?: string;
  slug: string;
  country?: string;
  foundedYear?: number;
  isPremium: boolean;
  categories?: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
export function ProductFilters({
  initialFilters,
  onFiltersChange,
}: ProductFiltersProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialFilters?.category || null
  );
  const [selectedType, setSelectedType] = useState<string | null>(
    initialFilters?.type || null
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    initialFilters?.brand || null
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState(initialFilters?.search || "");
  const [categories, setCategories] = useState<Category[]>([]);
  const { loading, callEndpoint } = useFetchAndLoad();
  const [brands, setBrands] = useState<Brand[]>([]);

  const priceRanges = [
    { label: "$0 - $100", min: 0, max: 100 },
    { label: "$100 - $200", min: 100, max: 200 },
    { label: "$200 - $300", min: 200, max: 300 },
    { label: "$300+", min: 300, max: undefined },
  ];

  const productTypes = [
    { value: "perfume", label: "Perfumes" },
    { value: "cologne", label: "Colonias" },
    { value: "bodyspray", label: "Body Sprays" },
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  // Efecto para manejar cambios en filtros iniciales
  useEffect(() => {
    if (initialFilters) {
      setSelectedCategory(initialFilters.category || null);
      setSelectedType(initialFilters.type || null);
      setSelectedBrand(initialFilters.brand || null);
      setSearchTerm(initialFilters.search || "");
      loadBrands();
      // Manejar precio inicial si existe
      if (
        initialFilters.minPrice !== undefined ||
        initialFilters.maxPrice !== undefined
      ) {
        const matchingRange = priceRanges.find(
          (range) =>
            range.min === initialFilters.minPrice &&
            (range.max === initialFilters.maxPrice ||
              (range.max === undefined &&
                initialFilters.maxPrice === undefined))
        );
        setSelectedPriceRange(matchingRange?.label || null);
      }
    }
  }, [initialFilters]);

  useEffect(() => {
    const filters: any = {};

    if (selectedCategory) filters.category = selectedCategory;
    if (selectedType) filters.type = selectedType;
    if (selectedBrand) filters.brand = selectedBrand;
    if (searchTerm) filters.search = searchTerm;

    if (selectedPriceRange) {
      const range = priceRanges.find((r) => r.label === selectedPriceRange);
      if (range) {
        filters.minPrice = range.min;
        if (range.max) filters.maxPrice = range.max;
      }
    }

    onFiltersChange?.(filters);
  }, [
    selectedCategory,
    selectedType,
    selectedBrand,
    selectedPriceRange,
    searchTerm,
  ]);

  const loadCategories = async () => {
    try {
      const response = await callEndpoint(getCategories());
      if (response && response.data && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await callEndpoint(getBrands());
      if (response && response.data && response.data.brands) {
        setBrands(response.data.brands);
      }
    } catch (error) {
      console.error("Error loading brands:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las marcas",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedType(null);
    setSelectedBrand(null);
    setSelectedPriceRange(null);
    setSearchTerm("");
  };

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

      {/* Type Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Tipo</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {productTypes.map((type) => (
            <Badge
              key={type.value}
              variant={selectedType === type.value ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() =>
                setSelectedType(selectedType === type.value ? null : type.value)
              }
            >
              {type.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <span className="font-medium">Categorías</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category._id}
                variant={
                  selectedCategory === category.name ? "default" : "outline"
                }
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.name ? null : category.name
                  )
                }
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Brand Filter */}
      <div className="space-y-3">
        <span className="font-medium">Marcas</span>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <Badge
              key={brand._id}
              variant={selectedBrand === brand.name ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() =>
                setSelectedBrand(
                  selectedBrand === brand.name ? null : brand.name
                )
              }
            >
              {brand.name}
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
              key={range.label}
              variant={
                selectedPriceRange === range.label ? "default" : "outline"
              }
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() =>
                setSelectedPriceRange(
                  selectedPriceRange === range.label ? null : range.label
                )
              }
            >
              {range.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full bg-transparent"
        onClick={clearFilters}
      >
        Limpiar Filtros
      </Button>
    </div>
  );
}
