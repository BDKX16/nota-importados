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
import {
  Star,
  Search,
  Edit,
  Trash2,
  Plus,
  Globe,
  Calendar,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import LoadingSpinner from "@/components/ui/loading-spinner";
import Image from "next/image";

// Importar servicios de marcas (necesitaremos crearlos)
import {
  getAdminBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/services/private";
import { getAdminCategories } from "@/services/private";

interface Brand {
  _id: string;
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  slug: string;
  country?: string;
  foundedYear?: number;
  isActive: boolean;
  isPremium: boolean;
  categories?: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

interface BrandFormData {
  name: string;
  description: string;
  logo: string;
  website: string;
  country: string;
  foundedYear: number | null;
  isPremium: boolean;
  isActive: boolean;
  categories: string[];
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

export default function AdminBrandsPage() {
  const { toast } = useToast();
  const { loading, callEndpoint } = useFetchAndLoad();

  // Estados
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    description: "",
    logo: "",
    website: "",
    country: "",
    foundedYear: null,
    isPremium: false,
    isActive: true,
    categories: [],
    socialMedia: {
      instagram: "",
      facebook: "",
      twitter: "",
      youtube: "",
    },
    contactInfo: {
      email: "",
      phone: "",
      address: "",
    },
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
  });

  // Países disponibles
  const countries = [
    "Francia",
    "Italia",
    "Estados Unidos",
    "Reino Unido",
    "Alemania",
    "España",
    "Japón",
    "Suiza",
    "Brasil",
    "Argentina",
    "Colombia",
    "México",
    "Chile",
    "Perú",
    "Uruguay",
    "Ecuador",
    "Otro",
  ];

  useEffect(() => {
    loadBrands();
    loadCategories();
  }, []);

  useEffect(() => {
    filterBrands();
  }, [brands, searchTerm, showInactive]);

  const loadBrands = async () => {
    try {
      const response = await callEndpoint(getAdminBrands());
      if (response && response.data?.data) {
        setBrands(response.data.data.brands || []);
      } else {
        console.log("⚠️ No hay data en la respuesta");
      }
    } catch (error) {
      console.error("❌ Error loading brands:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las marcas",
        variant: "destructive",
      });
    }
  };

  const loadCategories = async () => {
    try {
      const response = await callEndpoint(getAdminCategories());
      if (response && response.data) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const filterBrands = () => {
    let filtered = brands;
    console.log("🔍 Filtrando marcas. Total:", brands.length);

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (brand) =>
          brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          brand.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          brand.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log("📝 Después de filtrar por búsqueda:", filtered.length);
    }

    // Filtrar por estado activo/inactivo
    if (!showInactive) {
      filtered = filtered.filter((brand) => brand.isActive);
      console.log("👁️ Después de filtrar por activos:", filtered.length);
    }

    console.log("✅ Marcas finales filtradas:", filtered.length);
    setFilteredBrands(filtered);
  };

  const openModal = (brand?: Brand) => {
    if (brand) {
      setSelectedBrand(brand);
      setFormData({
        name: brand.name,
        description: brand.description || "",
        logo: brand.logo || "",
        website: brand.website || "",
        country: brand.country || "",
        foundedYear: brand.foundedYear || null,
        isPremium: brand.isPremium,
        isActive: brand.isActive,
        categories: brand.categories?.map((cat) => cat._id) || [],
        socialMedia: {
          instagram: brand.socialMedia?.instagram || "",
          facebook: brand.socialMedia?.facebook || "",
          twitter: brand.socialMedia?.twitter || "",
          youtube: brand.socialMedia?.youtube || "",
        },
        contactInfo: {
          email: brand.contactInfo?.email || "",
          phone: brand.contactInfo?.phone || "",
          address: brand.contactInfo?.address || "",
        },
        seoTitle: brand.seoTitle || "",
        seoDescription: brand.seoDescription || "",
        seoKeywords: brand.seoKeywords || [],
      });
    } else {
      setSelectedBrand(null);
      setFormData({
        name: "",
        description: "",
        logo: "",
        website: "",
        country: "",
        foundedYear: null,
        isPremium: false,
        isActive: true,
        categories: [],
        socialMedia: {
          instagram: "",
          facebook: "",
          twitter: "",
          youtube: "",
        },
        contactInfo: {
          email: "",
          phone: "",
          address: "",
        },
        seoTitle: "",
        seoDescription: "",
        seoKeywords: [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la marca es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const brandData = {
        ...formData,
        id: formData.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      };

      if (selectedBrand) {
        // Actualizar marca existente
        await callEndpoint(updateBrand(selectedBrand._id, brandData));
        toast({
          title: "Éxito",
          description: "Marca actualizada correctamente",
        });
      } else {
        // Crear nueva marca
        await callEndpoint(createBrand(brandData));
        toast({
          title: "Éxito",
          description: "Marca creada correctamente",
        });
      }

      closeModal();
      loadBrands();
    } catch (error) {
      console.error("Error saving brand:", error);
      toast({
        title: "Error",
        description: selectedBrand
          ? "Error al actualizar la marca"
          : "Error al crear la marca",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;

    try {
      await callEndpoint(deleteBrand(brandToDelete._id));
      toast({
        title: "Éxito",
        description: "Marca eliminada correctamente",
      });
      loadBrands();
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast({
        title: "Error",
        description: "Error al eliminar la marca",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setBrandToDelete(null);
    }
  };

  const openDeleteDialog = (brand: Brand) => {
    setBrandToDelete(brand);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (field: string, value: any, section?: string) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section as keyof BrandFormData],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);
    setFormData((prev) => ({
      ...prev,
      seoKeywords: keywords,
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestión de Marcas
          </h1>
          <p className="text-muted-foreground mt-2">
            Administra las marcas de perfumería disponibles en el catálogo
          </p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Marca
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar marcas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive">Mostrar inactivas</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de marcas */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand) => (
              <Card
                key={brand._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Logo */}
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {brand.logo ? (
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        ) : (
                          <Star className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Información */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {brand.name}
                          </h3>
                          <div className="flex space-x-2">
                            {brand.isPremium && (
                              <Badge variant="default" className="bg-primary">
                                <Star className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                            <Badge
                              variant={brand.isActive ? "default" : "secondary"}
                            >
                              {brand.isActive ? "Activa" : "Inactiva"}
                            </Badge>
                          </div>
                        </div>

                        {brand.description && (
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {brand.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {brand.country && (
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-1" />
                              {brand.country}
                            </div>
                          )}
                          {brand.foundedYear && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {brand.foundedYear}
                            </div>
                          )}
                          {brand.website && (
                            <a
                              href={brand.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center hover:text-primary"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Sitio web
                            </a>
                          )}
                        </div>

                        {brand.categories && brand.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {brand.categories.map((category) => (
                              <Badge
                                key={category._id}
                                variant="outline"
                                className="text-xs"
                              >
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal(brand)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(brand)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No se encontraron marcas
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm
                    ? "Intenta con otros términos de búsqueda"
                    : "Comienza agregando tu primera marca"}
                </p>
                <Button onClick={() => openModal()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Marca
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal de creación/edición */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBrand ? "Editar Marca" : "Nueva Marca"}
            </DialogTitle>
            <DialogDescription>
              {selectedBrand
                ? "Modifica la información de la marca"
                : "Completa la información para crear una nueva marca"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ej: Chanel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar país" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Descripción de la marca..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo">URL del Logo</Label>
                <Input
                  id="logo"
                  value={formData.logo}
                  onChange={(e) => handleInputChange("logo", e.target.value)}
                  placeholder="https://ejemplo.com/logo.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://ejemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foundedYear">Año de Fundación</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={formData.foundedYear || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "foundedYear",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  placeholder="1910"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="isPremium"
                  checked={formData.isPremium}
                  onCheckedChange={(checked) =>
                    handleInputChange("isPremium", checked)
                  }
                />
                <Label htmlFor="isPremium">Marca Premium</Label>
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange("isActive", checked)
                  }
                />
                <Label htmlFor="isActive">Activa</Label>
              </div>
            </div>

            {/* Categorías */}
            <div className="space-y-2">
              <Label>Categorías</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={category._id}
                      checked={formData.categories.includes(category._id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleInputChange("categories", [
                            ...formData.categories,
                            category._id,
                          ]);
                        } else {
                          handleInputChange(
                            "categories",
                            formData.categories.filter(
                              (id) => id !== category._id
                            )
                          );
                        }
                      }}
                    />
                    <Label htmlFor={category._id} className="text-sm">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Redes sociales */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Redes Sociales</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.socialMedia.instagram}
                    onChange={(e) =>
                      handleInputChange(
                        "instagram",
                        e.target.value,
                        "socialMedia"
                      )
                    }
                    placeholder="@marca"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.socialMedia.facebook}
                    onChange={(e) =>
                      handleInputChange(
                        "facebook",
                        e.target.value,
                        "socialMedia"
                      )
                    }
                    placeholder="facebook.com/marca"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.socialMedia.twitter}
                    onChange={(e) =>
                      handleInputChange(
                        "twitter",
                        e.target.value,
                        "socialMedia"
                      )
                    }
                    placeholder="@marca"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={formData.socialMedia.youtube}
                    onChange={(e) =>
                      handleInputChange(
                        "youtube",
                        e.target.value,
                        "socialMedia"
                      )
                    }
                    placeholder="youtube.com/marca"
                  />
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Información de Contacto
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) =>
                      handleInputChange("email", e.target.value, "contactInfo")
                    }
                    placeholder="contacto@marca.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.contactInfo.phone}
                    onChange={(e) =>
                      handleInputChange("phone", e.target.value, "contactInfo")
                    }
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.contactInfo.address}
                  onChange={(e) =>
                    handleInputChange("address", e.target.value, "contactInfo")
                  }
                  placeholder="Dirección de la empresa"
                />
              </div>
            </div>

            {/* SEO */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">SEO</Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">Título SEO</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) =>
                      handleInputChange("seoTitle", e.target.value)
                    }
                    placeholder="Título para SEO"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">Descripción SEO</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) =>
                      handleInputChange("seoDescription", e.target.value)
                    }
                    placeholder="Descripción para SEO"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoKeywords">Palabras Clave SEO</Label>
                  <Input
                    id="seoKeywords"
                    value={formData.seoKeywords.join(", ")}
                    onChange={(e) => handleKeywordsChange(e.target.value)}
                    placeholder="perfume, fragancia, lujo (separadas por comas)"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Guardando...
                </>
              ) : selectedBrand ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              marca "{brandToDelete?.name}" del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
