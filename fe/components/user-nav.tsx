"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function UserNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();

    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  return (
    <div className="flex items-center">
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative hover:bg-primary/10 hover:text-primary transition-all duration-300 text-sm font-medium px-4 py-6 rounded-full"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden md:inline">Mi cuenta</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-white/30 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-2"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal py-3 px-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "Usuario"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem
              asChild
              className="py-3 px-3 rounded-xl mx-1 my-1 h-12 flex items-center"
            >
              <Link href="/perfil">Mi perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="py-3 px-3 rounded-xl mx-1 my-1 h-12 flex items-center"
            >
              <Link href="/perfil/pedidos">Mis pedidos</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem
              className="text-red-500 cursor-pointer py-3 px-3 rounded-xl mx-1 my-1 h-12 flex items-center"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4 text-red-500" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="ghost"
          asChild
          className="hover:bg-primary/10 hover:text-primary transition-all duration-300 text-sm font-medium px-4 py-6 rounded-full"
        >
          <Link href="/auth/login">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">Iniciar sesión</span>
            </div>
          </Link>
        </Button>
      )}
    </div>
  );
}
