import {
  ShoppingBag,
  Grid3X3,
  Info,
  ShoppingCart,
  CreditCard,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: ShoppingBag,
    title: "Easy Shopping",
    description: "Browse beauty products easily and discover your next favorite.",
  },
  {
    icon: Grid3X3,
    title: "Category-Based Shopping",
    description:
      "Find products quickly through Face, Lips, Eyes and Skincare menus, or with live search.",
  },
  {
    icon: Info,
    title: "Product Details",
    description:
      "View descriptions, prices, discounts and availability before you buy.",
  },
  {
    icon: ShoppingCart,
    title: "Smart Cart",
    description:
      "Add products, adjust quantities and manage your selections, even before you log in.",
  },
  {
    icon: CreditCard,
    title: "Secure Checkout",
    description:
      "Pay with Khalti or choose Cash on Delivery through a simple, smooth checkout.",
  },
  {
    icon: Sparkles,
    title: "Personalized Experience",
    description:
      "Smart recommendations and our Lumi assistant help you find products that go well together.",
  },
];

function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-rose-50 px-6 py-20 lg:px-10">
      {/* Soft background glows */}
      <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-amber-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-600">
            Our Features
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            A simpler way to explore beauty.
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-500 sm:text-base">
            Everything is designed to make discovering, choosing and purchasing
            your favorite beauty products easier.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-rose-100 bg-white/80 p-8 shadow-sm backdrop-blur transition duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-200/60"
              >
                {/* Big faint number */}
                <span className="absolute right-6 top-4 text-7xl font-bold text-rose-50 transition duration-500 group-hover:text-rose-100">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-400 text-white shadow-lg shadow-rose-300/50 transition duration-500 group-hover:rotate-6 group-hover:scale-110">
                  <Icon size={24} strokeWidth={1.8} />
                </div>

                <h3 className="relative mt-6 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>

                <p className="relative mt-2 text-sm leading-6 text-gray-500">
                  {feature.description}
                </p>

                {/* Accent line that grows on hover */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-rose-500 to-amber-300 transition-all duration-500 group-hover:w-full" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;