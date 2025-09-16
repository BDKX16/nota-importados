"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeaderSecondary } from "@/components/header-secondary";
import { Footer } from "@/components/footer";
import { getBrands } from "@/services/public";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Star,
  Globe,
  Calendar,
  Package,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

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

interface BrandStats {
  totalProducts: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  totalStock: number;
}

export default function BrandsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { loading, callEndpoint } = useFetchAndLoad();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyPremium, setShowOnlyPremium] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    filterBrands();
  }, [brands, searchTerm, showOnlyPremium]);

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

  const filterBrands = () => {
    let filtered = brands;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (brand) =>
          brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          brand.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          brand.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por premium
    if (showOnlyPremium) {
      filtered = filtered.filter((brand) => brand.isPremium);
    }

    setFilteredBrands(filtered);
  };

  const handleBrandClick = (brand: Brand) => {
    // Redirigir a productos con filtro de marca
    router.push(`/productos?brand=${encodeURIComponent(brand.name)}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getBrandImage = (brand: Brand) => {
    if (brand.logo) {
      return brand.logo;
    }
    // Imagen placeholder basada en el nombre de la marca
    return `/placeholder-logo.png`;
  };

  const premiumBrands = brands.filter((brand) => brand.isPremium);
  const regularBrands = brands.filter((brand) => !brand.isPremium);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <HeaderSecondary />

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-6 text-balance tracking-tight">
            Nuestras
            <span className="text-primary block font-normal">Marcas</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Trabajamos con las casas de perfumería más prestigiosas del mundo
            para ofrecerte fragancias auténticas y exclusivas
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-card backdrop-blur-sm rounded-lg p-8 border shadow-lg shadow-foreground/5">
              <div className="text-4xl font-serif font-light text-primary mb-3">
                {brands.length}
              </div>
              <div className="text-muted-foreground font-medium">
                Marcas Disponibles
              </div>
            </div>
            <div className="bg-card backdrop-blur-sm rounded-lg p-8 border shadow-lg shadow-foreground/5">
              <div className="text-4xl font-serif font-light text-primary mb-3">
                {premiumBrands.length}
              </div>
              <div className="text-muted-foreground font-medium">
                Marcas Premium
              </div>
            </div>
            <div className="bg-card backdrop-blur-sm rounded-lg p-8 border shadow-lg shadow-foreground/5">
              <div className="text-4xl font-serif font-light text-primary mb-3">
                {brands.filter((brand) => brand.country).length}
              </div>
              <div className="text-muted-foreground font-medium">
                Países Representados
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-12 bg-card border shadow-lg shadow-foreground/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-sans font-semibold text-xl">
              <Search className="h-6 w-6 text-primary" />
              Explorar Marcas
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              Encuentra la casa de perfumería perfecta para ti
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nombre, descripción o país..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-border focus:border-primary transition-colors"
                />
              </div>
              <Button
                variant={showOnlyPremium ? "default" : "outline"}
                onClick={() => setShowOnlyPremium(!showOnlyPremium)}
                className={
                  showOnlyPremium
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-border hover:bg-muted"
                }
              >
                <Star className="h-4 w-4 mr-2" />
                Solo Premium
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        ) : (
          <>
            {/* Premium Brands Section */}
            {premiumBrands.length > 0 && !searchTerm && !showOnlyPremium && (
              <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <Star className="h-7 w-7 text-primary" />
                  <h2 className="text-3xl font-serif font-light text-foreground">
                    Colección Premium
                  </h2>
                  <Badge className="bg-primary text-primary-foreground font-medium px-3 py-1">
                    Exclusivas
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {premiumBrands.slice(0, 8).map((brand) => (
                    <BrandCard
                      key={brand._id}
                      brand={brand}
                      onBrandClick={handleBrandClick}
                      isPremium={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Brands or Filtered Results */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-serif font-light text-foreground">
                  {searchTerm || showOnlyPremium
                    ? "Resultados de Búsqueda"
                    : "Todas las Casas"}
                </h2>
                <span className="text-muted-foreground font-medium">
                  {filteredBrands.length} marca
                  {filteredBrands.length !== 1 ? "s" : ""} encontrada
                  {filteredBrands.length !== 1 ? "s" : ""}
                </span>
              </div>

              {filteredBrands.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredBrands.map((brand) => (
                    <BrandCard
                      key={brand._id}
                      brand={brand}
                      onBrandClick={handleBrandClick}
                      isPremium={brand.isPremium}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-card border shadow-lg shadow-foreground/5">
                  <CardContent className="text-center py-16">
                    <Search className="h-20 w-20 text-muted-foreground/50 mx-auto mb-6" />
                    <h3 className="text-xl font-sans font-semibold text-foreground mb-3">
                      No se encontraron marcas
                    </h3>
                    <p className="text-muted-foreground mb-8 font-medium">
                      Intenta con otros términos de búsqueda o ajusta los
                      filtros
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setShowOnlyPremium(false);
                      }}
                      className="border-border hover:bg-muted"
                    >
                      Limpiar filtros
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Call to Action */}
        <Card className="mt-16 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-none shadow-2xl shadow-primary/20">
          <CardContent className="text-center py-16">
            <h3 className="text-3xl font-serif font-light mb-6">
              ¿No encuentras tu casa favorita?
            </h3>
            <p className="text-lg mb-8 opacity-90 font-light leading-relaxed max-w-2xl mx-auto">
              Constantemente incorporamos nuevas casas de perfumería a nuestro
              exclusivo catálogo
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/productos">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-background text-foreground border-background hover:bg-muted px-8 py-6 rounded-full"
                >
                  Explorar Colección Completa
                  <ArrowRight className="h-5 w-5 ml-3" />
                </Button>
              </Link>
              <Link href="/contacto">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 rounded-full"
                >
                  Solicitar Marca
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

// Componente para cada card de marca
interface BrandCardProps {
  brand: Brand;
  onBrandClick: (brand: Brand) => void;
  isPremium?: boolean;
}

function BrandCard({ brand, onBrandClick, isPremium = false }: BrandCardProps) {
  return (
    <Card
      className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-foreground/10 hover:scale-105 ${
        isPremium
          ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
          : "bg-card border"
      } shadow-lg shadow-foreground/5`}
      onClick={() => onBrandClick(brand)}
    >
      <CardContent className="p-8">
        {/* Logo */}
        <div className="relative h-24 mb-6 flex items-center justify-center">
          <div className="relative w-20 h-20 rounded-full bg-background/70 flex items-center justify-center shadow-sm border">
            <Image
              src={getBrandImage(brand)}
              alt={`${brand.name} logo`}
              width={48}
              height={48}
              className="object-contain"
              onError={(e) => {
                // Fallback to text logo if image fails
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-xl font-serif font-light text-primary">${brand.name.charAt(
                    0
                  )}</span>`;
                }
              }}
            />
          </div>
          {isPremium && (
            <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-medium shadow-lg">
              <Star className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        {/* Brand Info */}
        <div className="text-center space-y-3">
          <h3 className="font-serif font-light text-xl text-foreground group-hover:text-primary transition-colors">
            {brand.name}
          </h3>

          {brand.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {brand.description}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap gap-3 justify-center text-xs text-muted-foreground">
            {brand.country && (
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {brand.country}
              </div>
            )}
            {brand.foundedYear && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {brand.foundedYear}
              </div>
            )}
          </div>

          {/* Categories */}
          {brand.categories && brand.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {brand.categories.slice(0, 2).map((category) => (
                <Badge
                  key={category._id}
                  variant="secondary"
                  className="text-xs bg-muted text-muted-foreground font-medium"
                >
                  {category.name}
                </Badge>
              ))}
              {brand.categories.length > 2 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-muted text-muted-foreground font-medium"
                >
                  +{brand.categories.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-6 pt-6 border-t border-border">
          <Button
            variant="ghost"
            className="w-full text-primary hover:text-primary hover:bg-primary/10 group-hover:bg-primary/20 transition-colors font-medium"
          >
            <Package className="h-4 w-4 mr-2" />
            Explorar Fragancias
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const getBrandImage = (brand: Brand) => {
  if (brand.logo) {
    return brand.logo;
  }
  // Imagen placeholder
  return "/placeholder-logo.png";
};
