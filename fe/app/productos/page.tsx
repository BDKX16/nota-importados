import { Header } from "@/components/header";
import { ProductGrid } from "@/components/product-grid";
import { ProductFilters } from "@/components/product-filters";

export default function ProductsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
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
              <ProductFilters />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Mostrando 6 productos
              </span>
              <select className="text-sm border rounded-md px-3 py-1 bg-white">
                <option>Ordenar por precio</option>
                <option>Precio: menor a mayor</option>
                <option>Precio: mayor a menor</option>
                <option>Más populares</option>
              </select>
            </div>
            <ProductGrid />
          </div>
        </div>
      </main>
    </div>
  );
}
