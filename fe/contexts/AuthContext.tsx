"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login as loginService } from "@/services/public";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/redux/slices/userSlice";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useSnackbar } from "notistack";

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  logout: () => void;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <AuthProviderInner>{children}</AuthProviderInner>;
};

const AuthProviderInner = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();
  const { callEndpoint } = useFetchAndLoad();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Solo ejecuta en el cliente
    if (typeof window !== "undefined") {
      const checkAuth = () => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("userData");

        if (!storedToken || !storedUser) {
          setIsLoading(false);
          return;
        }

        try {
          // Ensure storedUser is not undefined or "undefined" string before parsing
          if (storedUser && storedUser !== "undefined") {
            const userData = JSON.parse(storedUser);
            setUserState(userData);
            dispatch(setUser({ ...userData, token: storedToken }));
          } else {
            // Clear invalid data
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
          }
        } catch (error) {
          console.error("Error parsing stored user data", error);
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await callEndpoint(loginService(email, password));

      // Si callEndpoint fue cancelado
      if (response === null) {
        setIsLoading(false);
        enqueueSnackbar("Operación cancelada", { variant: "warning" });
        return { success: false };
      }

      // Si hay un error en la respuesta
      if (response && response.error) {
        setIsLoading(false);

        // Manejar errores según el tipo
        if (response.type === "network") {
          enqueueSnackbar("Error de conexión. Verifica tu internet", {
            variant: "error",
          });
          return { success: false };
        }

        if (response.status) {
          // Manejar errores HTTP específicos
          switch (response.status) {
            case 401:
              enqueueSnackbar("Email o contraseña incorrectos", {
                variant: "error",
              });
              break;
            case 404:
              enqueueSnackbar("No existe una cuenta con este email", {
                variant: "error",
              });
              break;
            case 429:
              enqueueSnackbar("Demasiados intentos. Espera un momento", {
                variant: "warning",
              });
              break;
            case 500:
              enqueueSnackbar("Error del servidor. Intenta más tarde", {
                variant: "error",
              });
              break;
            case 400:
              enqueueSnackbar("Datos inválidos. Verifica tu información", {
                variant: "error",
              });
              break;
            default:
              enqueueSnackbar(
                response.data?.error ||
                  response.message ||
                  "Error al iniciar sesión",
                { variant: "error" }
              );
          }
        } else {
          enqueueSnackbar(response.message || "Error desconocido", {
            variant: "error",
          });
        }

        return { success: false };
      }

      // Verificar si es una respuesta exitosa
      if (response && response.data && response.data.status === "success") {
        const { token, userData } = response.data;
        const user = userData;
        // Guardar en localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("userData", JSON.stringify(userData));

        // Actualizar estado y Redux
        setUserState(user);
        dispatch(setUser({ ...user, token }));

        setIsLoading(false);
        enqueueSnackbar("¡Bienvenido de vuelta!", { variant: "success" });
        return { success: true };
      }

      // Si hay response pero es un error del servidor
      if (response && response.data && response.data.status === "error") {
        setIsLoading(false);
        enqueueSnackbar(response.data.error || "Error del servidor", {
          variant: "error",
        });
        return { success: false };
      }

      // Si el response no tiene la estructura esperada
      setIsLoading(false);
      enqueueSnackbar("Respuesta inesperada del servidor", {
        variant: "error",
      });
      return { success: false };
    } catch (error: any) {
      console.error("Login error:", error);
      setIsLoading(false);
      enqueueSnackbar("Error inesperado", { variant: "error" });
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUserState(null);
    dispatch(clearUser());
    router.push("/auth/login");
  };

  const updateUser = (userData: any) => {
    const currentToken = localStorage.getItem("token");

    // Actualizar localStorage
    localStorage.setItem("userData", JSON.stringify(userData));

    // Actualizar estado local
    setUserState(userData);

    // Actualizar Redux
    dispatch(setUser({ ...userData, token: currentToken }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {isLoading ? (
        <LoadingScreen message="Verificando autenticación..." />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// Export default was missing which could cause import issues
export default AuthContext;
