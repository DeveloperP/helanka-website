const testimonials = [
  {
    quote:
      "Helanka made our honeymoon absolutely magical. From the train ride to Ella to watching elephants at Yala, every detail was perfect.",
    author: "Sarah & James",
    origin: "London, UK",
  },
  {
    quote:
      "The custom itinerary was exactly what we needed. Our guide knew every hidden gem. We're already planning our return trip.",
    author: "Markus Weber",
    origin: "Berlin, Germany",
  },
  {
    quote:
      "Travelling with two kids seemed daunting, but Helanka handled everything. The kids still talk about the safari every week.",
    author: "Priya Nair",
    origin: "Mumbai, India",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-slate-950 py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Traveller Stories
          </p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            What Our Guests Say
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="rounded-xl border border-white/5 bg-white/5 p-8"
            >
              {/* Quote mark */}
              <svg className="mb-4 h-8 w-8 text-emerald-500/50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
              </svg>
              <blockquote className="mb-6 text-base leading-relaxed text-slate-300">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div>
                <p className="font-semibold text-white">{t.author}</p>
                <p className="text-sm text-slate-500">{t.origin}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
