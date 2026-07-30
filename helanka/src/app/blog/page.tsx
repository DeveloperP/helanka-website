import type { Metadata } from "next";
import { getPublishedPosts, getPublishedCategories } from "@/actions/blog-actions";
import { BlogListPage } from "./blog-list-page";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Sri Lanka travel guides, tips, and stories from the Helanka team. Destination deep-dives, packing lists, cultural insights, and seasonal travel advice.",
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getPublishedPosts(),
    getPublishedCategories(),
  ]);

  return <BlogListPage posts={posts} categories={categories} />;
}
