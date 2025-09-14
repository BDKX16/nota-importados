"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, CheckCircle, Crown } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
  title?: string;
  subtitle?: string;
  backUrl?: string;
  backLabel?: string;
  showUserInfo?: boolean;
  stats?: Array<{
    icon: React.ComponentType<any>;
    value: string | number;
    label: string;
    color: string;
  }>;
}

export default function ProfileHeader({
  title,
  subtitle,
  backUrl = "/perfil",
  backLabel = "Volver al Perfil",
  showUserInfo = false,
  stats = [],
}: ProfileHeaderProps) {
  const { user } = useAuth();

  // Determinar si es admin (esto debería venir del contexto de auth)
  const isAdmin = user?.role === "admin" || user?.isAdmin;

  const userInfo = {
    name: user?.name || user?.fullName || "Usuario",
    email: user?.email || "",
    memberSince: user?.createdAt
      ? new Date(user.createdAt).getFullYear()
      : new Date().getFullYear(),
  };

  return (
    <div className="bg-card/90 backdrop-blur-md border-b border-border shadow-lg">
      <div className="container py-6 md:py-8">
        {/* Para página principal de perfil con información completa */}
        {showUserInfo && (
          <>
            {/* Header compacto para mobile, expandido para desktop */}
            <div className="flex items-start gap-3 md:gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-12 w-12 md:h-24 md:w-24 ring-2 ring-primary/30 ring-offset-2 md:ring-4 md:ring-offset-4 ring-offset-background">
                  <AvatarImage
                    src="/professional-avatar.png"
                    alt={userInfo.name}
                  />
                  <AvatarFallback className="text-sm md:text-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-serif">
                    {userInfo.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 md:p-1 shadow-lg">
                  <CheckCircle className="h-2 w-2 md:h-4 md:w-4 text-white" />
                </div>
              </div>

              {/* Contenido del header */}
              <div className="flex-1 min-w-0">
                {/* Título, badge y botón */}
                <div className="flex items-center justify-between gap-2 md:gap-3 mb-1 md:mb-2">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <h1 className="text-lg md:text-3xl font-bold text-foreground truncate font-serif">
                      {userInfo.name}
                    </h1>
                    <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 text-xs px-3 py-1 rounded-full shadow-md">
                      <Crown className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                      {isAdmin ? "Admin" : "VIP"}
                    </Badge>
                  </div>

                  {/* Botón de navegación pequeño a la derecha */}
                  <Link href={backUrl}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/30 hover:bg-primary/10 text-primary text-xs px-3 py-1 h-auto rounded-xl font-medium transition-all duration-300"
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      Volver
                    </Button>
                  </Link>
                </div>

                {/* Info de miembro */}
                <p className="text-xs md:text-muted-foreground mb-2 md:mb-3 text-muted-foreground">
                  Miembro desde {userInfo.memberSince} • Cliente Premium
                </p>

                {/* Stats */}
                {stats.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6">
                    {stats.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 md:flex-col md:text-center bg-card/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-border/50 hover:border-primary/30 transition-all duration-300 md:bg-transparent md:border-0"
                        >
                          <div
                            className={`flex-shrink-0 w-6 h-6 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${stat.color} md:mb-2 shadow-sm`}
                          >
                            <Icon className="h-3 w-3 md:h-6 md:w-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm md:text-2xl font-semibold md:font-bold text-foreground leading-none md:mb-1 font-serif">
                              {stat.value}
                            </div>
                            <div className="text-xs md:text-sm text-muted-foreground truncate font-medium">
                              {stat.label}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Para otras páginas con título y subtítulo simples */}
        {!showUserInfo && (
          <>
            {/* Botón de navegación */}
            <div className="flex items-center gap-4 mb-6">
              <Link href={backUrl}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 hover:bg-primary/10 text-primary rounded-xl font-medium transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {backLabel}
                </Button>
              </Link>
            </div>

            {/* Título y subtítulo */}
            {(title || subtitle) && (
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-foreground font-serif">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
