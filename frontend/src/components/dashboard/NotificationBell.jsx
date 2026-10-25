import { useEffect, useRef, useState } from "react";
import { Bell, AlertTriangle, CircleOff, ShoppingBag } from "lucide-react";

const READ_KEY = "admin_read_notifications";

const typeStyles = {
  out: { icon: CircleOff, bg: "bg-red-50", color: "text-red-600" },
  low: { icon: AlertTriangle, bg: "bg-amber-50", color: "text-amber-600" },
  order: { icon: ShoppingBag, bg: "bg-indigo-50", color: "text-indigo-600" },
};

function NotificationBell({ onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(READ_KEY)) || [];
    } catch {
      return [];
    }
  });
  const wrapperRef = useRef(null);

  const loadNotifications = async () => {
    const token = localStorage.getItem("access_token");
    const list = [];

    try {
      // 1) Newest orders that still need attention
      const salesResponse = await fetch("http://127.0.0.1:8000/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (salesResponse.ok) {
        const sales = await salesResponse.json();

        sales
          .filter((s) => s.status === "pending" || s.status === "processing")
          .slice(0, 5) // /sales is newest-first
          .forEach((s) =>
            list.push({
              id: `order-${s.id}-${s.status}`,
              type: "order",
              title: `New order #${s.id}`,
              text: `Rs. ${s.total_amount} · ${s.payment_method} · ${s.status}`,
            })
          );
      }

      // 2) Stock alerts
      const stockResponse = await fetch(
        "http://127.0.0.1:8000/dashboard/inventory/details"
      );

      if (stockResponse.ok) {
        const stock = await stockResponse.json();

        stock.out_of_stock_products.forEach((p) =>
          list.push({
            id: `out-${p.id}`,
            type: "out",
            title: `${p.name} is out of stock`,
            text: "Restock it to keep selling.",
          })
        );

        stock.low_stock_products.forEach((p) =>
          list.push({
            id: `low-${p.id}-${p.stock_quantity}`,
            type: "low",
            title: `${p.name} is running low`,
            text: `Only ${p.stock_quantity} left (reorder level ${p.reorder_level}).`,
          })
        );
      }
    } catch (error) {
      console.error("Notification error:", error);
    }

    setNotifications(list);
  };

  // Load once, then refresh every minute
  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 60000);
    return () => clearInterval(timer); // stop the timer if the bell is removed
  }, []);

  // Close the dropdown when clicking anywhere outside it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveRead = (ids) => {
    setReadIds(ids);
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
  };

  const markRead = (id) => {
    if (!readIds.includes(id)) saveRead([...readIds, id]);
  };

  const markAllRead = () => saveRead(notifications.map((n) => n.id));

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => {
          if (!open) loadNotifications(); // fresh data every time it opens
          setOpen(!open);
        }}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        aria-label="Notifications"
      >
        <Bell size={19} strokeWidth={1.8} />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                You're all caught up.
              </p>
            ) : (
              notifications.map((n) => {
                const style = typeStyles[n.type];
                const Icon = style.icon;
                const unread = !readIds.includes(n.id);

                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      markRead(n.id);
                      setOpen(false);
                      onNavigate("Sales");
                    }}
                    className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      unread ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    <div className={`mt-0.5 rounded-lg p-2 ${style.bg} ${style.color}`}>
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{n.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{n.text}</p>
                    </div>

                    {unread && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;