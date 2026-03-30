import { motion } from "framer-motion";
import { testimonials } from "../data/site";
import SectionHeader from "./SectionHeader";

export default function TestimonialSection() {
  return (
    <section className="section-shell py-20">
      <SectionHeader
        eyebrow="Loved locally"
        title="What Dinara customers say"
        description="Trust-building proof points for faster order decisions."
        align="center"
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: index * 0.1 }}
            className="glass-panel p-6"
          >
            <p className="text-base leading-7 text-mocha/75">&ldquo;{testimonial.quote}&rdquo;</p>
            <div className="mt-6">
              <p className="font-semibold text-cocoa">{testimonial.name}</p>
              <p className="text-sm text-caramel">{testimonial.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
