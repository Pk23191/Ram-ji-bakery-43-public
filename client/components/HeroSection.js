import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="section-shell grid gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="space-y-6"
      >
        <span className="inline-flex rounded-full border border-caramel/30 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-caramel">
          Dinara&apos;s premium bakery experience
        </span>
        <div className="space-y-4">
          <h1 className="font-heading text-5xl leading-tight text-cocoa sm:text-6xl">
            Freshly Baked Happiness Everyday
          </h1>
          <p className="max-w-xl text-base leading-8 text-mocha/75 sm:text-lg">
            Crafted cakes, flaky pastries, artisan breads and celebration extras designed to make every
            order feel special.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/menu" className="btn-primary">
            Order Now
          </Link>
          <Link href="/customize-cake" className="btn-secondary">
            Customize Cake
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-3">
          {[
            { label: "Orders Delivered", value: "2.5K+" },
            { label: "Custom Cakes", value: "400+" },
            { label: "Google Rating", value: "4.9" }
          ].map((stat) => (
            <div key={stat.label} className="glass-panel p-4 text-center">
              <p className="font-heading text-2xl text-cocoa">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-mocha/55">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative"
      >
        <div className="relative overflow-hidden rounded-[34px] bg-white p-3 shadow-float">
          <div className="absolute inset-x-6 top-6 z-10 flex items-center justify-between rounded-full bg-white/80 px-4 py-3 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-caramel">Today&apos;s pick</p>
              <p className="font-semibold text-cocoa">Signature Truffle Cake</p>
            </div>
            <span className="rounded-full bg-cocoa px-3 py-1 text-xs font-semibold text-cream">Hot</span>
          </div>
          <div className="relative h-[420px] overflow-hidden rounded-[28px]">
            <Image
              src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80"
              alt="Premium bakery cake"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
        <div className="absolute -bottom-6 -left-5 glass-panel max-w-xs p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-caramel">Fast local delivery</p>
          <p className="mt-2 text-sm leading-6 text-mocha/75">
            Same-day slots available across Dinara for cakes, pastries and party combos.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
