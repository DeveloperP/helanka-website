"use client";

const stats = [
  { value: "8+", label: "Years of Experience" },
  { value: "2,500+", label: "Happy Travelers" },
  { value: "50+", label: "Curated Itineraries" },
  { value: "98%", label: "Satisfaction Rate" },
];

const values = [
  {
    title: "Authentic Experiences",
    description:
      "We go beyond tourist trails to connect you with the real Sri Lanka — its people, traditions, and hidden gems that only locals know.",
  },
  {
    title: "Personalized Service",
    description:
      "No two travelers are alike. Every itinerary is handcrafted by our specialists to match your pace, interests, and travel style.",
  },
  {
    title: "Responsible Travel",
    description:
      "We partner with local communities, eco-lodges, and conservation projects to ensure tourism benefits the places and people we visit.",
  },
  {
    title: "Seamless Journeys",
    description:
      "From airport pickup to your last sunset, every detail is handled — so you can focus on making memories, not managing logistics.",
  },
];

const team = [
  {
    name: "Kasun Perera",
    role: "Founder & Lead Travel Designer",
    bio: "Born in Kandy, Kasun has spent over a decade crafting journeys that reveal Sri Lanka's soul to the world.",
  },
  {
    name: "Dilini Fernando",
    role: "Head of Guest Relations",
    bio: "Dilini ensures every guest feels like family, coordinating every touchpoint from first inquiry to fond farewell.",
  },
  {
    name: "Ravindu Silva",
    role: "Adventure Specialist",
    bio: "A certified naturalist and trek leader, Ravindu designs wildlife safaris and hiking expeditions across the island.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Ella Nine Arch.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
        <div className="relative z-10 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pb-16">
          <span className="inline-block bg-[#ff9d00] text-[#482900] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Our Story
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl text-white mb-4 max-w-3xl">
            Sri Lanka, Through the Eyes of Those Who Call It Home
          </h1>
          <p className="text-white/60 max-w-lg">
            Helanka Vacations was born from a simple belief — the best way to
            discover a country is through the people who love it most.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#020617] border-y border-white/5">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-[#ff9d00] mb-2">
                  {stat.value}
                </p>
                <p className="text-white/50 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-[#020617] py-20">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-white mb-6">
                From a Passion for Sri Lanka to a Promise to Travelers
              </h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  Helanka Vacations started with a single idea: that Sri Lanka
                  deserves to be experienced, not just visited. Founded by a team
                  of Sri Lankans who grew up exploring every corner of this
                  island, we set out to share the places, flavors, and stories
                  that no guidebook can capture.
                </p>
                <p>
                  What began as curated tours for a handful of friends quickly
                  grew into a full-service travel company. Today, we design
                  bespoke journeys for solo adventurers, couples, families, and
                  groups — each one shaped by deep local knowledge and a genuine
                  love for hospitality.
                </p>
                <p>
                  We don&apos;t do cookie-cutter. Whether it&apos;s a sunrise
                  hike to Adam&apos;s Peak, a private cooking class in a
                  grandmother&apos;s kitchen, or a luxury train journey through
                  tea country — every moment is intentional, personal, and
                  unforgettable.
                </p>
              </div>
            </div>
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/Down South Beach.jpeg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/60 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#020617] py-20 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#ff9d00]/10 text-[#ff9d00] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
              What We Stand For
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-white">
              Our Values
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#ff9d00]/30 transition-colors"
              >
                <span className="font-[family-name:var(--font-playfair)] text-5xl text-[#ff9d00]/20 mb-4 block">
                  0{i + 1}
                </span>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-white mb-3">
                  {v.title}
                </h3>
                <p className="text-white/50 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-[#020617] py-20 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#ff9d00]/10 text-[#ff9d00] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
              The People Behind Your Journey
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-white">
              Meet the Team
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#ff9d00]/30 transition-colors"
              >
                <div className="h-48 bg-gradient-to-br from-[#ff9d00]/20 to-[#ff9d00]/5 flex items-center justify-center">
                  <span className="font-[family-name:var(--font-playfair)] text-6xl text-[#ff9d00]/30">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[#ff9d00] text-sm mb-3">{member.role}</p>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MendisOne — Parent Company */}
      <section className="bg-[#020617] py-20 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block bg-[#ff9d00]/10 text-[#ff9d00] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
                Part of Something Bigger
              </span>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-white mb-6">
                A MendisOne Company
              </h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  Helanka Vacations is proudly a part of{" "}
                  <span className="text-white font-medium">MendisOne Pvt Ltd</span>
                  , a diversified Sri Lankan business group pioneering trust,
                  innovation, and ethical excellence across shipping, trading,
                  logistics, and leisure.
                </p>
                <p>
                  Under the MendisOne umbrella, we leverage decades of
                  operational expertise and a deep commitment to service quality.
                  Our parent company&apos;s philosophy —{" "}
                  <span className="italic text-white/80">
                    &ldquo;Bearing, Forward. Heading, Tomorrow.&rdquo;
                  </span>{" "}
                  — drives everything we do at Helanka, from the journeys we
                  design to the relationships we build.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  name: "Helanka Vacations",
                  description:
                    "Gateway to unforgettable experiences — curated travel journeys and MICE tourism across Sri Lanka.",
                  active: true,
                },
                {
                  name: "Premium Trading & Logistics",
                  description:
                    "Partner in global trade — customs brokerage, supply chain management, and swift logistics solutions.",
                  active: false,
                },
                {
                  name: "Prudential Shipping",
                  description:
                    "One of Sri Lanka's fast-growing shipping agencies — maritime operations and port services.",
                  active: false,
                },
              ].map((company) => (
                <div
                  key={company.name}
                  className={`rounded-2xl p-6 border transition-colors ${
                    company.active
                      ? "bg-[#ff9d00]/10 border-[#ff9d00]/30"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {company.active && (
                      <span className="w-2 h-2 rounded-full bg-[#ff9d00]" />
                    )}
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg text-white">
                      {company.name}
                    </h3>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {company.description}
                  </p>
                </div>
              ))}

              <a
                href="https://mendisone.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#ff9d00] hover:text-[#e68d00] transition-colors text-sm font-medium mt-2"
              >
                Visit MendisOne
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#020617] py-20 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-white mb-4">
            Ready to Explore Sri Lanka?
          </h2>
          <p className="text-white/50 max-w-lg mx-auto mb-8">
            Let our team design a journey that&apos;s uniquely yours. No
            templates, no compromises — just your dream trip, handled.
          </p>
          <a
            href="/build"
            className="inline-block bg-[#ff9d00] text-[#482900] px-8 py-3 rounded-lg text-base font-semibold hover:bg-[#e68d00] transition-colors"
          >
            Start Planning
          </a>
        </div>
      </section>
    </>
  );
}
