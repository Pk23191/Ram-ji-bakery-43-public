import Seo from "../components/Seo";
import SectionHeader from "../components/SectionHeader";
import useOwnerContact from "../hooks/useOwnerContact";

export default function ContactPage() {
  const { phone, email } = useOwnerContact();

  return (
    <>
      <Seo
        title="Contact"
        description="Contact Ramji Bakery in Dinara for custom cake orders, daily fresh bakes and delivery support."
        path="/contact"
      />
      <section className="section-shell py-12">
        <SectionHeader
          eyebrow="Contact us"
          title="Reach the bakery team fast"
          description="Phone, map and form-driven inquiries for celebrations and daily orders."
        />
        <div className="mt-10 grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="glass-panel p-6">
            <div className="space-y-4 text-sm leading-7 text-mocha/70">
              <p><span className="font-semibold text-cocoa">Phone:</span> {phone}</p>
              <p><span className="font-semibold text-cocoa">Email:</span> {email}</p>
              <p><span className="font-semibold text-cocoa">Address:</span> Main Market Road, Dinara, Madhya Pradesh, India</p>
              <p><span className="font-semibold text-cocoa">Hours:</span> 7:00 AM to 9:00 PM</p>
            </div>
            <form className="mt-6 space-y-4">
              <input className="soft-input" placeholder="Your name" />
              <input className="soft-input" placeholder="Phone number" />
              <textarea className="soft-input" rows="5" placeholder="Tell us about your order" />
              <button type="button" className="btn-primary w-full">
                Send Inquiry
              </button>
            </form>
          </div>
          <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white/70 shadow-soft">
            <iframe
              title="Ramji Bakery Map"
              src="https://www.google.com/maps?q=Dinara%20Madhya%20Pradesh&z=14&output=embed"
              className="h-[520px] w-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
