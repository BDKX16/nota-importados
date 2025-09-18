"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/services/public";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const { loading, callEndpoint } = useFetchAndLoad();
  const { toast } = useToast();
  const router = useRouter();

  // Validaciones del cliente
  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Ingresa un email válido";
      isValid = false;
    }

    // Validar contraseña
    if (!password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpiar errores previos
    setErrors({ email: "", password: "" });

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    try {
      const result = await callEndpoint(login(email, password));

      if (result?.status === "success") {
        toast({
          title: "¡Bienvenido de nuevo!",
          description: "Has iniciado sesión correctamente",
        });

        // Aquí deberías actualizar el estado global del usuario
        // Por ejemplo: dispatch(setUser(result.userData, result.token));

        router.push("/");
      } else {
        // Este caso no debería ocurrir si el endpoint devuelve error correctamente
        toast({
          title: "Error al iniciar sesión",
          description: "Ha ocurrido un error inesperado",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error en login:", error);

      // Manejar errores específicos según el status code
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        switch (status) {
          case 401:
            // Credenciales inválidas
            toast({
              title: "Credenciales incorrectas",
              description:
                "El email o la contraseña son incorrectos. Verifica tus datos e intenta nuevamente.",
              variant: "destructive",
            });
            break;
          case 404:
            // Email no encontrado
            toast({
              title: "Email no registrado",
              description:
                "No encontramos una cuenta con este email. ¿Quieres crear una cuenta nueva?",
              variant: "destructive",
            });
            break;
          case 429:
            // Muchos intentos
            toast({
              title: "Demasiados intentos",
              description:
                "Has realizado muchos intentos de inicio de sesión. Espera un momento antes de intentar nuevamente.",
              variant: "destructive",
            });
            break;
          case 500:
            // Error del servidor
            toast({
              title: "Error del servidor",
              description:
                "Tenemos problemas técnicos. Por favor intenta más tarde.",
              variant: "destructive",
            });
            break;
          default:
            // Error genérico
            toast({
              title: "Error al iniciar sesión",
              description:
                errorData?.error ||
                "Ha ocurrido un error inesperado. Por favor intenta nuevamente.",
              variant: "destructive",
            });
        }
      } else if (error.request) {
        // Error de conexión
        toast({
          title: "Error de conexión",
          description:
            "No pudimos conectar con el servidor. Verifica tu conexión a internet.",
          variant: "destructive",
        });
      } else {
        // Error desconocido
        toast({
          title: "Error inesperado",
          description:
            "Ha ocurrido un error inesperado. Por favor intenta nuevamente.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
        <CardDescription>
          Ingresa a tu cuenta de Nota Importados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={errors.email ? "border-red-500" : ""}
              required
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link
                href="/auth/recuperar"
                className="text-xs text-amber-600 hover:text-amber-700"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: "" }));
                }}
                className={errors.password ? "border-red-500" : ""}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                </span>
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </span>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">O</span>
          </div>
        </div>
        <div className="text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/auth/registro"
            className="font-medium text-amber-600 hover:text-amber-700"
          >
            Regístrate
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
