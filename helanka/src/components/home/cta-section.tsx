import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="py-24 px-5 md:px-20">
      <div className="max-w-[1440px] mx-auto liquid-glass rounded-3xl p-12 md:p-20 text-center">
        <span className="font-[family-name:var(--font-manrope)] text-xs font-semibold text-[#ff9d00] tracking-[0.2em] uppercase block mb-4">
          Let's Talk
        </span>
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl text-white mb-6 max-w-3xl mx-auto leading-tight">
          Ready to Plan Your Trip?
        </h2>
        <p className="text-lg text-[#dac2ad] max-w-xl mx-auto mb-10">
          Tell us where you want to go and what you want to do. We will put the rest together. Free consultation, no pressure.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="bg-[#ff9d00] text-[#482900] px-12 py-5 text-xs font-bold tracking-[0.1em] uppercase hover:bg-[#e68d00] transition-all hover:scale-105 active:scale-95 rounded-lg">
            Sign In to Start
          </Link>
          <Link href="/packages" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-5 text-xs font-bold tracking-[0.1em] uppercase hover:bg-white/20 transition-all rounded-lg">
            Browse Packages
          </Link>
        </div>
      </div>
    </section>
  );
}
