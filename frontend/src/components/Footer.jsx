import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
} from "react-icons/fa";

function Footer({ onNavigate }) {
  return (
    <footer className="border-t-4 border-rose-500 bg-gray-900 text-white">

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>

            <h2 className="text-2xl font-semibold tracking-[0.2em]">
              LAKMÉ
            </h2>

            <p className="mt-5 max-w-xs text-sm leading-7 text-white/60">
              Discover makeup and skincare essentials designed to
              complement your everyday beauty routine.
            </p>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-3">

            <a
              href="#"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-gray-900"
            >
              <FaInstagram size={17} />
            </a>

            <a
              href="#"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-gray-900"
            >
              <FaFacebookF size={16} />
            </a>

            <a
              href="#"
              aria-label="YouTube"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-gray-900"
            >
              <FaYoutube size={17} />
            </a>

          </div>

          </div>


          {/* Quick Links */}
          <div>

            <h3 className="text-sm font-semibold uppercase tracking-[0.2em]">
              Quick Links
            </h3>

            <div className="mt-5 space-y-3">

              <button
                onClick={() => onNavigate("home")}
                className="block cursor-pointer text-sm text-white/60 transition hover:text-white"
              >
                Home
              </button>

              <button
                onClick={() => onNavigate("shop")}
                className="block cursor-pointer text-sm text-white/60 transition hover:text-white"
              >
                Shop
              </button>

              <button
                onClick={() => onNavigate("categories")}
                className="block cursor-pointer text-sm text-white/60 transition hover:text-white"
              >
                Categories
              </button>

              <button
                onClick={() => onNavigate("features")}
                className="block cursor-pointer text-sm text-white/60 transition hover:text-white"
              >
                Features
              </button>

             {/**   <button
                onClick={() => onNavigate("about")}
                className="block cursor-pointer text-sm text-white/60 transition hover:text-white"
              >
                About
              </button>
              */}
              
            </div>

          </div>


          {/* Categories */}
          <div>

            <h3 className="text-sm font-semibold uppercase tracking-[0.2em]">
              Shop
            </h3>

            <div className="mt-5 space-y-3">

              <button
                onClick={() => onNavigate("shop")}
                className="block cursor-pointer text-sm text-white/60 transition hover:text-white"
              >
                Face
              </button>

              <button
                onClick={() => onNavigate("shop")}
                className="block cursor-pointer text-sm text-white/60 transition hover:text-white"
              >
                Lips
              </button>

              <button
                onClick={() => onNavigate("shop")}
                className="block cursor-pointer text-sm text-white/60 transition hover:text-white"
              >
                Eyes
              </button>

              <button
                onClick={() => onNavigate("shop")}
                className="block cursor-pointer text-sm text-white/60 transition hover:text-white"
              >
                Skincare
              </button>

            </div>

          </div>


          {/* Contact */}
          <div>

            <h3 className="text-sm font-semibold uppercase tracking-[0.2em]">
              Contact
            </h3>

            <div className="mt-5 space-y-4">

              <div className="flex items-start gap-3">

                <Mail
                  size={17}
                  className="mt-0.5 shrink-0 text-rose-300"
                />

                <span className="text-sm text-white/60">
                  LakmeCosmetics@gmail.com
                </span>

              </div>

              <div className="flex items-start gap-3">

                <Phone
                  size={17}
                  className="mt-0.5 shrink-0 text-rose-300"
                />

                <span className="text-sm text-white/60">
                  +977 9860673252
                </span>

              </div>

              <div className="flex items-start gap-3">

                <MapPin
                  size={17}
                  className="mt-0.5 shrink-0 text-rose-300"
                />

                <span className="text-sm text-white/60">
                  Kathmandu, Nepal
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-white/10 pt-6">

          <p className="text-center text-xs text-white/40">
            © 2026 Lakme Smart Store Platform
          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer;