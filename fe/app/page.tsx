"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import ShaderBackground from "@/components/shader-background";
import { useState, useEffect } from "react";
import { getAllProducts } from "@/services/productsService";
import { getBrands } from "@/services/public";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { Star, ShoppingBag, Sparkles, Crown, Heart, Gift } from "lucide-react";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [premiumBrands, setPremiumBrands] = useState([]);
  const { loading, callEndpoint } = useFetchAndLoad();

  useEffect(() => {
    loadFeaturedProducts();
    loadPremiumBrands();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await callEndpoint(getAllProducts());
      if (response && response.data && response.data.products) {
        // Tomar los primeros 6 productos como destacados
        setFeaturedProducts(response.data.products.slice(0, 6));
      }
    } catch (error) {
      console.error("Error loading featured products:", error);
    }
  };

  const loadPremiumBrands = async () => {
    try {
      const response = await callEndpoint(
        getBrands({ premium: true, limit: 8 })
      );
      if (response && response.data && response.data.brands) {
        setPremiumBrands(response.data.brands);
      }
    } catch (error) {
      console.error("Error loading premium brands:", error);
    }
  };
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ShaderBackground>
          <HeroSection />
        </ShaderBackground>

        {/* Call to Action Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-balance font-sans">
                Encuentra tu fragancia perfecta
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Explora nuestra cuidada selección de perfumes importados y
                descubre la fragancia que define tu personalidad.
              </p>
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/productos">Ver Todos los Productos</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                Selección Exclusiva
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-balance">
                Fragancias Destacadas
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
                Descubre las fragancias más codiciadas, seleccionadas
                especialmente para ti
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
              {featuredProducts.map((product, index) => (
                <Card
                  key={product._id || index}
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card/80 backdrop-blur-sm"
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <div className="aspect-square bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
                        {product.images && product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-muted-foreground">
                            <Gift className="h-12 w-12 md:h-16 md:w-16 mb-2" />
                            <span className="text-xs md:text-sm">
                              Imagen próximamente
                            </span>
                          </div>
                        )}
                      </div>
                      {product.isPremium && (
                        <Badge className="absolute top-3 left-3 md:top-4 md:left-4 bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="p-4 md:p-6">
                      <div className="mb-2">
                        <h3 className="font-semibold text-base md:text-lg mb-1 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                          {product.brand || "Marca Premium"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 md:h-4 md:w-4 fill-amber-400 text-amber-400" />
                          <span className="text-xs md:text-sm font-medium">
                            4.8
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg md:text-xl font-bold text-primary">
                            ${product.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base md:text-lg px-6 md:px-8"
              >
                <Link href="/productos">
                  <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Ver Toda la Colección
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Premium Brands Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
                <Crown className="h-3 w-3 md:h-4 md:w-4" />
                Marcas de Prestigio
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-balance">
                Las Mejores Casas de Perfumería
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
                Trabajamos con las marcas más prestigiosas del mundo para
                ofrecerte solo lo mejor
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {premiumBrands.map((brand, index) => (
                <Link
                  key={brand._id || index}
                  href={`/productos?brand=${encodeURIComponent(brand.name)}`}
                  className="group"
                >
                  <Card className="h-24 md:h-32 flex items-center justify-center bg-gradient-to-br from-card via-card/80 to-secondary/10 border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <CardContent className="p-3 md:p-6 flex flex-col items-center justify-center text-center">
                      {brand.logo ? (
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          width={60}
                          height={30}
                          className="object-contain opacity-70 group-hover:opacity-100 transition-opacity md:w-20 md:h-10"
                        />
                      ) : (
                        <div className="text-center">
                          <Star className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 md:mb-2 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
                          <span className="font-semibold text-xs md:text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {brand.name}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/marcas">Ver Todas las Marcas</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Premium Call to Action Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/api/placeholder/1920/800')] bg-cover bg-center opacity-5"></div>
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
                <Heart className="h-3 w-3 md:h-4 md:w-4" />
                Experiencia Premium
              </div>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-balance bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent px-4">
                Eleva tu Presencia con Fragancias Únicas
              </h2>
              <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto text-pretty px-4">
                Cada fragancia cuenta una historia. Déjanos ayudarte a encontrar
                la tuya con nuestra colección exclusiva de perfumes importados
                de las mejores casas del mundo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Link href="/productos">
                    <Sparkles className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Descubre tu Fragancia
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 border-primary/20 hover:bg-primary/10"
                >
                  <Link href="/marcas">
                    <Crown className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Explorar Marcas
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16">
                <div className="text-center px-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Gift className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base md:text-lg mb-2">
                    Productos Auténticos
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Garantizamos la autenticidad de cada fragancia en nuestra
                    colección
                  </p>
                </div>
                <div className="text-center px-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Star className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base md:text-lg mb-2">
                    Calidad Premium
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Solo trabajamos con las marcas más prestigiosas del mundo
                  </p>
                </div>
                <div className="text-center px-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Heart className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base md:text-lg mb-2">
                    Atención Personalizada
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Te ayudamos a encontrar la fragancia perfecta para cada
                    ocasión
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
