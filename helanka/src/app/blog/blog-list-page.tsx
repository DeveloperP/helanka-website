"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PublicBlogPost } from "@/actions/blog-actions";

type PostSummary = Omit<PublicBlogPost, "content">;

export function BlogListPage({
  posts,
  categories,
}: {
  posts: PostSummary[];
  categories: string[];
}) {
  const allCategories = ["All", ...categories];
  const [filter, setFilter] = useState("All");
  const featured = posts.filter((p) => p.featured);
  const filtered = filter === "All" ? posts : posts.filter((p) => p.category === filter);

  return (
    <>
      {featured[0] && (
        <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${featured[0].coverImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
          <div className="relative z-10 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pb-16">
            <span className="inline-block bg-[#ff9d00] text-[#482900] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
              Featured
            </span>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl text-white mb-4 max-w-3xl">
              <Link href={`/blog/${featured[0].slug}`} className="hover:text-[#ff9d00] transition-colors">
                {featured[0].title}
              </Link>
            </h1>
            <p className="text-white/60 max-w-lg mb-6">{featured[0].excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-white/40">
              <span>{featured[0].author}</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>{featured[0].publishedAt ? new Date(featured[0].publishedAt).toLocaleDateString() : ""}</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>{featured[0].readTime} read</span>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto">
        <div className="flex gap-4 mb-12 overflow-x-auto scrollbar-hide pb-2">
          {allCategories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "text-sm whitespace-nowrap px-4 py-2 rounded-full border transition-all font-[family-name:var(--font-manrope)] font-semibold tracking-wide",
                filter === c
                  ? "border-[#ff9d00] text-[#ff9d00] bg-[#ff9d00]/10"
                  : "border-white/10 text-[#dac2ad] hover:border-white/30 hover:text-white"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <div className="relative h-56 rounded-2xl overflow-hidden mb-5">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${post.coverImage}')` }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>
              <h2 className="font-[family-name:var(--font-playfair)] text-xl text-white mb-2 group-hover:text-[#ff9d00] transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-[#dac2ad] line-clamp-2 mb-3">{post.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-white/40">
                <span>{post.author}</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>{post.readTime} read</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
