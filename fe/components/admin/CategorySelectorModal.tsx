"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { createCategory } from "@/services/private";

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface CategorySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (categories: Category[]) => void;
  selectedCategories: Category[];
  availableCategories: Category[];
  onCategoriesUpdate: () => void;
}

export default function CategorySelectorModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCategories,
  availableCategories,
  onCategoriesUpdate,
}: CategorySelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [tempSelectedCategories, setTempSelectedCategories] = useState<
    Category[]
  >([]);

  const { loading, callEndpoint } = useFetchAndLoad();
  const { toast } = useToast();

  // Inicializar categorías seleccionadas temporales cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setTempSelectedCategories([...selectedCategories]);
      setSearchTerm("");
      setIsCreatingNew(false);
      setNewCategoryName("");
    }
  }, [isOpen, selectedCategories]);

  // Filtrar categorías por búsqueda
  const filteredCategories = availableCategories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle categoría seleccionada
  const toggleCategory = (category: Category) => {
    setTempSelectedCategories((prev) => {
      const isSelected = prev.some((cat) => cat.id === category.id);
      if (isSelected) {
        return prev.filter((cat) => cat.id !== category.id);
      } else {
        return [...prev, category];
      }
    });
  };

  // Crear nueva categoría
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la categoría",
        variant: "destructive",
      });
      return;
    }

    try {
      const categoryData = {
        name: newCategoryName.trim(),
        description: "",
        color: "#8B4513",
        icon: "",
      };

      const response = await callEndpoint(createCategory(categoryData));

      if (response && response.data) {
        toast({
          title: "Categoría creada",
          description: `La categoría "${newCategoryName}" ha sido creada exitosamente.`,
        });

        // Actualizar la lista de categorías
        onCategoriesUpdate();

        // Limpiar el formulario
        setNewCategoryName("");
        setIsCreatingNew(false);

        // Agregar la nueva categoría a las seleccionadas temporalmente
        const newCategory = response.data.category || response.data;
        if (newCategory && newCategory.id) {
          setTempSelectedCategories((prev) => [...prev, newCategory]);
        }
      }
    } catch (error) {
      console.error("Error al crear categoría:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la categoría. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Confirmar selección
  const handleConfirm = () => {
    onConfirm(tempSelectedCategories);
  };

  // Cancelar y cerrar
  const handleCancel = () => {
    setTempSelectedCategories([...selectedCategories]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-[#8B4513]">
            Seleccionar Categorías
          </DialogTitle>
          <DialogDescription>
            Elige las categorías para este producto. Puedes seleccionar
            múltiples categorías.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Categorías seleccionadas temporalmente */}
          {tempSelectedCategories.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#8B4513]">
                Categorías seleccionadas ({tempSelectedCategories.length})
              </Label>
              <div className="flex flex-wrap gap-1">
                {tempSelectedCategories.map((category) => (
                  <Badge
                    key={category.id}
                    variant="default"
                    className="bg-[#8B4513] hover:bg-[#A0522D] cursor-pointer"
                    onClick={() => toggleCategory(category)}
                  >
                    {category.name}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Lista de categorías disponibles */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-[#8B4513]">
                Categorías disponibles
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                className="text-[#8B4513] border-[#8B4513] hover:bg-[#8B4513] hover:text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nueva
              </Button>
            </div>

            {/* Formulario para crear nueva categoría */}
            {isCreatingNew && (
              <Card className="border-[#8B4513] border-dashed">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="new-category">Nombre de la categoría</Label>
                    <Input
                      id="new-category"
                      placeholder="Ej: Perfumes de Lujo"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleCreateCategory();
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCreatingNew(false);
                        setNewCategoryName("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreateCategory}
                      disabled={loading}
                      className="bg-[#8B4513] hover:bg-[#A0522D]"
                    >
                      {loading ? "Creando..." : "Crear"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Grid de categorías */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredCategories.map((category) => {
                const isSelected = tempSelectedCategories.some(
                  (cat) => cat.id === category.id
                );
                return (
                  <Card
                    key={category.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? "border-[#8B4513] bg-[#8B4513]/5"
                        : "border-gray-200 hover:border-[#8B4513]/50"
                    }`}
                    onClick={() => toggleCategory(category)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {category.name}
                          </div>
                          {category.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {category.description}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-[#8B4513] flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredCategories.length === 0 && searchTerm && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No se encontraron categorías con "{searchTerm}"</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setNewCategoryName(searchTerm);
                    setIsCreatingNew(true);
                  }}
                >
                  Crear "{searchTerm}"
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-[#8B4513] hover:bg-[#A0522D]"
          >
            Confirmar Selección ({tempSelectedCategories.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
