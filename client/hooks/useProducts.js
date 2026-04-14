import { useEffect, useState } from "react";
import { normalizeProduct } from "../data/site";
import api from "../utils/api";

export default function useProducts(category = "", options = {}) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    async function loadProducts() {
      try {
        const params = {};
        if (category) params.category = category;
        if (options.limit) params.limit = options.limit;
        if (options.page) params.page = options.page;

        const { data } = await api.get("/products", { params: Object.keys(params).length ? params : undefined });
        // If paginated response, normalize items
        const payload = Array.isArray(data) ? data : data?.items || [];
        const normalizedProducts = Array.isArray(data)
          ? data.map((product) => normalizeProduct(product))
          : payload.map((product) => normalizeProduct(product));

        if (active) {
          setProducts(normalizedProducts);
        }
      } catch (error) {
        console.error("Products API error:", error);
        const message = error?.response?.data?.message || "Unable to load products";
        if (active) {
          setProducts([]);
          setError(message);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [category]);

  return { products, isLoading, error };
}
