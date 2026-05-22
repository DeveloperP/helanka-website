import { requireAdmin } from "@/lib/auth-guard";
import { getAdminBlogPosts } from "@/actions/blog-actions";
import { BlogListClient } from "./blog-list-client";

export default async function AdminBlogPage() {
  await requireAdmin();
  const posts = await getAdminBlogPosts();

  return <BlogListClient posts={posts} />;
}
