import { requireAdmin } from "@/lib/auth-guard";
import { BlogFormClient } from "../blog-form-client";

export default async function NewBlogPostPage() {
  await requireAdmin();
  return <BlogFormClient post={null} />;
}
