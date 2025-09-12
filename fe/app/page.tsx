import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />

        {/* Call to Action Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-balance">Encuentra tu fragancia perfecta</h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Explora nuestra cuidada selección de perfumes importados y descubre la fragancia que define tu
                personalidad.
              </p>
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/productos">Ver Todos los Productos</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
