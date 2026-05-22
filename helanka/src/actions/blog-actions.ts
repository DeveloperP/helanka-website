"use server";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  isPublished: boolean;
  featured: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export interface BlogPostDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: string;
  category: string;
  readTime: string;
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getAdminBlogPosts(): Promise<BlogPostListItem[]> {
  await requireAdmin();
  if (!db) return [];

  const posts = await db.blogPost.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      author: true,
      isPublished: true,
      featured: true,
      publishedAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return posts.map((p) => ({
    ...p,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function getAdminBlogPost(id: string): Promise<BlogPostDetail | null> {
  await requireAdmin();
  if (!db) return null;

  const p = await db.blogPost.findUnique({ where: { id } });
  if (!p) return null;

  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    content: p.content,
    excerpt: p.excerpt ?? "",
    coverImage: p.coverImage ?? "",
    author: p.author,
    category: p.category,
    readTime: p.readTime,
    featured: p.featured,
    metaTitle: p.metaTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    isPublished: p.isPublished,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function createBlogPost(data: {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: string;
  category: string;
  readTime: string;
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
}): Promise<{ id: string } | { error: string }> {
  await requireAdmin();
  if (!db) return { error: "Database not connected" };

  const slug = slugify(data.title);
  const existing = await db.blogPost.findUnique({ where: { slug } });
  if (existing) return { error: "A post with this slug already exists" };

  const post = await db.blogPost.create({
    data: {
      ...data,
      slug,
      publishedAt: data.isPublished ? new Date() : null,
    },
  });

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { id: post.id };
}

export async function updateBlogPost(
  id: string,
  data: {
    title: string;
    content: string;
    excerpt: string;
    coverImage: string;
    author: string;
    category: string;
    readTime: string;
    featured: boolean;
    metaTitle: string;
    metaDescription: string;
    isPublished: boolean;
  }
): Promise<{ success: true } | { error: string }> {
  await requireAdmin();
  if (!db) return { error: "Database not connected" };

  const existing = await db.blogPost.findUnique({ where: { id } });
  if (!existing) return { error: "Post not found" };

  const slug = slugify(data.title);
  if (slug !== existing.slug) {
    const conflict = await db.blogPost.findUnique({ where: { slug } });
    if (conflict) return { error: "A post with this slug already exists" };
  }

  const wasPublished = existing.isPublished;
  await db.blogPost.update({
    where: { id },
    data: {
      ...data,
      slug,
      publishedAt: data.isPublished && !wasPublished ? new Date() : existing.publishedAt,
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  return { success: true };
}

export async function deleteBlogPost(id: string): Promise<{ success: true } | { error: string }> {
  await requireAdmin();
  if (!db) return { error: "Database not connected" };

  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) return { error: "Post not found" };

  await db.blogPost.delete({ where: { id } });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin/blog");
  return { success: true };
}

export async function togglePublish(id: string): Promise<{ success: true } | { error: string }> {
  await requireAdmin();
  if (!db) return { error: "Database not connected" };

  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) return { error: "Post not found" };

  await db.blogPost.update({
    where: { id },
    data: {
      isPublished: !post.isPublished,
      publishedAt: !post.isPublished ? new Date() : post.publishedAt,
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin/blog");
  return { success: true };
}

// ─── Public reads (no auth) ─────────────────────────────────────────────

export interface PublicBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  readTime: string;
  featured: boolean;
  publishedAt: string;
  metaTitle: string;
  metaDescription: string;
}

export async function getPublishedPosts(): Promise<Omit<PublicBlogPost, "content">[]> {
  if (!db) return [];

  const posts = await db.blogPost.findMany({
    where: { isPublished: true },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      author: true,
      category: true,
      readTime: true,
      featured: true,
      publishedAt: true,
      metaTitle: true,
      metaDescription: true,
    },
    orderBy: { publishedAt: "desc" },
  });

  return posts.map((p) => ({
    ...p,
    excerpt: p.excerpt ?? "",
    coverImage: p.coverImage ?? "",
    metaTitle: p.metaTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    publishedAt: p.publishedAt?.toISOString() ?? "",
  }));
}

export async function getPublishedPostBySlug(slug: string): Promise<PublicBlogPost | null> {
  if (!db) return null;

  const p = await db.blogPost.findUnique({
    where: { slug },
  });

  if (!p || !p.isPublished) return null;

  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? "",
    content: p.content,
    coverImage: p.coverImage ?? "",
    author: p.author,
    category: p.category,
    readTime: p.readTime,
    featured: p.featured,
    publishedAt: p.publishedAt?.toISOString() ?? "",
    metaTitle: p.metaTitle ?? "",
    metaDescription: p.metaDescription ?? "",
  };
}

export async function getPublishedCategories(): Promise<string[]> {
  if (!db) return [];

  const posts = await db.blogPost.findMany({
    where: { isPublished: true },
    select: { category: true },
    distinct: ["category"],
  });

  return posts.map((p) => p.category);
}
