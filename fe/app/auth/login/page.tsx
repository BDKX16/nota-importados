"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Lock, User } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const { login, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      setShowRegistrationSuccess(true);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Convertir email a lowercase antes de enviar
      const normalizedEmail = email.toLowerCase().trim();
      const result = await login(normalizedEmail, password);
      console.log(result);
      if (result.success) {
        const redirectPath = searchParams?.get("redirect") || "/";
        router.push(redirectPath);
      } else {
        setError(result.error || "Error al iniciar sesión.");
      }
    } catch (err: any) {
      console.error("Error en login:", err);
      setError("Error inesperado. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el Enter en los inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && email && password) {
      e.preventDefault();
      handleLogin(e as any);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Fondo con gradiente de lujo */}
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-brown via-luxury-brown-light to-luxury-brown-dark"></div>

      {/* Patrón de malla sutil */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent bg-repeat"></div>
      </div>

      <div className="relative z-10 max-w-md w-full p-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-20 h-20">
            <Image
              src="/nota-logo-white.jpg"
              alt="Nota Perfumes"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <Card className="backdrop-blur-md bg-white/95 border-0 shadow-2xl">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-3xl font-serif text-luxury-brown-dark">
              Bienvenido
            </CardTitle>
            <CardDescription className="text-luxury-brown/70">
              Accede a tu cuenta para descubrir fragancias exclusivas
            </CardDescription>
          </CardHeader>

          <CardContent>
            {showRegistrationSuccess && (
              <Alert className="mb-6 bg-emerald-50 border-emerald-200 text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription>
                  ¡Registro exitoso! Ya puedes iniciar sesión con tus
                  credenciales.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">
                    {error}
                    {error.includes("No existe una cuenta") && (
                      <div className="mt-2">
                        <Link
                          href="/auth/registro"
                          className="text-luxury-brown hover:text-luxury-brown-dark underline font-medium"
                        >
                          Crear cuenta nueva
                        </Link>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-luxury-brown-dark"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-luxury-brown/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    required
                    autoComplete="email"
                    className="pl-10 border-luxury-brown/20 focus:border-luxury-brown focus:ring-luxury-brown/20 bg-white/80"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-luxury-brown-dark"
                  >
                    Contraseña
                  </label>
                  <Link
                    href="/auth/recuperar-password"
                    className="text-xs text-luxury-brown hover:text-luxury-brown-dark transition-colors"
                    tabIndex={-1}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-luxury-brown/50" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    required
                    autoComplete="current-password"
                    className="pl-10 border-luxury-brown/20 focus:border-luxury-brown focus:ring-luxury-brown/20 bg-white/80"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-luxury-brown to-luxury-brown-dark hover:from-luxury-brown-dark hover:to-luxury-brown text-white font-medium py-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-sm text-center text-luxury-brown/70">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/auth/registro"
                className="text-luxury-brown hover:text-luxury-brown-dark font-medium transition-colors"
              >
                Regístrate aquí
              </Link>
            </div>

            <Link
              href="/"
              className="text-luxury-brown/60 hover:text-luxury-brown text-sm text-center transition-colors"
            >
              ← Volver a la página principal
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
