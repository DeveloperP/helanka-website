import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug, getPublishedPosts } from "@/actions/blog-actions";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  if (!db) return [];
  const posts = await db.blogPost.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getPublishedPosts();
  const related = allPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 2);

  return (
    <>
      <section className="relative h-[60vh] min-h-[450px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${post.coverImage}')` }}
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
            <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>{post.readTime} read</span>
          </div>
        </div>
      </section>

      <article className="py-16 px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto">
        <div
          className="prose prose-invert prose-lg max-w-3xl mx-auto prose-headings:font-[family-name:var(--font-manrope)] prose-p:text-[#dac2ad] prose-p:leading-relaxed prose-h2:text-white prose-h3:text-white prose-a:text-[#ff9d00] prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

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
                    style={{ backgroundImage: `url('${r.coverImage}')` }}
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
