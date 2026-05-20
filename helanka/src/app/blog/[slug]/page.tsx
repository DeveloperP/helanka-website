import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPostBySlug } from "@/lib/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = posts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 2);

  const paragraphs = post.body.split("\n\n");

  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[450px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${post.image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
        <div className="relative z-10 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pb-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            All Posts
          </Link>
          <span className="inline-block bg-[#ff9d00]/20 text-[#ff9d00] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            {post.category}
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl text-white mb-6 max-w-3xl">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-white/50">
            <span>{post.author}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>{post.date}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>{post.readTime} read</span>
          </div>
        </div>
      </section>

      {/* Article body */}
      <article className="py-16 px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {paragraphs.map((p, i) => {
            if (p.startsWith("**") && p.includes(":**")) {
              const [heading, ...rest] = p.split(":**");
              const label = heading.replace(/^\*\*/, "");
              const content = rest.join(":**").replace(/\*\*$/, "");
              return (
                <div key={i}>
                  <h3 className="font-[family-name:var(--font-manrope)] text-lg font-bold text-white mb-2">
                    {label}
                  </h3>
                  <p className="text-[#dac2ad] leading-relaxed">{content}</p>
                </div>
              );
            }
            return (
              <p key={i} className="text-[#dac2ad] leading-relaxed text-lg">
                {p}
              </p>
            );
          })}
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-16 px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto border-t border-white/10">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-white mb-10">
            More in {post.category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="group flex gap-6 items-start"
              >
                <div className="shrink-0 w-32 h-24 rounded-xl overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundImage: `url('${r.image}')` }}
                  />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg text-white group-hover:text-[#ff9d00] transition-colors mb-1">
                    {r.title}
                  </h3>
                  <p className="text-sm text-[#dac2ad] line-clamp-2">{r.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
