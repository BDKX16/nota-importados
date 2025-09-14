import axios from "axios";
import { loadAbort } from "@/utils/load-abort-controller";
import { store } from "../redux/store";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const getAxiosHeaders = () => {
  const state = store.getState();
  if (!state.user.token) {
    return null;
  }
  return {
    headers: {
      token: state.user.token,
      "Content-Type": "application/json",
    },
  };
};

const notifyError = (error) => {
  console.error("Error en servicio:", error);
  // Aquí podrías agregar notificaciones toast si las tienes configuradas
};

/**********
 * GESTIÓN DE IMÁGENES
 ************/

// Subir una imagen
export const uploadImage = (imageFile) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  // Crear FormData para enviar el archivo
  const formData = new FormData();
  formData.append("image", imageFile);

  return {
    call: axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/images/upload", formData, {
        signal: controller.signal,
        headers: {
          token: store.getState().user.token,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data)
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

// Subir múltiples imágenes
export const uploadMultipleImages = (imageFiles) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  // Crear FormData para enviar los archivos
  const formData = new FormData();
  imageFiles.forEach((file) => {
    formData.append("images", file);
  });

  return {
    call: axios
      .post(
        process.env.NEXT_PUBLIC_API_URL + "/images/upload-multiple",
        formData,
        {
          signal: controller.signal,
          headers: {
            token: store.getState().user.token,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((res) => res.data)
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

// Obtener lista de imágenes
export const getImages = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(process.env.NEXT_PUBLIC_API_URL + "/images", headers, {
        signal: controller.signal,
      })
      .then((res) => res.data)
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

// Eliminar una imagen
export const deleteImage = (filename) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(
        process.env.NEXT_PUBLIC_API_URL + "/images/" + filename,
        headers,
        {
          signal: controller.signal,
        }
      )
      .then((res) => res.data)
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

// Obtener URL de imagen
export const getImageUrl = (filename) => {
  console.log("getImageUrl input:", filename);
  console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);

  if (!filename || filename.trim() === "") return "/placeholder.jpg";

  // Si ya es una URL completa, devolverla tal como está
  if (filename.startsWith("http")) {
    return filename;
  }

  // Si ya incluye /api/images/, devolverlo con solo la base URL sin /api
  if (filename.startsWith("/api/images/")) {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const cleanBaseUrl = baseUrl.replace(/\/api$/, ""); // Remover /api del final si existe
    const result = cleanBaseUrl + filename;
    console.log("getImageUrl result (api/images):", result);
    return result;
  }

  // Si es un path que empieza con /images/, agregarlo directamente
  if (filename.startsWith("/images/")) {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const result = baseUrl + filename;
    console.log("getImageUrl result (images):", result);
    return result;
  }

  // Si es solo el nombre del archivo, construir la URL completa
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const result = baseUrl + "/images/" + filename;
  console.log("getImageUrl result (filename only):", result);
  return result;
};
