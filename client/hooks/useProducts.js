import { useEffect, useState } from "react";
import { normalizeCategory, normalizeProduct, products as fallbackProducts } from "../data/site";
import api from "../utils/api";

export default function useProducts(category = "") {
  const [products, setProducts] = useState(fallbackProducts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    async function loadProducts() {
      try {
        const { data } = await api.get("/products", {
          params: category ? { category } : undefined
        });
        const normalizedProducts = Array.isArray(data)
          ? data.map((product) => normalizeProduct(product))
          : [];

        if (active && normalizedProducts.length) {
          setProducts(normalizedProducts);
        } else if (active) {
          setProducts(
            fallbackProducts.filter((product) => !category || normalizeCategory(product.category) === category)
          );
        }
      } catch (error) {
        setProducts(
          fallbackProducts.filter((product) => !category || normalizeCategory(product.category) === category)
        );
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

  return { products, isLoading };
}
