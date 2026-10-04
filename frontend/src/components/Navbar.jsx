import { useState, useEffect } from "react";
import {
  Search,
  User,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";

/* =========================================================
   CATEGORY MENU
   Each item filters the Shop page by category + name keywords.
   (The database only stores "category", so the sub-items match
   words in the product name. Add/remove items here freely.)
   ========================================================= */
const categoryMenu = [
  {
    name: "Lips",
    items: [
      { label: "Lipstick", keywords: ["lipstick"] },
      { label: "Lip Gloss", keywords: ["gloss"] },
      { label: "Liquid Lip Color", keywords: ["liquid"] },
      { label: "Lip Balm", keywords: ["balm"] },
      { label: "Lip Oil", keywords: ["lip oil"] },
      { label: "Lip Liner", keywords: ["lip liner", "lipliner"] },
    ],
  },
  {
    name: "Face",
    items: [
      { label: "Foundation", keywords: ["foundation"] },
      { label: "Primer", keywords: ["primer"] },
      { label: "Compact & Powder", keywords: ["compact", "powder"] },
      { label: "Blush", keywords: ["blush"] },
      { label: "Concealer", keywords: ["concealer"] },
      { label: "Highlighter", keywords: ["highlighter"] },
    ],
  },
  {
    name: "Eyes",
    items: [
      { label: "Kajal", keywords: ["kajal"] },
      { label: "Eyeliner", keywords: ["eyeliner", "eye liner"] },
      { label: "Mascara", keywords: ["mascara"] },
      { label: "Eyeshadow", keywords: ["eyeshadow", "eye shadow"] },
      { label: "Eyebrow", keywords: ["eyebrow", "brow"] },
    ],
  },
  {
    name: "Skincare",
    items: [
      { label: "Serum", keywords: ["serum"] },
      { label: "Moisturizer", keywords: ["moisturi", "lotion", "cream"] },
      { label: "Sunscreen", keywords: ["sunscreen", "sunscream", "sun expert", "spf"] },
      { label: "Face Wash", keywords: ["face wash", "cleanser"] },
      { label: "Face Mask", keywords: ["mask"] },
    ],
  },
];

function Navbar({ //props that works when clicked
  onAuthClick,
  onCartClick,
  onHomeClick,
  onOpenShop,
  onViewDetails,
  onSearch,
  cartCount,
  isLoggedIn,
  onLogout,
  searchTerm,
  onSearchChange,
  currentPage,
  shopView,
}) {
  // Which category dropdown is currently open (null = none)
  const [openMenu, setOpenMenu] = useState(null);

//search part
const [allProducts, setAllProducts] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/products");
      const data = await response.json();
      if (response.ok) setAllProducts(data);
    } catch (error) {
      console.error("Failed to load products for search:", error);
    }
  };

  fetchProducts();
}, []);

const suggestions = searchTerm.trim()
  ? allProducts
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5)
  : [];

const [showNavbar, setShowNavbar] = useState(true);
const [lastScrollY, setLastScrollY] = useState(0);

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY; //scroll Y built in for how mnay pixels down the page currently is

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setShowNavbar(false); // scrolling down, and far enough to bother hiding
    } else {
      setShowNavbar(true); // scrolling up, or still near the top
    }

    setLastScrollY(currentScrollY);
  };

  window.addEventListener("scroll", handleScroll); //runs everytine the user scrolls
  return () => window.removeEventListener("scroll", handleScroll);
}, [lastScrollY]);

  const onShopPage = currentPage === "shop";
  const isAllShop =
    onShopPage &&
    !shopView.saleOnly &&
    shopView.category === "All";
  const isSale = onShopPage && shopView.saleOnly;

  const linkBase =
    "group relative cursor-pointer text-[12px] font-medium uppercase tracking-[0.14em] transition-colors duration-300 sm:text-[13px]";

  const underline = (active) =>
    `absolute -bottom-1 left-0 h-[2px] bg-rose-700 transition-all duration-300 ${
      active ? "w-full" : "w-0 group-hover:w-full"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur-md transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* =====================================================
          TOP NAVIGATION
          Logo | Our Shop | On Sale | Search | Account | Cart
          ===================================================== */}
      <div className="border-b border-stone-200 bg-stone-100">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4 lg:gap-8 lg:px-10">

          {/* Logo */}
          <button
            onClick={onHomeClick}
            className="group shrink-0 cursor-pointer transition duration-300"
            aria-label="Lakmé home"
          >
            <svg viewBox="0 0 220 60" className="h-auto w-36 sm:w-44">
              <text
                x="20" y="36"
                fontSize="24" fontStyle="italic" fontWeight="500" letterSpacing="3"
                className="fill-gray-900 transition duration-300 group-hover:fill-rose-600"
                fontFamily="Georgia, serif"
              >
                LAKMÉ
              </text>
              <path d="M20 42 Q 93 52 168 42" fill="none" stroke="#e11d48" strokeWidth="1.5" />
            </svg>
          </button>

          {/* Our Shop */}
          <button
            onClick={() => onOpenShop()}
            className={`${linkBase} hidden sm:block ${
              isAllShop ? "text-rose-700" : "text-gray-700 hover:text-rose-700"
            }`}
          >
            Our Shop
            <span className={underline(isAllShop)} />
          </button>

          {/* On Sale */}
          <button
            onClick={() => onOpenShop({ saleOnly: true })}
            className={`${linkBase} hidden sm:block ${
              isSale ? "text-rose-700" : "text-gray-700 hover:text-rose-700"
            }`}
          >
            On Sale
            <span className={underline(isSale)} />
          </button>

          {/* Search Bar */}
          <div 
          className="relative ml-auto hidden w-full max-w-xs md:block mr-3"
          onFocus={() => setShowSuggestions(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) { //related target tells us what's receiving focus next
              setShowSuggestions(false);
            }
          }}
          >

            <Search
              size={16}
              strokeWidth={1.8}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)} //react controls what apperas inside input
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSearch();
                }
              }}
              placeholder="Search products..."
              className="w-full rounded-full border border-stone-200 bg-stone-50 py-2 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-rose-300 focus:bg-white"
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      onViewDetails(product);
                      setShowSuggestions(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition hover:bg-rose-50"
                  >
                    <img
                      src={`http://127.0.0.1:8000${product.image}`}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-rose-600">
                      Rs. {product.price}
                    </span>
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Right-side icons */}
          <div className="ml-auto flex items-center gap-2 md:ml-0">

            {/* Mobile Search */}
            <button
              className="cursor-pointer rounded-full p-2 text-gray-700 transition hover:bg-stone-100 md:hidden"
              aria-label="Search"
            >
              <Search size={21} strokeWidth={1.8} />
            </button>

            {/* Person / Profile */}
            {isLoggedIn ? (
              <ProfileDropdown onLogout={onLogout} />
            ) : (
              <button
                onClick={onAuthClick}
                className="cursor-pointer rounded-full p-2 text-gray-700 transition hover:bg-rose-50 hover:text-rose-600"
                aria-label="Account"
                title="Login / Sign Up"
              >
                <User size={21} strokeWidth={1.8} />
              </button>
            )}

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative cursor-pointer rounded-full p-2 text-gray-700 transition hover:bg-rose-50 hover:text-rose-600"
              aria-label="Shopping cart"
              title="Shopping cart"
            >
              <ShoppingCart size={21} strokeWidth={1.8} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>


      {/* =====================================================
          SECOND NAVIGATION  –  Categories with hover dropdowns
          ===================================================== */}
      <div className="border-b border-stone-100 bg-white">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-6 py-4 sm:gap-x-10 lg:gap-x-14">

          {/* Small screens: Our Shop / On Sale move here so the top row stays clean */}
          <button
            onClick={() => onOpenShop()}
            className={`${linkBase} py-1 sm:hidden ${
              isAllShop ? "text-rose-700" : "text-gray-700 hover:text-rose-700"
            }`}
          >
            Our Shop
          </button>

          <button
            onClick={() => onOpenShop({ saleOnly: true })}
            className={`${linkBase} py-1 sm:hidden ${
              isSale ? "text-rose-700" : "text-gray-700 hover:text-rose-700"
            }`}
          >
            On Sale
          </button>

          {categoryMenu.map((menu) => {
            const isActive =
              onShopPage &&
              !shopView.saleOnly &&
              shopView.category === menu.name;

            const isOpen = openMenu === menu.name;

            return (
              <div
                key={menu.name}
                className="relative"
                onMouseEnter={() => setOpenMenu(menu.name)}
                onMouseLeave={() => setOpenMenu(null)}
              >

                {/* Category name (click = show the whole category) */}
                <button
                  onClick={() => {
                    setOpenMenu(null);
                    onOpenShop({ category: menu.name });
                  }}
                  className={`${linkBase} inline-flex items-center gap-1 py-1 ${
                    isActive || isOpen
                      ? "text-rose-700"
                      : "text-gray-700 hover:text-rose-700"
                  }`}
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                >
                  {menu.name}

                  <ChevronDown
                    size={14}
                    strokeWidth={2}
                    className={`transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />

                  <span className={underline(isActive || isOpen)} />
                </button>

                {/* Dropdown (pt-3 keeps the hover area connected to the label) */}
                {isOpen && (
                  <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">

                    <div className="min-w-[210px] overflow-hidden rounded-2xl border border-stone-200 bg-white py-2 shadow-xl">

                      <button
                        onClick={() => {
                          setOpenMenu(null);
                          onOpenShop({ category: menu.name });
                        }}
                        className="block w-full cursor-pointer px-5 py-2.5 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        All {menu.name}
                      </button>

                      <div className="mx-5 my-1 border-t border-stone-100" />

                      {menu.items.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            setOpenMenu(null);
                            onOpenShop({
                              category: menu.name,
                              subcategory: item,
                            });
                          }}
                          className="block w-full cursor-pointer px-5 py-2.5 text-left text-sm text-gray-600 transition hover:bg-rose-50 hover:text-rose-700"
                        >
                          {item.label}
                        </button>
                      ))}

                    </div>

                  </div>
                )}

              </div>
            );
          })}

        </nav>
      </div>

    </header>
  );
}

export default Navbar;
