"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Search, Edit, Trash2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import {
  getAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminCategories,
  createCategory,
} from "@/services/private";
import { uploadImage, deleteImage, getImageUrl } from "@/services/imageService";
import LoadingSpinner from "@/components/ui/loading-spinner";
import CategorySelectorModal from "@/components/admin/CategorySelectorModal";

// Tipos
type ProductType =
  | "perfume"
  | "cologne"
  | "body-spray"
  | "gift-set"
  | "aftershave"
  | "eau-de-toilette"
  | "eau-de-parfum";

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  categoryId: ProductType;
  type: ProductType;
  categories?: string[];
  categoryNames?: string[];
  price: number;
  images: string[];
  description: string;
  stock: number;
  brand?: string;
  volume?: string;
  concentration?: string;
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
  } | null>(null);
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [categorySelectorMode, setCategorySelectorMode] = useState<
    "new" | "edit"
  >("new");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    category: "",
    categoryId: "perfume",
    type: "perfume",
    categories: [],
    categoryNames: [],
    price: 0,
    images: [],
    description: "",
    stock: 0,
    brand: "",
    volume: "",
    concentration: "",
  });

  const { loading, callEndpoint } = useFetchAndLoad();
  const { toast } = useToast();

  // Cargar datos al iniciar
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Obtener todos los productos
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await callEndpoint(getAdminProducts());
      if (response && response.data && response.data.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("Error al obtener productos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Obtener todas las categorías
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await callEndpoint(getAdminCategories());
      if (response && response.data && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand &&
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Funciones para gestionar productos
  const handleEditProduct = async (productId: string) => {
    try {
      const response = await callEndpoint(getAdminProductById(productId));
      if (response && response.data && response.data.product) {
        const product = response.data.product;
        // Asegurar que el array de imágenes esté inicializado
        const processedProduct = {
          ...product,
          images: product.images || [],
        };
        setEditingProduct(processedProduct);
      }
    } catch (error) {
      console.error("Error al obtener detalle de producto:", error);
      toast({
        title: "Error",
        description: "No se pudo obtener la información del producto",
        variant: "destructive",
      });
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    try {
      const response = await callEndpoint(
        updateProduct(editingProduct.id, editingProduct)
      );
      if (response && response.data) {
        await fetchProducts(); // Recargar la lista de productos
        setEditingProduct(null);
        toast({
          title: "Producto actualizado",
          description: `El producto ${editingProduct.name} ha sido actualizado correctamente.`,
        });
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setProductToDelete({ id });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await callEndpoint(deleteProduct(productToDelete.id));
      if (response) {
        await fetchProducts(); // Recargar la lista de productos
        toast({
          title: "Producto eliminado",
          description: "El producto ha sido eliminado correctamente.",
        });
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.type) {
      toast({
        title: "Error",
        description:
          "Por favor completa al menos el nombre y el tipo del producto",
        variant: "destructive",
      });
      return;
    }

    const productToAdd = {
      ...newProduct,
      id: `product-${Date.now()}`,
      name: newProduct.name || "Nuevo Producto",
      category: newProduct.category || "General",
      categoryId: (newProduct.categoryId as ProductType) || "perfume",
      type: (newProduct.type as ProductType) || "perfume",
      categories: newProduct.categories || [],
      categoryNames: newProduct.categoryNames || [],
      price: newProduct.price || 0,
      images: newProduct.images || [],
      description: newProduct.description || "",
      stock: newProduct.stock || 0,
      brand: newProduct.brand || "",
      volume: newProduct.volume || "",
      concentration: newProduct.concentration || "",
    };

    try {
      const response = await callEndpoint(createProduct(productToAdd));
      if (response && response.data) {
        await fetchProducts(); // Recargar la lista de productos
        setNewProduct({
          name: "",
          category: "",
          categoryId: "perfume",
          type: "perfume",
          categories: [],
          categoryNames: [],
          price: 0,
          images: [],
          description: "",
          stock: 0,
          brand: "",
          volume: "",
          concentration: "",
        });
        toast({
          title: "Producto añadido",
          description: `${productToAdd.name} ha sido añadido al catálogo.`,
        });
      }
    } catch (error) {
      console.error("Error al crear producto:", error);
      toast({
        title: "Error",
        description: "No se pudo añadir el producto",
        variant: "destructive",
      });
    }
  };

  // Funciones para manejar el modal de categorías
  const openCategorySelectorForNew = () => {
    setCategorySelectorMode("new");
    setSelectedCategories(
      (newProduct.categories
        ?.map((catId) => categories.find((cat) => cat.id === catId))
        .filter(Boolean) as Category[]) || []
    );
    setIsCategorySelectorOpen(true);
  };

  const openCategorySelectorForEdit = () => {
    if (!editingProduct) return;
    setCategorySelectorMode("edit");
    setSelectedCategories(
      (editingProduct.categories
        ?.map((catId) => categories.find((cat) => cat.id === catId))
        .filter(Boolean) as Category[]) || []
    );
    setIsCategorySelectorOpen(true);
  };

  const handleCategoriesConfirm = (selectedCats: Category[]) => {
    const categoryIds = selectedCats.map((cat) => cat.id);
    const categoryNames = selectedCats.map((cat) => cat.name);

    if (categorySelectorMode === "new") {
      setNewProduct((prev) => ({
        ...prev,
        categories: categoryIds,
        categoryNames: categoryNames,
        category: categoryNames.join(", ") || "Sin categoría",
      }));
    } else if (categorySelectorMode === "edit" && editingProduct) {
      setEditingProduct((prev) =>
        prev
          ? {
              ...prev,
              categories: categoryIds,
              categoryNames: categoryNames,
              category: categoryNames.join(", ") || "Sin categoría",
            }
          : null
      );
    }

    setSelectedCategories(selectedCats);
    setIsCategorySelectorOpen(false);
  };

  const handleCategoriesCancel = () => {
    setIsCategorySelectorOpen(false);
  };

  // Funciones para manejar imágenes
  const handleImageUpload = async (file: File, isForEditing = false) => {
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen (JPG, PNG, WEBP)",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "La imagen no puede ser mayor a 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const response = await callEndpoint(uploadImage(file));
      if (response && response.file && response.file.url) {
        const imageUrl = getImageUrl(response.file.url);
        setUploadedImageUrl(imageUrl);

        // Actualizar el producto correspondiente
        if (isForEditing && editingProduct) {
          const currentImages = editingProduct.images || [];
          const newImages = [...currentImages, imageUrl];
          setEditingProduct({
            ...editingProduct,
            images: newImages,
          });
        } else {
          const currentImages = newProduct.images || [];
          const newImages = [...currentImages, imageUrl];
          setNewProduct({
            ...newProduct,
            images: newImages,
          });
        }

        toast({
          title: "Imagen subida",
          description: "La imagen se ha subido correctamente",
        });
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isForEditing = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, isForEditing);
    }
  };

  const removeImage = (imageToRemove: string, isForEditing = false) => {
    if (isForEditing && editingProduct) {
      const newImages = (editingProduct.images || []).filter(
        (img) => img !== imageToRemove
      );
      setEditingProduct({
        ...editingProduct,
        images: newImages,
      });
    } else {
      const newImages = (newProduct.images || []).filter(
        (img) => img !== imageToRemove
      );
      setNewProduct({
        ...newProduct,
        images: newImages,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#8B4513]">
            Gestión de Productos
          </h1>
          <p className="text-muted-foreground">
            Administra el catálogo completo de productos de lujo
          </p>
        </div>

        {/* Buscar productos */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-[300px]"
          />
        </div>
      </div>

      {/* Productos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#8B4513]">
            Productos ({filteredProducts.length})
          </h2>

          {/* Añadir Producto */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#8B4513] hover:bg-[#8B4513]/90">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-[#8B4513]">
                  Nuevo Producto
                </DialogTitle>
                <DialogDescription>
                  Añade un nuevo producto al catálogo.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="new-name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-categories" className="text-right">
                    Categorías
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openCategorySelectorForNew}
                      className="w-full justify-start text-left"
                    >
                      {newProduct.categoryNames &&
                      newProduct.categoryNames.length > 0
                        ? `${newProduct.categoryNames.length} categoría${
                            newProduct.categoryNames.length > 1 ? "s" : ""
                          } seleccionada${
                            newProduct.categoryNames.length > 1 ? "s" : ""
                          }`
                        : "Seleccionar categorías"}
                    </Button>
                    {newProduct.categoryNames &&
                      newProduct.categoryNames.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {newProduct.categoryNames.map((name, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#8B4513] text-white"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-categoryId" className="text-right">
                    Tipo
                  </Label>
                  <Select
                    value={newProduct.categoryId as string}
                    onValueChange={(value) =>
                      setNewProduct({
                        ...newProduct,
                        categoryId: value as ProductType,
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perfume">Perfume</SelectItem>
                      <SelectItem value="cologne">Cologne</SelectItem>
                      <SelectItem value="body-spray">Body Spray</SelectItem>
                      <SelectItem value="gift-set">Set de Regalo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-brand" className="text-right">
                    Marca
                  </Label>
                  <Input
                    id="new-brand"
                    value={newProduct.brand}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, brand: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-volume" className="text-right">
                    Volumen
                  </Label>
                  <Input
                    id="new-volume"
                    value={newProduct.volume}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, volume: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="ej: 100ml"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-concentration" className="text-right">
                    Concentración
                  </Label>
                  <Input
                    id="new-concentration"
                    value={newProduct.concentration}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        concentration: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="ej: EDP, EDT"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-price" className="text-right">
                    Precio
                  </Label>
                  <Input
                    id="new-price"
                    type="number"
                    value={newProduct.price || ""}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="new-stock"
                    type="number"
                    value={newProduct.stock || ""}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="new-image" className="text-right">
                    Imágenes
                  </Label>
                  <div className="col-span-3 space-y-3">
                    {/* Input para subir archivo */}
                    <div className="flex items-center gap-2">
                      <Input
                        id="new-image-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, false)}
                        disabled={isUploadingImage}
                        className="flex-1"
                      />
                      {isUploadingImage && (
                        <div className="text-sm text-muted-foreground">
                          Subiendo...
                        </div>
                      )}
                    </div>

                    {/* URL manual como alternativa */}
                    <Input
                      id="new-image-url"
                      value=""
                      onChange={(e) => {
                        const url = e.target.value.trim();
                        if (url) {
                          const currentImages = newProduct.images || [];
                          const newImages = [...currentImages, url];
                          setNewProduct({
                            ...newProduct,
                            images: newImages,
                          });
                          e.target.value = ""; // Limpiar el input
                        }
                      }}
                      placeholder="O pega la URL de una imagen y presiona Enter"
                      disabled={isUploadingImage}
                    />

                    {/* Grid de imágenes */}
                    {isUploadingImage ? (
                      <div className="mt-3 p-4 border rounded-lg bg-blue-50">
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">
                              Subiendo imagen...
                            </p>
                            <p className="text-xs text-blue-600">
                              Por favor espera mientras se procesa el archivo
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : newProduct.images && newProduct.images.length > 0 ? (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Imágenes del producto ({newProduct.images.length})
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {newProduct.images.map((img, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={getImageUrl(img)}
                                alt={`Imagen ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg border shadow-sm"
                                onError={() => removeImage(img, false)}
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(img, false)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <div className="text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">
                            No hay imágenes cargadas
                          </p>
                          <p className="text-xs text-gray-400">
                            Sube archivos o pega URLs para agregar imágenes
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-description" className="text-right">
                    Descripción
                  </Label>
                  <Textarea
                    id="new-description"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddProduct}
                  disabled={loading}
                  className="bg-[#8B4513] hover:bg-[#8B4513]/90"
                >
                  {loading ? "Añadiendo..." : "Añadir Producto"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de productos */}
        {isLoadingProducts ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-[#DAA520]/20">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-3">
                    {/* Imagen del producto */}
                    <div className="flex-shrink-0">
                      <img
                        src={getImageUrl(
                          product.images?.[0] || "/placeholder.jpg"
                        )}
                        alt={product.name}
                        className="h-16 w-16 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.jpg";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-[#8B4513]">
                        {product.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.brand} • {product.volume}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-[#DAA520]/10 text-[#DAA520] flex-shrink-0"
                    >
                      {product.categoryId}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-[#8B4513]">
                      ${product.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Stock: {product.stock}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product.id)}
                      className="flex-1"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !isLoadingProducts && (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
              No hay productos
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Comienza añadiendo tu primer producto al catálogo.
            </p>
          </div>
        )}
      </div>

      {/* Dialog para editar producto */}
      {editingProduct && (
        <Dialog
          open={!!editingProduct}
          onOpenChange={() => setEditingProduct(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#8B4513]">
                Editar Producto
              </DialogTitle>
              <DialogDescription>
                Modifica la información del producto.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-categories" className="text-right">
                  Categorías
                </Label>
                <div className="col-span-3 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openCategorySelectorForEdit}
                    className="w-full justify-start text-left"
                  >
                    {editingProduct.categoryNames &&
                    editingProduct.categoryNames.length > 0
                      ? `${editingProduct.categoryNames.length} categoría${
                          editingProduct.categoryNames.length > 1 ? "s" : ""
                        } seleccionada${
                          editingProduct.categoryNames.length > 1 ? "s" : ""
                        }`
                      : "Seleccionar categorías"}
                  </Button>
                  {editingProduct.categoryNames &&
                    editingProduct.categoryNames.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {editingProduct.categoryNames.map((name, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#8B4513] text-white"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-categoryId" className="text-right">
                  Tipo
                </Label>
                <Select
                  value={editingProduct.categoryId as string}
                  onValueChange={(value) =>
                    setEditingProduct({
                      ...editingProduct,
                      categoryId: value as ProductType,
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perfume">Perfume</SelectItem>
                    <SelectItem value="cologne">Cologne</SelectItem>
                    <SelectItem value="body-spray">Body Spray</SelectItem>
                    <SelectItem value="gift-set">Set de Regalo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-brand" className="text-right">
                  Marca
                </Label>
                <Input
                  id="edit-brand"
                  value={editingProduct.brand || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      brand: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-volume" className="text-right">
                  Volumen
                </Label>
                <Input
                  id="edit-volume"
                  value={editingProduct.volume || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      volume: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="ej: 100ml"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-concentration" className="text-right">
                  Concentración
                </Label>
                <Input
                  id="edit-concentration"
                  value={editingProduct.concentration || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      concentration: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="ej: EDP, EDT"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Precio
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editingProduct.price || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editingProduct.stock || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-image" className="text-right">
                  Imágenes
                </Label>
                <div className="col-span-3 space-y-3">
                  {/* Input para subir archivo */}
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-image-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, true)}
                      disabled={isUploadingImage}
                      className="flex-1"
                    />
                    {isUploadingImage && (
                      <div className="text-sm text-muted-foreground">
                        Subiendo...
                      </div>
                    )}
                  </div>

                  {/* URL manual como alternativa */}
                  <Input
                    id="edit-image-url"
                    value=""
                    onChange={(e) => {
                      const url = e.target.value.trim();
                      if (url && editingProduct) {
                        const currentImages = editingProduct.images || [];
                        const newImages = [...currentImages, url];
                        setEditingProduct({
                          ...editingProduct,
                          images: newImages,
                        });
                        e.target.value = ""; // Limpiar el input
                      }
                    }}
                    placeholder="O pega la URL de una imagen y presiona Enter"
                    disabled={isUploadingImage}
                  />

                  {/* Grid de imágenes */}
                  {isUploadingImage ? (
                    <div className="mt-3 p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Subiendo imagen...
                          </p>
                          <p className="text-xs text-blue-600">
                            Por favor espera mientras se procesa el archivo
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : editingProduct.images &&
                    editingProduct.images.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        Imágenes del producto ({editingProduct.images.length})
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {editingProduct.images.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={getImageUrl(img)}
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border shadow-sm"
                              onError={() => removeImage(img, true)}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(img, true)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">
                          No hay imágenes cargadas
                        </p>
                        <p className="text-xs text-gray-400">
                          Sube archivos o pega URLs para agregar imágenes
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSaveProduct}
                disabled={loading}
                className="bg-[#8B4513] hover:bg-[#8B4513]/90"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#8B4513]">
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el producto del catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de selección de categorías */}
      <CategorySelectorModal
        isOpen={isCategorySelectorOpen}
        onClose={handleCategoriesCancel}
        onConfirm={handleCategoriesConfirm}
        selectedCategories={selectedCategories}
        availableCategories={categories}
        onCategoriesUpdate={fetchCategories}
      />
    </div>
  );
}
