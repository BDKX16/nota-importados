"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Phone, MapPin, Lock } from "lucide-react";
import Image from "next/image";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { register } from "@/services/public";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { loading, callEndpoint } = useFetchAndLoad();
  const router = useRouter();

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
    if (error) {
      setError("");
    }
  };

  const validateFieldOnBlur = (fieldName: string, value: string) => {
    let errorMessage = "";

    switch (fieldName) {
      case "name":
        errorMessage = validateName(value) || "";
        break;
      case "email":
        errorMessage = validateEmail(value) || "";
        break;
      case "phone":
        errorMessage = validatePhone(value) || "";
        break;
      case "address":
        errorMessage = validateAddress(value) || "";
        break;
      case "password":
        errorMessage = validatePassword() || "";
        break;
      case "confirmPassword":
        errorMessage = validatePassword() || "";
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return "El email es obligatorio";
    }
    if (!emailRegex.test(email)) {
      return "El formato del email no es válido";
    }
    return null;
  };

  const validateName = (name: string) => {
    if (!name.trim()) {
      return "El nombre es obligatorio";
    }
    if (name.trim().length < 2) {
      return "El nombre debe tener al menos 2 caracteres";
    }
    return null;
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) {
      return "El teléfono es obligatorio";
    }
    // Validar formato básico de teléfono (solo números, espacios, guiones y paréntesis)
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (!phoneRegex.test(phone)) {
      return "El formato del teléfono no es válido";
    }
    if (phone.replace(/\D/g, "").length < 8) {
      return "El teléfono debe tener al menos 8 dígitos";
    }
    return null;
  };

  const validateAddress = (address: string) => {
    if (!address.trim()) {
      return "La dirección es obligatoria";
    }
    if (address.trim().length < 10) {
      return "La dirección debe ser más específica (al menos 10 caracteres)";
    }
    return null;
  };

  const validatePassword = () => {
    if (!password.trim()) {
      return "La contraseña es obligatoria";
    }
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    if (!confirmPassword.trim()) {
      return "Debes confirmar la contraseña";
    }
    if (password !== confirmPassword) {
      return "Las contraseñas no coinciden";
    }
    return null;
  };

  const validateAllFields = () => {
    const nameError = validateName(name);
    if (nameError) return nameError;

    const emailError = validateEmail(email);
    if (emailError) return emailError;

    const phoneError = validatePhone(phone);
    if (phoneError) return phoneError;

    const addressError = validateAddress(address);
    if (addressError) return addressError;

    const passwordError = validatePassword();
    if (passwordError) return passwordError;

    if (!acceptTerms) {
      return "Debes aceptar los términos y condiciones";
    }

    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar todos los campos
    const validationError = validateAllFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Convertir email a lowercase antes de enviar
      const normalizedEmail = email.toLowerCase().trim();
      const success = await callEndpoint(
        register(
          name.trim(),
          normalizedEmail,
          password,
          phone.trim(),
          address.trim()
        )
      );

      if (success) {
        // Redirigir al usuario a login con un parámetro para mostrar mensaje de éxito
        router.push("/auth/login?registered=true");
      } else {
        setError("No se pudo completar el registro. Intenta de nuevo.");
      }
    } catch (err: any) {
      console.error("Error en registro:", err);

      // Manejo específico de errores del servidor
      if (err.response?.status === 400) {
        if (
          err.response.data?.message?.includes("email") ||
          err.response.data?.message?.includes("Email")
        ) {
          setError("Este email ya está registrado. ¿Ya tienes una cuenta?");
        } else if (
          err.response.data?.message?.includes("validation") ||
          err.response.data?.message?.includes("required")
        ) {
          setError(
            "Hay campos obligatorios sin completar. Verifica la información."
          );
        } else {
          setError(
            err.response.data?.message ||
              "Datos inválidos. Verifica toda la información."
          );
        }
      } else if (err.response?.status === 409) {
        setError(
          "Ya existe una cuenta con este email. Prueba con otro email o inicia sesión."
        );
      } else if (err.response?.status === 422) {
        setError(
          "Los datos ingresados no son válidos. Revisa el formato de todos los campos."
        );
      } else if (err.message?.includes("Network Error")) {
        setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
      } else if (err.response?.status >= 500) {
        setError("Error del servidor. Intenta de nuevo en unos minutos.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Error inesperado al registrarse. Por favor, intenta de nuevo."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el Enter en los inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      !isLoading &&
      name &&
      email &&
      phone &&
      address &&
      password &&
      confirmPassword &&
      acceptTerms
    ) {
      e.preventDefault();
      handleRegister(e as any);
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
              Únete a nosotros
            </CardTitle>
            <CardDescription className="text-luxury-brown/70">
              Crea tu cuenta y descubre fragancias únicas
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-luxury-brown-dark"
                >
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-luxury-brown/50" />
                  <Input
                    id="name"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError("name");
                    }}
                    onBlur={() => validateFieldOnBlur("name", name)}
                    onKeyPress={handleKeyPress}
                    required
                    className={`pl-10 border-luxury-brown/20 focus:border-luxury-brown focus:ring-luxury-brown/20 bg-white/80 ${
                      fieldErrors.name ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-xs text-red-500">{fieldErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-luxury-brown-dark"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-luxury-brown/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError("email");
                    }}
                    onBlur={() => validateFieldOnBlur("email", email)}
                    onKeyPress={handleKeyPress}
                    required
                    className={`pl-10 border-luxury-brown/20 focus:border-luxury-brown focus:ring-luxury-brown/20 bg-white/80 ${
                      fieldErrors.email ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-red-500">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-luxury-brown-dark"
                >
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-luxury-brown/50" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ej: 11 1234-5678"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearFieldError("phone");
                    }}
                    onBlur={() => validateFieldOnBlur("phone", phone)}
                    onKeyPress={handleKeyPress}
                    required
                    className={`pl-10 border-luxury-brown/20 focus:border-luxury-brown focus:ring-luxury-brown/20 bg-white/80 ${
                      fieldErrors.phone ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {fieldErrors.phone ? (
                  <p className="text-xs text-red-500">{fieldErrors.phone}</p>
                ) : (
                  <p className="text-xs text-luxury-brown/60">
                    Necesario para coordinar las entregas
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-luxury-brown-dark"
                >
                  Dirección de entrega
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-luxury-brown/50" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Calle, número, localidad"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      clearFieldError("address");
                    }}
                    onBlur={() => validateFieldOnBlur("address", address)}
                    onKeyPress={handleKeyPress}
                    required
                    className={`pl-10 border-luxury-brown/20 focus:border-luxury-brown focus:ring-luxury-brown/20 bg-white/80 ${
                      fieldErrors.address ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {fieldErrors.address ? (
                  <p className="text-xs text-red-500">{fieldErrors.address}</p>
                ) : (
                  <p className="text-xs text-luxury-brown/60">
                    Dirección completa donde realizaremos las entregas
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-luxury-brown-dark"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-luxury-brown/50" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError("password");
                    }}
                    onBlur={() => validateFieldOnBlur("password", password)}
                    onKeyPress={handleKeyPress}
                    required
                    className={`pl-10 border-luxury-brown/20 focus:border-luxury-brown focus:ring-luxury-brown/20 bg-white/80 ${
                      fieldErrors.password ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {fieldErrors.password ? (
                  <p className="text-xs text-red-500">{fieldErrors.password}</p>
                ) : (
                  <p className="text-xs text-luxury-brown/60">
                    La contraseña debe tener al menos 8 caracteres
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-luxury-brown-dark"
                >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-luxury-brown/50" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearFieldError("confirmPassword");
                    }}
                    onBlur={() =>
                      validateFieldOnBlur("confirmPassword", confirmPassword)
                    }
                    onKeyPress={handleKeyPress}
                    required
                    className={`pl-10 border-luxury-brown/20 focus:border-luxury-brown focus:ring-luxury-brown/20 bg-white/80 ${
                      fieldErrors.confirmPassword ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setAcceptTerms(checked as boolean)
                  }
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-luxury-brown/70 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Acepto los{" "}
                  <Link
                    href="/terminos"
                    className="text-luxury-brown hover:text-luxury-brown-dark font-medium"
                  >
                    términos y condiciones
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-luxury-brown to-luxury-brown-dark hover:from-luxury-brown-dark hover:to-luxury-brown text-white font-medium py-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creando cuenta...</span>
                  </div>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-sm text-center text-luxury-brown/70">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/auth/login"
                className="text-luxury-brown hover:text-luxury-brown-dark font-medium transition-colors"
              >
                Iniciar sesión
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
