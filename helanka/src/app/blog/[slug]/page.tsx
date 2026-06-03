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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="relative z-10 w-full px-6 sm:px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pb-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-on-surface-muted hover:text-on-surface transition-colors mb-6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            All Posts
          </Link>
          <span className="inline-block bg-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            {post.category}
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl text-on-surface mb-6 max-w-3xl">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-on-surface-muted">
            <span>{post.author}</span>
            <span className="w-1 h-1 rounded-full bg-on-surface-subtle" />
            <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</span>
            <span className="w-1 h-1 rounded-full bg-on-surface-subtle" />
            <span>{post.readTime} read</span>
          </div>
        </div>
      </section>

      <article className="py-16 px-6 sm:px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto">
        <div
          className="prose prose-invert prose-lg max-w-3xl mx-auto prose-p:text-on-surface-muted prose-p:leading-relaxed prose-h2:text-on-surface prose-h3:text-on-surface prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {related.length > 0 && (
        <section className="py-16 px-6 sm:px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto border-t border-outline">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-on-surface mb-10">
            More in {post.category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="group flex gap-4 sm:gap-6 items-start"
              >
                <div className="shrink-0 w-24 sm:w-32 h-20 sm:h-24 rounded-xl overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundImage: `url('${r.coverImage}')`, transitionTimingFunction: "var(--ease-out)" }}
                  />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg text-on-surface group-hover:text-primary transition-colors mb-1">
                    {r.title}
                  </h3>
                  <p className="text-sm text-on-surface-muted line-clamp-2">{r.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
