import { getPublishedPosts, getPublishedCategories } from "@/actions/blog-actions";
import { BlogListPage } from "./blog-list-page";

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getPublishedPosts(),
    getPublishedCategories(),
  ]);

  return <BlogListPage posts={posts} categories={categories} />;
}
