import Image from "next/image";
import Seo from "../components/Seo";
import SectionHeader from "../components/SectionHeader";

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About"
        description="Learn about the story, mission and handcrafted bakery philosophy behind Ramji Bakery."
        path="/about"
      />
      <section className="section-shell py-12">
        <div className="grid gap-10 xl:grid-cols-[1fr_0.95fr]">
          <div>
            <SectionHeader
              eyebrow="Our story"
              title="A neighborhood bakery with a premium point of view"
              description="Ramji Bakery began with a simple promise: handcrafted freshness, warm hospitality and celebration-worthy presentation for every order in Dinara."
            />
            <div className="mt-8 space-y-5 text-base leading-8 text-mocha/70">
              <p>
                From early-morning breads to detailed custom cakes, every item is built to feel special, approachable
                and made with care.
              </p>
              <p>
                Our mission is to bring city-style bakery quality to local families in Madhya Pradesh with better service,
                beautiful food styling and dependable online ordering.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
              "https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=1000&q=80"
            ].map((image) => (
              <div key={image} className="relative h-72 overflow-hidden rounded-[28px] shadow-soft">
                <Image src={image} alt="Bakery story" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
