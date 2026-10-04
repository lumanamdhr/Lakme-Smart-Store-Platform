import { ArrowLeft, ShoppingBag, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

function ProductDetails({
  product,
  onBack,
  onAddToCart,
  onViewDetails,
}) {
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return null;
  }

  const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
      if (!product) return;

      const fetchRecommendations = async () => {
        try {
          const response = await fetch(
            `http://127.0.0.1:8000/products/${product.id}/recommendations`
          );
          const data = await response.json();

          if (response.ok) {
            setRecommendations(data);
          }
        } catch (error) {
          console.error("Recommendation loading error:", error);
        }
      };

      fetchRecommendations();
    }, [product]);

  const increaseQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <section className="min-h-screen bg-stone-50 px-6 py-4 lg:px-10">

      <div className="mx-auto max-w-6xl">

        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-rose-600"
        >
          <ArrowLeft size={17} />
          Back to products
        </button>

        <div className="grid overflow-hidden rounded-3xl bg-white shadow-sm lg:grid-cols-2">

          {/* Image */}
          <div className="flex min-h-[300px] items-center justify-center bg-stone-50 p-6">

            <img
              src={`http://127.0.0.1:8000${product.image}`}
              alt={product.name}
              className="max-h-[320px] w-full object-contain"
            />

          </div>

          {/* Details */}
          <div className="flex flex-col justify-center p-6 sm:p-7">

            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
              {product.category}
            </p>

            <h1 className="mt-4 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            {product.on_sale && product.discount_percent > 0 ? (
            <div className="mt-5 flex items-center gap-3">
              <span className="text-lg text-gray-400 line-through">
                Rs. {product.price}
              </span>
              <span className="text-2xl font-semibold text-rose-600">
                Rs. {Math.round(product.price * (1 - product.discount_percent / 100))}
              </span>
            </div>
          ) : (
            <p className="mt-5 text-2xl font-semibold text-gray-900">
              Rs. {product.price}
            </p>
          )}

            <div className="mt-5 h-px bg-stone-100" />

            <p className="mt-6 text-sm leading-7 text-gray-600">
              {product.description ||
                "Discover this Lakmé beauty essential, designed to complement your everyday beauty routine."}
            </p>

            {/* Stock */}
            <div className="mt-6">

              {product.stock_quantity === 0 ? (
                <p className="text-sm font-medium text-red-500">
                  Currently out of stock
                </p>
              ) : product.stock_quantity <= product.reorder_level ? (
                <p className="text-sm font-medium text-amber-600">
                  Limited stock available
                </p>
              ) : (
                <p className="text-sm font-medium text-emerald-600">
                  In stock
                </p>
              )}

            </div>

            {/* Quantity */}
            {product.stock_quantity > 0 && (
              <div className="mt-7">

                <p className="mb-3 text-sm font-medium text-gray-800">
                  Quantity
                </p>

                <div className="flex w-fit items-center rounded-full border border-stone-200">

                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="cursor-pointer p-3 text-gray-500 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="min-w-10 text-center text-sm font-medium">
                    {quantity}
                  </span>

                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock_quantity}
                    className="cursor-pointer p-3 text-gray-500 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Plus size={16} />
                  </button>

                </div>

              </div>
            )}

            {/* Add to cart */}
            <button
              onClick={() => onAddToCart(product, quantity)}
              disabled={product.stock_quantity === 0}
              className="mt-8 inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-gray-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <ShoppingBag size={18} />
              {product.stock_quantity === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </button>

          </div>

        </div>
      
        {recommendations.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              You might also like
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {recommendations.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          </div>
        )}  
      </div>

    </section>
  );
}

export default ProductDetails;