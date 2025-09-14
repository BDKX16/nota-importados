"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Users,
  LogOut,
  Menu,
  TicketPercent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { logout } = useAuth();
  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/productos", label: "Productos", icon: Package },
    { href: "/admin/ventas", label: "Ventas y Pedidos", icon: ShoppingCart },
    { href: "/admin/promociones", label: "Promociones", icon: TicketPercent },
    { href: "/admin/configuracion", label: "Configuración", icon: Settings },
    { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b bg-card/90 backdrop-blur-md shadow-sm">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-primary/20">
                  <Image
                    src="/nota-logo-black.jpg"
                    alt="Nota Importados logo"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <span className="font-bold text-foreground font-serif">
                  Nota Admin
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Ver tienda
              </Link>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full">
                      <Image
                        src="/nota-logo-black.jpg"
                        alt="Nota Importados logo"
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                    <span className="font-bold">Nota Admin</span>
                  </div>
                  <nav className="flex flex-col gap-1">
                    {navItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={index}
                          href={item.href}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium"
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <Button
                      onClick={handleLogout}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 mt-4 justify-start font-normal"
                      variant="ghost"
                    >
                      <LogOut className="h-5 w-5" />
                      Cerrar sesión
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <div className="flex-1 flex">
          {/* Sidebar (desktop) */}
          <aside className="w-64 border-r bg-card/80 backdrop-blur-md border-border shadow-lg hidden md:block">
            <div className="h-full py-6 px-3">
              <nav className="flex flex-col gap-1">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium"
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
                <Button
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 mt-4 justify-start font-normal"
                  variant="ghost"
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar sesión
                </Button>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-card/30 to-secondary/10">
            <div className="container py-6">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
