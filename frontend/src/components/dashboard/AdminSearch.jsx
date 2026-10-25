import { useEffect, useState } from "react";
import { Search } from "lucide-react";

function AdminSearch({ onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/products");
        const data = await response.json();
        if (response.ok) setProducts(data);
      } catch (error) {
        console.error("Admin search error:", error);
      }
    };

    loadProducts();
  }, []);

  const search = term.trim().toLowerCase();

  const matches = search
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(search) ||
            p.category.toLowerCase().includes(search)
        )
        .slice(0, 6)
    : [];

  return (
    <div
      className="relative hidden w-72 md:block"
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <Search
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:bg-white"
      />

      {open && matches.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {matches.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onSelectProduct(p);
                setTerm("");
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
            >
              <img
                src={`http://127.0.0.1:8000${p.image}`}
                alt={p.name}
                className="h-10 w-10 rounded-lg object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-500">{p.category}</p>
              </div>

              <span
                className={`shrink-0 text-xs font-semibold ${
                  p.stock_quantity === 0
                    ? "text-red-600"
                    : p.stock_quantity <= p.reorder_level
                    ? "text-amber-600"
                    : "text-slate-600"
                }`}
              >
                {p.stock_quantity} in stock
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminSearch;