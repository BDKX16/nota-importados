"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { register } from "@/services/public";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const { loading, callEndpoint } = useFetchAndLoad();
  const { toast } = useToast();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validaciones del cliente
  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
    };
    let isValid = true;

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
      isValid = false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Ingresa un email válido";
      isValid = false;
    }

    // Validar contraseña
    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      isValid = false;
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = "La contraseña debe tener al menos una minúscula";
      isValid = false;
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "La contraseña debe tener al menos una mayúscula";
      isValid = false;
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "La contraseña debe tener al menos un número";
      isValid = false;
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirma tu contraseña";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
      isValid = false;
    }

    // Validar teléfono
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio";
      isValid = false;
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Ingresa un número de teléfono válido";
      isValid = false;
    }

    // Validar dirección
    if (!formData.address.trim()) {
      newErrors.address = "La dirección es obligatoria";
      isValid = false;
    } else if (formData.address.trim().length < 10) {
      newErrors.address =
        "La dirección debe ser más específica (mínimo 10 caracteres)";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpiar errores previos
    setErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
    });

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    try {
      const result = await callEndpoint(
        register(
          formData.name,
          formData.email,
          formData.password,
          formData.phone,
          formData.address
        )
      );

      if (result?.status === "success") {
        toast({
          title: "¡Cuenta creada exitosamente!",
          description:
            "Te hemos enviado un correo de bienvenida. Ya puedes iniciar sesión.",
        });

        // Redirigir al login
        router.push("/auth/login");
      } else {
        toast({
          title: "Error al crear la cuenta",
          description: "Ha ocurrido un error inesperado",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error en registro:", error);

      // Manejar errores específicos según el status code
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        switch (status) {
          case 409:
            // Email ya existe
            toast({
              title: "Email ya registrado",
              description:
                "Ya existe una cuenta con este email. ¿Quieres iniciar sesión en su lugar?",
              variant: "destructive",
            });
            // También marcar el campo email como con error
            setErrors((prev) => ({
              ...prev,
              email: "Este email ya está registrado",
            }));
            break;
          case 400:
            // Error de validación
            toast({
              title: "Datos inválidos",
              description:
                errorData?.error ||
                "Revisa todos los campos y asegúrate de que estén correctos.",
              variant: "destructive",
            });
            break;
          case 429:
            // Muchos intentos
            toast({
              title: "Demasiados intentos",
              description:
                "Has realizado muchos intentos de registro. Espera un momento antes de intentar nuevamente.",
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
              title: "Error al registrarse",
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
        <CardTitle className="text-2xl">Crear cuenta</CardTitle>
        <CardDescription>
          Únete a Nota Importados y disfruta de beneficios exclusivos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "border-red-500" : ""}
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "border-red-500" : ""}
              required
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-500" : ""}
                required
                minLength={8}
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
            <p className="text-xs text-muted-foreground">
              La contraseña debe tener al menos 8 caracteres, una mayúscula, una
              minúscula y un número
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-red-500" : ""}
                required
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Número de teléfono</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+54 11 57712816"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? "border-red-500" : ""}
              required
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección de entrega y facturación</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Av. Constitución 5500, Mar del Plata, Argentina"
              value={formData.address}
              onChange={handleChange}
              className={`min-h-[80px] ${
                errors.address ? "border-red-500" : ""
              }`}
              required
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address}</p>
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
                Creando cuenta...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Crear cuenta
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
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-amber-600 hover:text-amber-700"
          >
            Inicia sesión
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
