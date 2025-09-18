import { loadAbort } from "@/utils/load-abort-controller";
import axios from "axios";
import { store } from "../redux/store";
//import { useSelector } from "react-redux";

const getAxiosHeaders = () => {
  //const userState = useSelector((store) => store.user);
  const state = store.getState();
  if (!state.user.token) {
    return;
  }
  return {
    headers: {
      token: state.user.token,
      "Content-Type": "application/json",
    },
  };
};

// Autenticación
export const login = (username, password) => {
  const controller = loadAbort();
  return {
    call: axios.post(
      process.env.NEXT_PUBLIC_API_URL + "/users/login",
      { email: username, password },
      { signal: controller.signal }
    ),
    controller,
  };
};

export const register = (name, username, password, phone, address) => {
  const controller = loadAbort();
  return {
    call: axios.post(
      process.env.NEXT_PUBLIC_API_URL + "/users/register",
      {
        name: name,
        email: username,
        password: password,
        phone: phone,
        address: address,
      },
      { signal: controller.signal }
    ),
    controller,
  };
};

// Descuentos
export const validateDiscount = (code, cartItems) => {
  const controller = loadAbort();
  return {
    call: axios.post(
      process.env.NEXT_PUBLIC_API_URL + "/validate-discount",
      { code, cartItems },
      { signal: controller.signal }
    ),
    controller,
  };
};

export const updateSubscriptionBeerType = (
  subscriptionId,
  beerType,
  beerName
) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return {
      call: Promise.reject(new Error("No hay token de autenticación")),
      controller,
    };
  }

  return {
    call: axios.patch(
      process.env.NEXT_PUBLIC_API_URL +
        `/my-subscriptions/${subscriptionId}/beer-type`,
      { beerType, beerName },
      headers,
      { signal: controller.signal }
    ),
    controller,
  };
};

export const createSubscription = (subscriptionId, beerType, beerName) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return {
      call: Promise.reject(new Error("No hay token de autenticación")),
      controller,
    };
  }

  return {
    call: axios.post(
      process.env.NEXT_PUBLIC_API_URL + `/subscriptions`,
      { subscriptionId, beerType, beerName },
      headers,
      { signal: controller.signal }
    ),
    controller,
  };
};

// Marcas
export const getBrands = (params = {}) => {
  const controller = loadAbort();
  const queryParams = new URLSearchParams();

  if (params.category) queryParams.append("category", params.category);
  if (params.premium) queryParams.append("premium", params.premium);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.page) queryParams.append("page", params.page);

  const queryString = queryParams.toString();
  const url = `${process.env.NEXT_PUBLIC_API_URL}/brands${
    queryString ? `?${queryString}` : ""
  }`;

  return {
    call: axios.get(url, {
      signal: controller.signal,
    }),
    controller,
  };
};

export const getBrandBySlug = (slug) => {
  const controller = loadAbort();
  return {
    call: axios.get(process.env.NEXT_PUBLIC_API_URL + `/brands/${slug}`, {
      signal: controller.signal,
    }),
    controller,
  };
};

export const getPremiumBrands = () => {
  const controller = loadAbort();
  return {
    call: axios.get(process.env.NEXT_PUBLIC_API_URL + "/brands/premium", {
      signal: controller.signal,
    }),
    controller,
  };
};

// Recomendaciones (requiere autenticación)
export const getTopProducts = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();

  if (!headers) {
    return {
      call: Promise.reject(new Error("No hay token de autenticación")),
      controller,
    };
  }

  return {
    call: axios.get(process.env.NEXT_PUBLIC_API_URL + "/top-products", headers, {
      signal: controller.signal,
    }),
    controller,
  };
};

// Contacto
export const sendContactForm = (contactData) => {
  const controller = loadAbort();
  return {
    call: axios.post(process.env.NEXT_PUBLIC_API_URL + "/contact", contactData, {
      signal: controller.signal,
    }),
    controller,
  };
};
