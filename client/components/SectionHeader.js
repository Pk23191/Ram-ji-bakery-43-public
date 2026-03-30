export default function SectionHeader({ eyebrow, title, description, align = "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-caramel">{eyebrow}</p>
      ) : null}
      <h2 className="section-title mt-3">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-mocha/70">{description}</p> : null}
    </div>
  );
}
