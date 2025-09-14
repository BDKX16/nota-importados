"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBag, Menu } from "lucide-react";
import { useStore } from "@/lib/store";
import Link from "next/link";
import Image from "next/image";
import UserNav from "@/components/user-nav";

export function Header() {
  const { state, dispatch } = useStore();
  const cartItemsCount = state.cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full pointer-events-none">
      {/* Contenedor de los dos rectángulos */}
      <div className="flex justify-between items-start p-4 gap-4 pointer-events-none">
        {/* Rectángulo izquierdo - Logo y navegación */}
        <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-full shadow-lg px-2 py-2 flex items-center space-x-6 pointer-events-auto">
          <Link href="/" className="flex items-center">
            <Image
              src="/nota-logo-black.jpg"
              alt="Nota Importados"
              width={120}
              height={30}
              className="h-12 w-auto object-contain rounded-full"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8 gap-6 pl-4 pr-6">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary transition-all duration-300 tracking-wide"
            >
              Inicio
            </Link>
            <Link
              href="/productos"
              className="text-sm font-medium hover:text-primary transition-all duration-300 tracking-wide"
            >
              Productos
            </Link>
            <Link
              href="/marcas"
              className="text-sm font-medium hover:text-primary transition-all duration-300 tracking-wide"
            >
              Marcas
            </Link>
          </nav>
        </div>

        {/* Rectángulo derecho - Carrito y Usuario */}
        <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-full shadow-lg px-2 py-2 flex items-center space-x-4 pointer-events-auto">
          <Button
            variant="ghost"
            onClick={() => dispatch({ type: "TOGGLE_CART" })}
            className="relative hover:bg-primary/10 hover:text-primary transition-all duration-300 text-sm font-medium px-4 py-6 rounded-full"
          >
            Carrito
            {cartItemsCount > 0 && (
              <span className="ml-2 h-5 w-5 rounded-full bg-gradient-to-br from-primary to-accent text-xs text-primary-foreground flex items-center justify-center font-medium shadow-lg">
                {cartItemsCount}
              </span>
            )}
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
