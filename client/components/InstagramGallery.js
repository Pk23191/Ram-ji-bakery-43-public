import Image from "next/image";
import { gallery } from "../data/site";
import SectionHeader from "./SectionHeader";

export default function InstagramGallery() {
  return (
    <section className="section-shell py-20">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          eyebrow="Instagram moments"
          title="Visuals that make ordering irresistible"
          description="Rich food photography with a handcrafted, premium tone."
        />
        <a
          href="https://www.instagram.com/ramji_bakery_1100?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
        >
          Follow on Instagram
        </a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {gallery.map((image, index) => (
          <div
            key={image}
            className={`relative overflow-hidden rounded-[28px] ${
              index === 1 || index === 2 ? "sm:h-80" : "sm:h-64"
            } h-64`}
          >
            <Image src={image} alt="Bakery gallery" fill loading="lazy" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
