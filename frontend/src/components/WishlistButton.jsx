import { Heart } from "lucide-react";
import { useWishlist } from "./WishlistContext";

function WishlistButton({ product, className = "" }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const saved = isInWishlist(product.id);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        toggleWishlist(product);
      }}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110 ${className}`}
    >
      <Heart
        size={18}
        className={saved ? "fill-rose-500 text-rose-500" : "text-gray-600"}
      />
    </button>
  );
}

export default WishlistButton;