import {
  ArrowRight,
} from "lucide-react";


function CategorySection({ onCategoryClick }) {
  const categories = [
    {
      name: "Face",
      description: "Foundations, primers, powders and blushes.",
       image:
      "http://127.0.0.1:8000/static/products/matte-foundation.webp",
    },
    {
      name: "Lips",
      description: "Lipsticks, glosses and liquid lip colors.",
      image:
      "http://127.0.0.1:8000/static/products/powerplay-lipstick.png",
    },
    {
      name: "Eyes",
      description: "Kajal, eyeliner and mascara essentials.",
      image:
      "http://127.0.0.1:8000/static/products/eyeconic-eyeliner.webp",
    },
    {
      name: "Skincare",
      description: "Serums, moisturizers and sun protection.",
      image:
      "http://127.0.0.1:8000/static/products/lakme-serum.webp",
    },
  ];

  return (
    <section className=" px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Section heading */}
        <div className="mb-12 text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-600">
            Explore Beauty
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Shop by Category
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            Discover your favorite beauty essentials across makeup and
            skincare.
          </p>

        </div>

        {/* Category cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => onCategoryClick(category.name)}
              className="group relative h-[390px] cursor-pointer overflow-hidden rounded-3xl bg-gray-900 text-left shadow-md transition duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >

              {/* Category image */}
              <img
                src={category.image}
                alt={`${category.name} beauty products`}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

              {/* Overall image overlay */}
              <div className="absolute inset-0 bg-black/15 transition duration-500 group-hover:bg-black/25" />

              {/* Bottom gradient for readable text */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

              {/* Card content */}
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">

                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-200">
                  Collection
                </p>

                <h3 className="mt-2 text-2xl font-semibold">
                  {category.name}
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-white/80">
                  {category.description}
                </p>

                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                  Explore {category.name}

                  <ArrowRight
                    size={17}
                    className="transition duration-300 group-hover:translate-x-1"
                  />
                </div>

              </div>

            </button>
          ))}

        </div>

      </div>
    </section>
  );
}

export default CategorySection;