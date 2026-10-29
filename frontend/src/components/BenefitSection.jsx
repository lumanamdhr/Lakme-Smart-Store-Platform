import { Truck, ShieldCheck, Sparkles, Headphones } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Get your beauty essentials delivered conveniently to your doorstep.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Products",
    description: "Explore carefully selected makeup and skincare essentials.",
  },
  {
    icon: Sparkles,
    title: "Beauty Essentials",
    description: "Find everyday products across face, lips, eyes and skincare.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "Ask Lumi, our shopping assistant, to find products and check your order.",
  },
];

function BenefitsSection() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 lg:px-10">
      {/* Soft pink glows */}
      <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-rose-100/70 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-600">
            Why Lakmé
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            A Better Beauty Experience
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
            Everything you need for a smoother and more enjoyable beauty
            shopping experience.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="group rounded-3xl border border-rose-100 bg-gradient-to-b from-rose-50 to-white p-8 text-center shadow-sm transition duration-500 hover:-translate-y-2 hover:border-rose-200 hover:shadow-2xl hover:shadow-rose-200/60"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 ring-1 ring-rose-200 transition duration-500 group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-rose-300/50">
                  <Icon size={26} strokeWidth={1.7} />
                </div>

                <h3 className="mt-6 text-base font-semibold text-gray-900">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;