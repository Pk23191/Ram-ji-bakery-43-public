export default function ProductImage({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: "100%",
        height: "200px",
        objectFit: "cover"
      }}
    />
  );
}
