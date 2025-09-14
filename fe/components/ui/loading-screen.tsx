import React from "react";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Cargando...",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Fondo con gradiente de lujo */}
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-brown via-luxury-brown-light to-luxury-brown-dark"></div>

      {/* Patrón de malla sutil */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent bg-repeat"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <img
              src="/nota-logo-white.jpg"
              alt="Nota Perfumes"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Spinner de carga elegante */}
        <div className="mb-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Mensaje */}
        <p className="text-primary/90 text-lg font-light tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
};
