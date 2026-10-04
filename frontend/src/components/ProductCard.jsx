import { Eye, ShoppingBag } from "lucide-react";

function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
}) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-3 hover:border-rose-200 hover:shadow-2xl">

      {/* Product Image Area */}
      <div className="relative h-72 overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50">

        <img
          src={`http://127.0.0.1:8000${product.image}`}
          alt={product.name}
          className="h-full w-full object-contain p-8 transition duration-700 group-hover:scale-110"
        />

        {/* Category badge */}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-600 shadow-sm backdrop-blur">
          {product.category}
        </span>

        {/* Hover overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-900/15 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

      </div>

      {/* Product Information */}
      <div className="p-6">

        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-400">
          Lakmé
        </p>

        <h3 className="mt-2 min-h-[52px] text-lg font-semibold leading-7 text-gray-900">
          {product.name}
        </h3>

        <div className="mt-4 flex items-center justify-between">

          {product.on_sale && product.discount_percent > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 line-through">
                Rs. {product.price}
              </span>
              <span className="font-semibold text-rose-600">
                Rs. {Math.round(product.price * (1 - product.discount_percent / 100))}
              </span>
            </div>
          ) : (
            <span className="font-semibold text-gray-900">Rs. {product.price}</span>
          )}
          {/*<p className="text-lg font-semibold text-gray-900">
            Rs. {product.price}
          </p>*/}

          {product.stock_quantity === 0 ? (
            <span className="text-xs font-semibold text-red-500">
              Out of stock
            </span>
          ) : product.stock_quantity <= product.reorder_level ? (
            <span className="text-xs font-semibold text-amber-600">
              Limited stock
            </span>
          ) : (
            <span className="text-xs font-semibold text-emerald-600">
              In stock
            </span>
          )}

        </div>

        {/* Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">

          <button
            onClick={() => onViewDetails(product)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-900 px-4 py-3 text-xs font-semibold text-gray-900 transition-all duration-300 hover:bg-gray-900 hover:text-white"
          >
            <Eye size={15} />
            Details
          </button>

          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock_quantity === 0}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:bg-rose-600 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <ShoppingBag size={15} />
            Add to Cart
          </button>

        </div>

      </div>

    </article>
  );
}

export default ProductCard;