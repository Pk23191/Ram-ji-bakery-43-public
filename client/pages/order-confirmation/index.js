import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Seo from "../../components/Seo";
import { sendWhatsApp } from "../../utils/whatsapp";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { id } = router.query;
  const [lastOrder, setLastOrder] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem("rb_last_order");
    if (raw) {
      try {
        setLastOrder(JSON.parse(raw));
      } catch (error) {
        // ignore invalid cache
      }
    }
  }, []);

  const handleSendWhatsApp = () => {
    if (!lastOrder) {
      toast.error("Order details missing. Please place a new order.");
      return;
    }

    setIsSending(true);
    toast("Redirecting to WhatsApp...");
    sendWhatsApp(lastOrder);
    setTimeout(() => setIsSending(false), 1200);
  };

  return (
    <>
      <Seo
        title="Order Confirmation"
        description="Your Ramji Bakery order has been placed successfully."
        path="/order-confirmation"
      />
      <section className="section-shell py-16">
        <div className="glass-panel mx-auto max-w-3xl p-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-caramel">Order placed</p>
          <h1 className="mt-4 font-heading text-4xl text-cocoa">Thank you for choosing Ramji Bakery</h1>
          <p className="mt-4 text-base leading-7 text-mocha/70">
            Your order reference is <span className="font-semibold text-cocoa">{id}</span>. We&apos;ll prepare your
            order and keep you posted.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/track-order" className="btn-primary">
              Track Order
            </Link>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleSendWhatsApp}
              disabled={!lastOrder || isSending}
            >
              {isSending ? "Sending..." : "Send Order on WhatsApp"}
            </button>
            <Link href="/menu" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
