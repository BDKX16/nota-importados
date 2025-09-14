import { loadAbort } from "@/utils/load-abort-controller";
import axios from "axios";
import { store } from "../redux/store";

const getAxiosHeaders = () => {
  const state = store.getState();
  if (!state.user.token) {
    return {};
  }
  return {
    headers: {
      token: state.user.token,
      "Content-Type": "application/json",
    },
  };
};

// Obtener todos los productos
export const getAllProducts = () => {
  const controller = loadAbort();
  return {
    call: axios
      .get(process.env.NEXT_PUBLIC_API_URL + "/products", {
        signal: controller.signal,
        ...getAxiosHeaders(),
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request was aborted");
        }
        throw error;
      }),
    controller,
  };
};

// Obtener producto por ID
export const getProductById = (id) => {
  const controller = loadAbort();
  return {
    call: axios
      .get(process.env.NEXT_PUBLIC_API_URL + `/products/${id}`, {
        signal: controller.signal,
        ...getAxiosHeaders(),
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request was aborted");
        }
        throw error;
      }),
    controller,
  };
};

// Obtener productos por categoría
export const getProductsByCategory = (categoryId) => {
  const controller = loadAbort();
  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL + `/products/category/${categoryId}`,
        {
          signal: controller.signal,
          ...getAxiosHeaders(),
        }
      )
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request was aborted");
        }
        throw error;
      }),
    controller,
  };
};

// Obtener productos por tipo
export const getProductsByType = (type) => {
  const controller = loadAbort();
  return {
    call: axios
      .get(process.env.NEXT_PUBLIC_API_URL + `/products/type/${type}`, {
        signal: controller.signal,
        ...getAxiosHeaders(),
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request was aborted");
        }
        throw error;
      }),
    controller,
  };
};

// Obtener categorías
export const getCategories = () => {
  const controller = loadAbort();
  return {
    call: axios
      .get(process.env.NEXT_PUBLIC_API_URL + "/products/categories", {
        signal: controller.signal,
        ...getAxiosHeaders(),
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request was aborted");
        }
        throw error;
      }),
    controller,
  };
};

// Búsqueda de productos
export const searchProducts = (searchTerm) => {
  const controller = loadAbort();
  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL +
          `/products/search?q=${encodeURIComponent(searchTerm)}`,
        {
          signal: controller.signal,
          ...getAxiosHeaders(),
        }
      )
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request was aborted");
        }
        throw error;
      }),
    controller,
  };
};

// Filtrar productos
export const filterProducts = (filters) => {
  const controller = loadAbort();
  const params = new URLSearchParams();

  if (filters.category) {
    params.append("category", filters.category);
  }
  if (filters.type) {
    params.append("type", filters.type);
  }
  if (filters.brand) {
    params.append("brand", filters.brand);
  }
  if (filters.minPrice) {
    params.append("minPrice", filters.minPrice);
  }
  if (filters.maxPrice) {
    params.append("maxPrice", filters.maxPrice);
  }
  if (filters.search) {
    params.append("search", filters.search);
  }

  return {
    call: axios
      .get(
        process.env.NEXT_PUBLIC_API_URL +
          `/products/filter?${params.toString()}`,
        {
          signal: controller.signal,
          ...getAxiosHeaders(),
        }
      )
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request was aborted");
        }
        throw error;
      }),
    controller,
  };
};
