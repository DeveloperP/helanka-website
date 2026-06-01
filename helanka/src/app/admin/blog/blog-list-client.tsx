"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BlogPostListItem } from "@/actions/blog-actions";
import { deleteBlogPost, togglePublish } from "@/actions/blog-actions";

export function BlogListClient({ posts }: { posts: BlogPostListItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const filtered = useMemo(() => {
    let result = posts;
    if (filter === "published") result = result.filter((p) => p.isPublished);
    if (filter === "draft") result = result.filter((p) => !p.isPublished);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.author.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, search, filter]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const result = await deleteBlogPost(id);
    if ("error" in result) alert(result.error);
    else router.refresh();
  }

  async function handleToggle(id: string) {
    const result = await togglePublish(id);
    if ("error" in result) alert(result.error);
    else router.refresh();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog</h1>
          <p className="text-sm text-slate-500 mt-1">{posts.length} posts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          New Post
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-shadow"
        />
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3 py-2 rounded-lg transition-[background-color,color,box-shadow] capitalize ${
                filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-400">No posts found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-[border-color,box-shadow]"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/blog/${post.id}`} className="hover:text-primary transition-colors">
                    <p className="text-sm font-semibold text-slate-900 truncate">{post.title}</p>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{post.category}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{post.author}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {post.featured && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      Featured
                    </span>
                  )}
                  <button
                    onClick={() => handleToggle(post.id)}
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full transition-colors ${
                      post.isPublished
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {post.isPublished ? "Published" : "Draft"}
                  </button>
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="text-xs text-slate-400 hover:text-slate-700 transition-colors px-2 py-1"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
