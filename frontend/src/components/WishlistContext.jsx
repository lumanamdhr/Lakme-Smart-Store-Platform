import { createContext, useContext, useEffect, useState } from "react";

// Safe defaults, so nothing crashes if a component is used outside the provider
const WishlistContext = createContext({
  wishlist: [],
  isLoggedIn: false,
  isInWishlist: () => false,
  toggleWishlist: () => {},
  count: 0,
});

export function WishlistProvider({ isLoggedIn, onLoginRequired, children }) {
  const [wishlist, setWishlist] = useState([]); // full product objects

  const loadWishlist = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setWishlist(await response.json());
    } catch (error) {
      console.error("Wishlist load error:", error);
    }
  };

  // Load when someone logs in, clear when they log out
  useEffect(() => {
    if (isLoggedIn) loadWishlist();
    else setWishlist([]);
  }, [isLoggedIn]);

  const isInWishlist = (productId) => wishlist.some((p) => p.id === productId);

  const toggleWishlist = async (product) => {
    if (!isLoggedIn) {
      onLoginRequired(); // guests are sent to the login page
      return;
    }

    const alreadySaved = isInWishlist(product.id);

    // Update the screen first so the heart reacts instantly, then tell the server
    setWishlist((previous) =>
      alreadySaved
        ? previous.filter((p) => p.id !== product.id)
        : [product, ...previous]
    );

    try {
      const response = await fetch(`http://127.0.0.1:8000/wishlist/${product.id}`, {
        method: alreadySaved ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      if (!response.ok) throw new Error("Wishlist update failed");
    } catch (error) {
      console.error("Wishlist error:", error);
      loadWishlist(); // something went wrong, so reload the real list from the server
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, isLoggedIn, isInWishlist, toggleWishlist, count: wishlist.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() { //useWishlist() is how any component reads the shared box
  return useContext(WishlistContext);
}