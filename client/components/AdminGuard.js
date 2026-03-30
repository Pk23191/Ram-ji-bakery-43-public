import { useEffect } from "react";
import { useRouter } from "next/router";
import { useShop } from "../context/ShopContext";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const { adminToken } = useShop();

  useEffect(() => {
    if (!adminToken) {
      router.replace("/admin/login");
    }
  }, [adminToken, router]);

  if (!adminToken) {
    return <div className="section-shell py-20 text-center text-mocha/70">Redirecting to admin login...</div>;
  }

  return children;
}
