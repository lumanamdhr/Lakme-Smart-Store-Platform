import { useEffect, useState } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";

function CartDrawer({
  isOpen,
  onClose,
  onCheckout,
  onCartUpdate,
}) {
  const getEffectivePrice = (item) => {
    if (item.on_sale && item.discount_percent > 0) {
      return item.price * (1 - item.discount_percent / 100);
    }
    return item.price;
  };

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // =========================================================
  // LOAD CART
  // =========================================================

  const fetchCart = async () => {
    const customerId =
      localStorage.getItem("customer_id");

    const token =
      localStorage.getItem("access_token");

    // =======================================================
    // GUEST CART
    // =======================================================

    if (!token || !customerId) {
      try {
        const savedCart =
          localStorage.getItem("guest_cart");

        if (!savedCart) {
          setItems([]);
          setTotal(0);
          return;
        }

        const guestItems =
          JSON.parse(savedCart);

        // Calculate guest cart total
        const guestTotal =
          guestItems.reduce(
            (sum, item) =>
             sum +
              Number(getEffectivePrice(item)) *
              Number(item.quantity),
            0
          );

        setItems(guestItems);
        setTotal(guestTotal);
        setMessage("");

      } catch (error) {
        console.error(
          "Guest cart loading error:",
          error
        );

        setItems([]);
        setTotal(0);
        setMessage(
          "Unable to load your cart."
        );
      }

      return;
    }

    // =======================================================
    // LOGGED-IN CUSTOMER CART
    // =======================================================

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `http://127.0.0.1:8000/cart/${customerId}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          "Unable to load your cart."
        );
        return;
      }

      setItems(data.items || []);
      setTotal(data.total || 0);

    } catch (error) {
      console.error(
        "Cart drawer error:",
        error
      );

      setMessage(
        "Unable to connect to the server."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // OPEN CART
  // =========================================================

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  // =========================================================
  // UPDATE QUANTITY
  // =========================================================

  const updateQuantity = async (
    cartItemId,
    newQuantity
  ) => {
    if (newQuantity < 1) {
      return;
    }

    const customerId =
      localStorage.getItem("customer_id");

    const token =
      localStorage.getItem("access_token");

    // =======================================================
    // GUEST CART QUANTITY UPDATE
    // =======================================================

    if (!token || !customerId) {

      try {
        const savedCart =
          localStorage.getItem("guest_cart");

        if (!savedCart) {
          return;
        }

        const guestItems =
          JSON.parse(savedCart);

        const updatedItems =
          guestItems.map((item) =>
            item.id === cartItemId
              ? {
                  ...item,
                  quantity: newQuantity,
                }
              : item
          );

        localStorage.setItem(
          "guest_cart",
          JSON.stringify(updatedItems)
        );

        setItems(updatedItems);

        const newTotal =
          updatedItems.reduce(
            (sum, item) =>
              sum +
              Number(item.price) *
                Number(item.quantity),
            0
          );

        setTotal(newTotal);

        if (onCartUpdate) {
          await onCartUpdate();
        }

      } catch (error) {
        console.error(
          "Guest quantity update error:",
          error
        );
      }

      return;
    }

    // =======================================================
    // LOGGED-IN CUSTOMER QUANTITY UPDATE
    // =======================================================

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/cart/items/${cartItemId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            quantity: newQuantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Quantity update failed:",
          data
        );
        return;
      }

      await fetchCart();

      if (onCartUpdate) {
        await onCartUpdate();
      }

    } catch (error) {
      console.error(
        "Quantity update error:",
        error
      );
    }
  };

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const removeItem = async (cartItemId) => {
    const customerId =
      localStorage.getItem("customer_id");

    const token =
      localStorage.getItem("access_token");

    // =======================================================
    // GUEST CART REMOVE
    // =======================================================

    if (!token || !customerId) {

      try {
        const savedCart =
          localStorage.getItem("guest_cart");

        if (!savedCart) {
          return;
        }

        const guestItems =
          JSON.parse(savedCart);

        const updatedItems =
          guestItems.filter(
            (item) => item.id !== cartItemId
          );

        localStorage.setItem(
          "guest_cart",
          JSON.stringify(updatedItems)
        );

        setItems(updatedItems);

        const newTotal =
          updatedItems.reduce(
            (sum, item) =>
              sum +
              Number(item.price) *
                Number(item.quantity),
            0
          );

        setTotal(newTotal);

        if (onCartUpdate) {
          await onCartUpdate();
        }

      } catch (error) {
        console.error(
          "Guest remove item error:",
          error
        );
      }

      return;
    }

    // =======================================================
    // LOGGED-IN CUSTOMER REMOVE
    // =======================================================

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/cart/items/${cartItemId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Remove item failed:",
          data
        );
        return;
      }

      await fetchCart();

      if (onCartUpdate) {
        await onCartUpdate();
      }

    } catch (error) {
      console.error(
        "Remove item error:",
        error
      );
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* Background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/30"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >

        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5">

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-rose-500">
              Shopping
            </p>

            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              Your Cart
            </h2>
          </div>

          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 text-gray-500 transition hover:bg-stone-100 hover:text-gray-900"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>

        </div>


        {/* Cart content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {loading && (
            <p className="text-center text-sm text-gray-500">
              Loading your cart...
            </p>
          )}

          {!loading &&
            message && (
              <p className="text-center text-sm text-red-500">
                {message}
              </p>
            )}

          {!loading &&
            !message &&
            items.length === 0 && (
              <div className="flex h-full items-center justify-center text-center">
                <div>

                  <p className="text-lg font-medium text-gray-800">
                    Your cart is empty
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Add some beauty essentials to get started.
                  </p>

                </div>
              </div>
            )}


          {!loading &&
            !message &&
            items.length > 0 && (
              <div className="space-y-5">

                {items.map((item) => (

                  <div
                    key={item.id}
                    className="border-b border-stone-100 pb-5"
                  >

                    <div className="flex gap-4">

                      {/* Product image */}
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-50">

                        {item.image ? (
                          <img
                            src={`http://127.0.0.1:8000${item.image}`}
                            alt={item.name}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}

                      </div>


                      <div className="min-w-0 flex-1">

                        <p className="text-xs uppercase tracking-widest text-rose-500">
                          {item.category}
                        </p>

                        <h3 className="mt-1 truncate text-sm font-medium text-gray-900">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                          Rs. {getEffectivePrice(item)}
                        </p>


                        <div className="mt-3 flex items-center justify-between">

                          {/* Quantity */}
                          <div className="flex items-center rounded-full border border-stone-200">

                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity - 1
                                )
                              }
                              disabled={
                                item.quantity <= 1
                              }
                              className="cursor-pointer p-2 text-gray-500 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="px-2 text-sm">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity + 1
                                )
                              }
                              className="cursor-pointer p-2 text-gray-500"
                            >
                              <Plus size={14} />
                            </button>

                          </div>


                          {/* Remove */}
                          <button
                            onClick={() =>
                              removeItem(item.id)
                            }
                            className="cursor-pointer text-gray-400 transition hover:text-red-500"
                            title="Remove product"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </div>

                    </div>

                  </div>

                ))}

              </div>
            )}

        </div>


        {/* Footer */}
        <div className="border-t border-stone-100 bg-stone-50 px-6 py-5">

          <div className="mb-5 flex items-center justify-between">

            <span className="text-sm text-gray-600">
              Subtotal
            </span>

            <span className="text-lg font-semibold text-gray-900">
              Rs. {Number(total).toLocaleString()}
            </span>

          </div>

          <button
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full cursor-pointer rounded-full bg-gray-900 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-rose-600 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Proceed to Checkout
          </button>

        </div>

      </aside>
    </>
  );
}

export default CartDrawer;