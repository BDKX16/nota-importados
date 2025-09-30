"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Star,
  Heart,
  Crown,
  Send,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-card via-card/95 to-secondary/20 border-t border-border/40">
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-primary/20">
                  <Image
                    src="/nota-logo-black.jpg"
                    alt="Nota Importados logo"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <span className="font-bold text-xl font-serif text-foreground">
                  Nota Importados
                </span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Tu destino premium para fragancias auténticas de las mejores
                casas de perfumería del mundo. Calidad garantizada y experiencia
                excepcional.
              </p>

              {/* Social Media */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-foreground">
                  Síguenos
                </h4>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0 bg-background/50 hover:bg-primary hover:text-primary-foreground border-primary/20"
                    asChild
                  >
                    <Link
                      href="https://www.instagram.com/notaimportados?igsh=c3E0OTRuMzJ1cDJj"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                    </Link>
                  </Button>
                  {/*<Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0 bg-background/50 hover:bg-primary hover:text-primary-foreground border-primary/20"
                    asChild
                    disabled
                  >
                    <Link href="#" aria-label="Facebook">
                      <Facebook className="h-4 w-4" />
                    </Link>
                  </Button>*/}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0 bg-background/50 hover:bg-primary hover:text-primary-foreground border-primary/20"
                    asChild
                  >
                    <Link
                      href="mailto:notaimportados@gmail.com"
                      aria-label="Email"
                    >
                      <Mail className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="font-semibold text-foreground">Enlaces Rápidos</h4>
              <nav className="space-y-3">
                <Link
                  href="/productos"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <ShoppingBag className="h-4 w-4 group-hover:text-primary" />
                  Productos
                </Link>
                <Link
                  href="/marcas"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Crown className="h-4 w-4 group-hover:text-primary" />
                  Marcas
                </Link>
                <Link
                  href="/perfil"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Star className="h-4 w-4 group-hover:text-primary" />
                  Mi perfil
                </Link>
                <Link
                  href="/perfil/pedidos"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Heart className="h-4 w-4 group-hover:text-primary" />
                  Pedidos
                </Link>
              </nav>
            </div>

            {/* Customer Service */}
            <div className="space-y-6">
              <h4 className="font-semibold text-foreground">
                Atención al Cliente
              </h4>
              <nav className="space-y-3">
                <Link
                  href="/ayuda"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Centro de Ayuda
                </Link>
                <Link
                  href="/perfil/pedidos"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Envíos y Devoluciones
                </Link>
                <Link
                  href="/garantia"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Garantía de Autenticidad
                </Link>
                <Link
                  href="/contacto"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contacto
                </Link>
                <Link
                  href="/faq"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Preguntas Frecuentes
                </Link>
              </nav>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h4 className="font-semibold text-foreground">Contacto</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      +54 9 11 2706 0002
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Lun - Vie: 9:00 - 18:00
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      notaimportados@gmail.com
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Respuesta en 24hs
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Buenos Aires, Argentina
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Envíos a todo el país
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3">
                <h5 className="font-medium text-sm text-foreground">
                  Compra Segura
                </h5>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                    SSL Seguro
                  </div>
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                    100% Auténtico
                  </div>
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                    Envío a todo el país
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/40 bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                © 2025 Nota Importados. Todos los derechos reservados.
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end gap-4 text-xs text-muted-foreground">
              <Link
                href="/privacidad"
                className="hover:text-primary transition-colors"
              >
                Política de Privacidad
              </Link>
              <Link
                href="/terminos"
                className="hover:text-primary transition-colors"
              >
                Términos y Condiciones
              </Link>
              <Link
                href="/cookies"
                className="hover:text-primary transition-colors"
              >
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
