import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const slides = [
  {
    id: 1,
    eyebrow: "EVERYDAY BEAUTY",
    title: "Beauty that speaks for you.",
    description:
      "Discover makeup and skincare essentials designed to complement your everyday look.",
    button: "Shop All",
    category: "All",
    image: "/hero/lakmeslide1.jpg",
    ratio: "aspect-[625/345]", // each photo's real shape, so nothing gets cropped
    background: "from-rose-100 via-pink-50 to-amber-50",
  },
  {
    id: 2,
    eyebrow: "LIP ESSENTIALS",
    title: "Make every look count.",
    description:
      "Find your perfect lip shades, finishes and everyday beauty favorites.",
    button: "Explore Lips",
    category: "Lips",
    image: "/hero/lakmeslide2.jpg",
    ratio: "aspect-square",
    background: "from-pink-200 via-rose-100 to-rose-50",
  },
  {
    id: 3,
    eyebrow: "FACE MAKEUP",
    title: "Find your perfect shade.",
    description:
      "Discover complexion essentials to complement your skin tone.",
    button: "Shop Face",
    category: "Face",
    image: "/hero/lakmeslide3.jpg",
    ratio: "aspect-[485/410]",
    background: "from-stone-200 via-rose-50 to-pink-100",
  },
  {
    id: 4,
    eyebrow: "SKINCARE",
    title: "Care that completes your routine.",
    description:
      "Discover skincare essentials for a fresh and comfortable everyday routine.",
    button: "Shop Skincare",
    category: "Skincare",
    image: "/hero/lakmeslide4.jpg",
    ratio: "aspect-[452/360]",
    background: "from-amber-100 via-orange-50 to-rose-50",
  },
];

function Hero({ onCategoryClick }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  // Change slide every 6 seconds, but not while the mouse is over the hero
  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => {
      setCurrentSlide((previous) =>
        previous === slides.length - 1 ? 0 : previous + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, [paused]);

  const nextSlide = () =>
    setCurrentSlide((p) => (p === slides.length - 1 ? 0 : p + 1));

  const previousSlide = () =>
    setCurrentSlide((p) => (p === 0 ? slides.length - 1 : p - 1));

  const handleButtonClick = (category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    } else {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="relative h-[620px] overflow-hidden md:h-[540px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, index) => {
        const active = index === currentSlide;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-gradient-to-br ${slide.background} transition-opacity duration-700 ${
              active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {/* Soft decorative glows */}
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/60 blur-3xl" />
            <div className="absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-rose-200/50 blur-3xl" />

            <div className="relative z-10 mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-4 px-14 sm:px-20 md:grid-cols-2 lg:px-16 xl:px-20">

              {/* Text */}
              <div>
                <p
                  className={`mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-rose-600 sm:text-sm ${
                    active ? "hero-rise" : ""
                  }`}
                >
                  {slide.eyebrow}
                </p>

                <h1
                  className={`max-w-lg text-4xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl ${
                    active ? "hero-rise" : ""
                  }`}
                  style={{ animationDelay: "0.15s" }}
                >
                  {slide.title}
                </h1>

                <p
                  className={`mt-5 max-w-lg text-base leading-7 text-gray-600 sm:text-lg ${
                    active ? "hero-rise" : ""
                  }`}
                  style={{ animationDelay: "0.3s" }}
                >
                  {slide.description}
                </p>

                <button
                  onClick={() => handleButtonClick(slide.category)}
                  className={`mt-7 inline-flex cursor-pointer items-center gap-3 rounded-full bg-gray-900 px-7 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-rose-600 ${
                    active ? "hero-rise" : ""
                  }`}
                  style={{ animationDelay: "0.45s" }}
                >
                  {slide.button}
                  <ArrowRight size={17} />
                </button>
              </div>

              {/* Photo card */}
              <div className="flex items-center justify-center">
                <div
                  className={`animate-float relative h-40 md:h-auto md:w-full md:max-w-[440px] ${slide.ratio}`}
                >
                  {/* Tilted pastel plate behind the photo */}
                  <div className="absolute inset-0 rotate-3 rounded-3xl bg-gradient-to-br from-rose-300/60 to-amber-200/60" />

                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 h-full w-full rounded-3xl object-cover shadow-2xl shadow-rose-300/50 ring-4 ring-white/80"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Previous / next */}
      <button
        onClick={previousSlide}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-20 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white/70 p-2.5 text-gray-800 backdrop-blur-sm transition hover:bg-gray-900 hover:text-white sm:left-7 sm:p-3"
      >
        <ChevronLeft size={24} strokeWidth={1.8} />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white/70 p-2.5 text-gray-800 backdrop-blur-sm transition hover:bg-gray-900 hover:text-white sm:right-7 sm:p-3"
      >
        <ChevronRight size={24} strokeWidth={1.8} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2.5 cursor-pointer rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-8 bg-rose-600"
                : "w-2.5 bg-gray-400/60 hover:bg-gray-500"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default Hero;