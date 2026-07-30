import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/account/", "/quote/", "/login", "/register"],
      },
    ],
    sitemap: "https://helanka.co/sitemap.xml",
    host: "https://helanka.co",
  };
}
