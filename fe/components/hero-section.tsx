import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-24 pb-20 md:pt-0">
      <div className="absolute inset-0 from-background/80 via-transparent to-muted/20"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-serif font-light text-balance leading-tight tracking-tight">
                Perfumes
                <span className="text-primary block font-normal">
                  Exclusivos
                </span>
              </h1>
              <p className="text-xl text-white font-light max-w-md text-pretty leading-relaxed">
                Descubre fragancias únicas de las mejores casas de perfumería
                del mundo.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg rounded-full"
              >
                <Link href="/productos">
                  Explorar Colección
                  <ArrowRight className="ml-2 h-5 w-5 mt-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 bg-transparent border-2 border-white text-white hover:bg-secondary rounded-full"
              >
                Ver Ofertas
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="aspect-[3/4] overflow-hidden bg-card shadow-2xl shadow-primary/10">
                  <img
                    src="/elegant-perfume-bottle-chanel.jpg"
                    alt="Perfume elegante"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square overflow-hidden bg-card shadow-2xl shadow-accent/10">
                  <img
                    src="/luxury-perfume-bottle-dior.jpg"
                    alt="Perfume de lujo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-6 pt-12">
                <div className="aspect-square overflow-hidden bg-card shadow-2xl shadow-secondary/10">
                  <img
                    src="/premium-perfume-bottle-tom-ford.jpg"
                    alt="Perfume premium"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] overflow-hidden bg-card shadow-2xl shadow-primary/10">
                  <img
                    src="/creed-aventus-premium-perfume-bottle.jpg"
                    alt="Perfume exclusivo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
