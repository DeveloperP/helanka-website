const packages = [
  {
    title: "The Wild South",
    duration: "7 Days",
    difficulty: "Moderate",
    price: "$2,400",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvL9qQCZqkuUZZhDFPiuljSOElBzTS-i7kLp90dx9jPIRgvPItqhfxy9613-soZHzobTHli7BjWkH4-Haw9lP45E2wiW9j2dUftl84hUoLQpMhO1LIzUoQRk5nyTAmY78Y-IBlM5Mrog1JBI8zdp86HBVzmlXisZYgFH5lIspaZdstoAxqxQrnPxafv0B8S_p0e8P0tS2KZMFdCj6rUEkqe56zoOq8yXRaQE2XqbrLuXWXGtJVEbnTCZcpKa2KlGrKVElRaZGsohs",
    description: "Yala safari, Mirissa whale watching, and Galle heritage walk.",
  },
  {
    title: "Highland Heritage",
    duration: "5 Days",
    difficulty: "Easy",
    price: "$1,800",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7yFEXyPuNX9h_GbgmSdd2qwI4JGC1uoPb7ulTfAcuU6WQF6HvDWujaf8QEbi-HXIPSi9Ar_221wIJRyI8Oc7J9YbONA7xBcrMWiP3j9sUxtS_xURw4mrwBaIxZ8YFeFDrWujeqMRLL2Z_yQq2sEuX2EIyjhd_ytbtIFiFgLpuMSox6uLPQ4pCNGmRMXN6AjrjBnRZaTcV7N1c8-P2ncWBgCmmQPApVYrL3GlPUK8xxdDNtop4B4tKepr0tLvqmw1IS4_2n1Kc2ko",
    description: "Ella trains, Nuwara Eliya tea estates, and Horton Plains.",
  },
  {
    title: "Ancient Echoes",
    duration: "6 Days",
    difficulty: "Moderate",
    price: "$3,200",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8byS4ur0YLqV8SSm4o61Threszjg0SP-yUsTDvcAY44XGdvHjfYtEmO8xWwdqa3zsomjFqQtUBs_9fbsmGchF1ijExKBw3GDStxTXIWmBvXvbxDv6CANoGNG0bkoO87RTXHyD4ukJA_5T3DRM_YVekWrf7hsdtWPwQcUDQCJMcTQlypRC92CKbLkIXkqjXuz_5A9pFehLUBwX50r4bRM-xaJmnv9KbcgYdGPhVhfT-gJNnbo0aSzlHkBhns9h19oZzn9JNx2vi6g",
    description: "Sigiriya, Dambulla, Polonnaruwa, and Kandy Temple.",
  },
  {
    title: "The Grand Tour",
    duration: "14 Days",
    difficulty: "All Levels",
    price: "$5,500",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDiJOIXdRp0l7rGwM8eiDyKXWXVHTHtciFZ-YXdZS3Cd9Uo-jvjFfC09J1WRQpYmbcO1BEtchv6CUXXxjYi0Pj8O9AFnXORA-4OY6xP1sCWn2N6cEUxSy-Eggf1cODQjozh-4b2OecEaGjoTRnYKY5p2xzfvI7ykfVFCQobSh7YxsSpR8Jz3XPqWXMndy5ipi7S_5kAdrq6RJQjUewrywmX-gNn0HENvBLOT0nNjqBDC3yCoO4EmHmuMhnoLYkVsDUktQR6kRPhP2M",
    description: "The complete Sri Lanka experience from coast to highlands.",
  },
];

export default function FeaturedPackages() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/Featured packages background.png')" }}
      />
      <div className="absolute inset-0 bg-[#020617]/70" />
      <div className="relative z-10 px-5 md:px-20 max-w-[1440px] mx-auto">
      <div className="text-center mb-16">
        <span className="font-[family-name:var(--font-manrope)] text-xs font-semibold text-[#ff9d00] tracking-[0.2em] uppercase block mb-3">
          Curated Journeys
        </span>
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-white mb-4">
          Featured Packages
        </h2>
        <p className="text-[#dac2ad] max-w-lg mx-auto">
          Hand-crafted itineraries designed by our local experts for every kind of traveler.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.title}
            className="group liquid-glass rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
          >
            <div className="relative h-56 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${pkg.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/60 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
                  {pkg.duration}
                </span>
                <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
                  {pkg.difficulty}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-[family-name:var(--font-playfair)] text-xl text-white mb-2">
                {pkg.title}
              </h3>
              <p className="text-sm text-[#dac2ad] mb-4 leading-relaxed">
                {pkg.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-[family-name:var(--font-playfair)] text-2xl text-[#ff9d00]">
                  {pkg.price}
                </span>
                <span className="text-[10px] text-[#dac2ad] uppercase tracking-widest">
                  per person
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
