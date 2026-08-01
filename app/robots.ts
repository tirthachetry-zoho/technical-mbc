export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://toppersnotes.digital";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/dashboard/", "/cart", "/wishlist"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}