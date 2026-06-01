"use client";

import { useScrollReveal, useStaggerReveal } from "@/hooks/use-scroll-reveal";

const stats = [
  { value: "8+", label: "Years in Sri Lanka" },
  { value: "2,500+", label: "Travelers Hosted" },
  { value: "50+", label: "Designed Itineraries" },
  { value: "98%", label: "Would Recommend Us" },
];

const values = [
  {
    title: "Real Connections",
    description:
      "You will eat with local families, learn about tea farming from the people who do it, and see why places matter to the people who live there.",
  },
  {
    title: "Local Expertise",
    description:
      "Our guides live in the regions they show you. They know which trains to catch, which restaurants are worth your time, and where most visitors never go.",
  },
  {
    title: "Responsible Travel",
    description:
      "We partner with conservation projects and local communities. We limit group sizes, support small businesses, and make sure our presence adds value.",
  },
  {
    title: "No Rushing",
    description:
      "We build itineraries that give you time to actually experience places. Long breakfasts, afternoon tea, real conversations. Not boxes to tick.",
  },
];

const team = [
  {
    name: "Kasun Perera",
    role: "Founder and Head of Operations",
    bio: "Kasun is from Kandy. He spent years taking friends on trips across the island before turning it into a business. He still designs every itinerary personally.",
  },
  {
    name: "Dilini Wickramasinghe",
    role: "Guest Relations Manager",
    bio: "Dilini handles first contact. She is the one you email first and the voice on the other end of the phone. She makes sure nothing gets missed.",
  },
  {
    name: "Nimal Silva",
    role: "Wildlife and Adventure Guide",
    bio: "Nimal is a trained naturalist who grew up near Yala. He leads safaris and treks across the island and can spot birds you would walk right past.",
  },
];

export default function AboutPage() {
  const heroRef = useScrollReveal<HTMLDivElement>();
  const statsRef = useStaggerReveal<HTMLDivElement>();
  const storyRef = useScrollReveal<HTMLDivElement>();
  const storyImgRef = useScrollReveal<HTMLDivElement>();
  const valuesHeadRef = useScrollReveal<HTMLDivElement>();
  const valuesGridRef = useStaggerReveal<HTMLDivElement>();
  const teamHeadRef = useScrollReveal<HTMLDivElement>();
  const teamGridRef = useStaggerReveal<HTMLDivElement>();
  const parentRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/public-ella-nine-arch.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div ref={heroRef} className="reveal relative z-10 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pb-16">
          <span className="inline-block bg-primary text-on-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Our Story
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl text-on-surface mb-4 max-w-3xl">
            We Live Here. That is the Difference.
          </h1>
          <p className="text-on-surface-muted max-w-lg">
            Helanka Vacations was built by Sri Lankans who got tired of watching visitors miss the real island. We know every road, every guide, and every good spot to eat.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-background border-y border-outline">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32 py-12">
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} data-stagger className="text-center">
                <p className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-primary mb-2">
                  {stat.value}
                </p>
                <p className="text-on-surface-muted text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-background py-20">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div ref={storyRef} className="reveal">
              <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl text-on-surface mb-6">
                How We Started
              </h2>
              <div className="space-y-4 text-on-surface-muted leading-relaxed">
                <p>
                  Helanka Vacations started because the standard tour felt wrong. Hit five places in five days, take photos, leave. We wanted to show people the Sri Lanka we actually know.
                </p>
                <p>
                  We are a small team based in Rajagiriya, Colombo, operating under MendisOne Pvt Ltd. We work with local guides, homestays, family restaurants, and fishing communities across the island. When you book with us, the money stays in Sri Lanka.
                </p>
                <p>
                  Over the past eight years, we have sent thousands of travelers through tea estates, into national parks, up mountains, and into home kitchens. Not because we are selling an experience. Because that is how you actually get to know a place.
                </p>
              </div>
            </div>
            <div ref={storyImgRef} className="reveal relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/public-down-south-beach.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-background py-20 border-t border-outline">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32">
          <div ref={valuesHeadRef} className="reveal text-center mb-16">
            <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
              How We Work
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl text-on-surface">
              Our Values
            </h2>
          </div>
          <div ref={valuesGridRef} className="grid md:grid-cols-2 gap-8">
            {values.map((v, i) => (
              <div
                key={v.title}
                data-stagger
                className="surface-card rounded-2xl p-8 hover:border-primary/30 transition-colors"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <span className="font-[family-name:var(--font-display)] text-5xl text-primary/20 mb-4 block">
                  0{i + 1}
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-xl text-on-surface mb-3">
                  {v.title}
                </h3>
                <p className="text-on-surface-muted leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-background py-20 border-t border-outline">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32">
          <div ref={teamHeadRef} className="reveal text-center mb-16">
            <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
              The People You Will Meet
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl text-on-surface">
              Meet the Team
            </h2>
          </div>
          <div ref={teamGridRef} className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                data-stagger
                className="surface-card rounded-2xl overflow-hidden hover:border-primary/30 transition-colors"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="font-[family-name:var(--font-display)] text-6xl text-primary/30">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-[family-name:var(--font-display)] text-lg text-on-surface mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary text-sm mb-3">{member.role}</p>
                  <p className="text-on-surface-muted text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MendisOne - Parent Company */}
      <section className="bg-background py-20 border-t border-outline">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32">
          <div ref={parentRef} className="reveal grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
                Part of Something Bigger
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl text-on-surface mb-6">
                A MendisOne Company
              </h2>
              <div className="space-y-4 text-on-surface-muted leading-relaxed">
                <p>
                  Helanka Vacations is part of{" "}
                  <span className="text-on-surface font-medium">MendisOne Pvt Ltd</span>
                  , a Sri Lankan business group with operations in shipping, trading, logistics, and leisure.
                </p>
                <p>
                  Our parent company has been operating for decades, and their approach to service and reliability runs through everything we do at Helanka. From the trips we plan to the relationships we build with our guests.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  name: "Helanka Vacations",
                  description:
                    "Custom travel and MICE tourism across Sri Lanka. Holiday packages, corporate events, and group tours.",
                  active: true,
                },
                {
                  name: "Premium Trading & Logistics",
                  description:
                    "Global trade, customs brokerage, and supply chain management.",
                  active: false,
                },
                {
                  name: "Prudential Shipping",
                  description:
                    "One of Sri Lanka's growing shipping agencies with maritime operations and port services.",
                  active: false,
                },
              ].map((company) => (
                <div
                  key={company.name}
                  className={`rounded-2xl p-6 border transition-colors ${
                    company.active
                      ? "bg-primary/10 border-primary/30"
                      : "surface-card hover:border-outline-hover"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {company.active && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                    <h3 className="font-[family-name:var(--font-display)] text-lg text-on-surface">
                      {company.name}
                    </h3>
                  </div>
                  <p className="text-on-surface-muted text-sm leading-relaxed">
                    {company.description}
                  </p>
                </div>
              ))}

              <a
                href="https://mendisone.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors text-sm font-medium mt-2"
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
      <section className="bg-background py-20 border-t border-outline">
        <div ref={ctaRef} className="reveal max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl text-on-surface mb-4">
            Want to See Sri Lanka?
          </h2>
          <p className="text-on-surface-muted max-w-lg mx-auto mb-8">
            Let our team put together a trip that fits what you actually want. No templates, no compromises. Just tell us your dates and interests.
          </p>
          <a
            href="/build"
            className="pressable inline-block bg-primary text-on-primary px-8 py-3 rounded-lg text-base font-semibold hover:brightness-110 transition-all"
          >
            Start Planning
          </a>
        </div>
      </section>
    </>
  );
}
