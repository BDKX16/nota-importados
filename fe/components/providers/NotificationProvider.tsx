"use client";

import { SnackbarProvider, SnackbarKey } from "notistack";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface NotificationProviderProps {
  children: React.ReactNode;
}

export default function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const notistackRef = useRef<any>(null);

  // Componente personalizado para el botón de cerrar
  const action = (snackbarId: SnackbarKey) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => notistackRef.current?.closeSnackbar(snackbarId)}
      className="text-white hover:bg-white/20 p-1 h-auto min-w-0"
    >
      <X className="h-4 w-4" />
    </Button>
  );

  return (
    <SnackbarProvider
      ref={notistackRef}
      maxSnack={3}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      dense
      preventDuplicate
      autoHideDuration={5000}
      action={action}
      classes={{
        variantError: "bg-red-600 text-white",
        variantSuccess: "bg-green-600 text-white",
        variantWarning: "bg-yellow-600 text-white",
        variantInfo: "bg-blue-600 text-white",
      }}
    >
      {children}
    </SnackbarProvider>
  );
}
