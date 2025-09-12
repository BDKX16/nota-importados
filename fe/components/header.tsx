"use client"

import { Button } from "@/components/ui/button"
import { ShoppingBag, Menu } from "lucide-react"
import { useStore } from "@/lib/store"
import Link from "next/link"
import Image from "next/image"

export function Header() {
  const { state, dispatch } = useStore()
  const cartItemsCount = state.cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/nota-logo-black.jpg"
            alt="Nota Importados"
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-10">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-all duration-300 tracking-wide">
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

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "TOGGLE_CART" })}
            className="relative hover:bg-primary/10 transition-all duration-300"
          >
            <ShoppingBag className="h-6 w-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-br from-primary to-accent text-xs text-primary-foreground flex items-center justify-center font-medium shadow-lg">
                {cartItemsCount}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary/10 transition-all duration-300">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}
