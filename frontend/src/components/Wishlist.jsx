import { Heart } from "lucide-react";
import ProductCard from "./ProductCard";
import { useWishlist } from "./WishlistContext";

function EmptyState({ title, text, buttonLabel, onClick }) {
  return (
    <div className="mt-12 rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <Heart size={26} />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-500">{text}</p>
      <button
        onClick={onClick}
        className="mt-8 cursor-pointer rounded-full bg-gray-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function Wishlist({ onAddToCart, onViewDetails, onShopClick, onLoginClick }) {
  const { wishlist, isLoggedIn } = useWishlist();

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-600">
          Your favourites
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900">
          My Wishlist
        </h1>

        {isLoggedIn && wishlist.length > 0 && (
          <p className="mt-3 text-sm text-gray-500">
            {wishlist.length} saved {wishlist.length === 1 ? "item" : "items"}. Click a heart to remove it.
          </p>
        )}

        {!isLoggedIn ? (
          <EmptyState
            title="Log in to see your wishlist"
            text="Save the products you love and find them here anytime."
            buttonLabel="Log in"
            onClick={onLoginClick}
          />
        ) : wishlist.length === 0 ? (
          <EmptyState
            title="Your wishlist is empty"
            text="Tap the heart on any product to save it here."
            buttonLabel="Browse products"
            onClick={onShopClick}
          />
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Wishlist;