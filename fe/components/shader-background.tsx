"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

interface ShaderBackgroundProps {
  children: React.ReactNode;
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Función para detectar soporte de WebGL
  const checkWebGLSupport = () => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return !!gl;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    // Verificar soporte de WebGL al montar el componente
    setWebGLSupported(checkWebGLSupport());

    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-background relative overflow-hidden ${
        !webGLSupported ? "landing-mesh-bg" : ""
      }`}
    >
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter
            id="glass-effect"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="0.8 0.4 0.2 0 0.1
                      0.6 0.5 0.3 0 0.08
                      0.4 0.3 0.4 0 0.05
                      0 0 0 0.85 0"
              result="tint"
            />
          </filter>
          <filter
            id="gooey-filter"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Renderizado condicional: Shaders si WebGL está disponible, fallback CSS si no */}
      {webGLSupported ? (
        <>
          {/* Background Shaders */}
          <MeshGradient
            className="absolute inset-0 w-full h-full"
            colors={[
              "hsl(45, 15%, 97%)", // --background: Crema cálido
              "hsl(25, 40%, 35%)", // --primary: Marrón caoba elegante
              "hsl(50, 30%, 75%)", // --secondary: Dorado champagne
              "hsl(35, 40%, 55%)", // --accent: Bronce elegante
              "hsl(30, 30%, 20%)", // --foreground: Marrón chocolate profundo
            ]}
            speed={0.3}
          />
          <MeshGradient
            className="absolute inset-0 w-full h-full opacity-60"
            colors={[
              "hsl(40, 15%, 96%)", // --card: Beige cremoso
              "hsl(40, 10%, 92%)", // --muted: Beige suave
              "hsl(35, 40%, 55%)", // --accent: Bronce elegante
              "hsl(50, 30%, 75%)", // --secondary: Dorado champagne
            ]}
            speed={0.2}
          />
        </>
      ) : (
        // Fallback: gradiente CSS con mensaje opcional
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground text-sm opacity-50">
            {/* Mensaje opcional para debug */}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
