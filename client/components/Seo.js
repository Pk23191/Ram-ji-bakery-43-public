import Head from "next/head";

export default function Seo({ title, description, path = "" }) {
  const fullTitle = `${title} | Ramji Bakery`;
  const url = `https://ramjibakery.example${path}`;
  const image = "https://ramjibakery.example/logo.svg";

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#523122" />
      <link rel="icon" href="/logo.svg" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Ramji Bakery" />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta
        name="keywords"
        content="Ramji Bakery Dinara, bakery in Dinara, cakes in Dinara, custom cakes Madhya Pradesh"
      />
    </Head>
  );
}
