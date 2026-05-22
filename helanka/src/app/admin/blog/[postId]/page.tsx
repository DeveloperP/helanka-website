import { requireAdmin } from "@/lib/auth-guard";
import { getAdminBlogPost } from "@/actions/blog-actions";
import { redirect } from "next/navigation";
import { BlogFormClient } from "../blog-form-client";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  await requireAdmin();
  const { postId } = await params;
  const post = await getAdminBlogPost(postId);
  if (!post) redirect("/admin/blog");

  return <BlogFormClient post={post} />;
}
