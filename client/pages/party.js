import ProductCard from "../components/ProductCard";
import SectionHeader from "../components/SectionHeader";
import Seo from "../components/Seo";
import useProducts from "../hooks/useProducts";

export default function PartyPage() {
  const { products, isLoading } = useProducts("party");

  return (
    <>
      <Seo
        title="Party Accessories"
        description="Shop party accessories from Ramji Bakery, including celebration hampers, candles and add-on decor."
        path="/party"
      />
      <section className="section-shell py-12 sm:py-16">
        <div className="overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-br from-[#fff4e6] via-[#fff8f2] to-[#ffe2cf] px-6 py-10 shadow-soft sm:px-10">
          <SectionHeader
            eyebrow="Party accessories"
            title="Finish every celebration with easy add-ons"
            description="Browse decor hampers, candles and party-ready extras that pair perfectly with your bakery order."
          />
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <div className="glass-panel p-6 text-sm text-mocha/70">Loading party products...</div>
          ) : products.length ? (
            products.map((product) => <ProductCard key={product._id} product={product} />)
          ) : (
            <div className="glass-panel sm:col-span-2 xl:col-span-3 p-8 text-center text-sm text-mocha/70">
              No party accessories are available right now. Please check back soon.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
