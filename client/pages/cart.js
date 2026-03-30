import Link from "next/link";
import CartLineItem from "../components/CartLineItem";
import Seo from "../components/Seo";
import SectionHeader from "../components/SectionHeader";
import { useShop } from "../context/ShopContext";
import { formatCurrency } from "../utils/helpers";
import usePricingSettings from "../hooks/usePricingSettings";
import { calculatePricingSummary } from "../utils/pricing";

export default function CartPage() {
  const { cart, cartTotal } = useShop();
  const { settings } = usePricingSettings();
  const pricing = calculatePricingSummary(cartTotal, settings);

  return (
    <>
      <Seo title="Cart" description="Review your cart and proceed to checkout at Ramji Bakery." path="/cart" />
      <section className="section-shell py-12">
        <SectionHeader
          eyebrow="Cart"
          title="Ready for checkout"
          description="Review items, adjust quantities and move to payment."
        />
        <div className="mt-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            {cart.length ? (
              cart.map((item) => <CartLineItem key={item.cartItemId} item={item} />)
            ) : (
              <div className="glass-panel p-8 text-center">
                <p className="text-lg font-semibold text-cocoa">Your cart is empty</p>
                <p className="mt-2 text-sm text-mocha/70">Add cakes, pastries or a custom celebration order to continue.</p>
                <Link href="/menu" className="btn-primary mt-5">
                  Explore Menu
                </Link>
              </div>
            )}
          </div>
          <div className="glass-panel h-fit p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-caramel">Summary</p>
            <div className="mt-5 space-y-4 text-sm text-mocha/70">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(pricing.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery</span>
                <span>{formatCurrency(pricing.deliveryCharge)}</span>
              </div>
              {pricing.gstEnabled ? (
                <div className="flex items-center justify-between">
                  <span>GST ({pricing.gstRate}%)</span>
                  <span>{formatCurrency(pricing.gstAmount)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-caramel/15 pt-4 text-base font-semibold text-cocoa">
                <span>Total</span>
                <span>{formatCurrency(pricing.total)}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary mt-6 w-full">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
