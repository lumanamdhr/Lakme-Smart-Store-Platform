import { useState } from "react";
import {
  WalletCards,
  Banknote,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

function Checkout({ onHomeClick, onOrderComplete }) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleCheckout = async () => {
    if (!paymentMethod) {
      setMessage("Please select a payment method.");
      return;
    }

    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      setMessage("Please login before checking out.");
      setLoading(false);
      return;
    }

    if (paymentMethod === "khalti") {
      try {
        const khaltiResponse = await fetch(
          "http://127.0.0.1:8000/payments/khalti/initiate",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const khaltiData = await khaltiResponse.json();

        if (!khaltiResponse.ok) {
          setMessage(khaltiData.detail || "Could not start Khalti payment.");
          setLoading(false);
          return;
        }

        window.location.href = khaltiData.payment_url; // send the browser to Khalti's page
        return; // stop here — this function ends; it never reaches the /checkout call below
      } catch (error) {
        console.error("Khalti initiate error:", error);
        setMessage("Unable to connect to server.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/checkout",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            payment_method: paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Checkout failed.");
        setLoading(false);
        return;
      }

      setOrderSuccess(true);

      setMessage(
        `Order placed successfully! Sale #${data.sale_id}`
      );

      if (onOrderComplete) {
        onOrderComplete();
      }

    } catch (error) {
      console.error("Checkout error:", error);

      setMessage(
        "Unable to connect to server."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SUCCESS SCREEN
  // =========================================================

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 px-6 py-20">

        <div className="mx-auto max-w-2xl text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-pink-600">
            <CheckCircle2 size={32} />
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
            Order Confirmed
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
            Thank You
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">
            Your order has been successfully placed.
            We appreciate your purchase.
          </p>

          <button
            onClick={onHomeClick}
            className="mt-10 inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-pink-600"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </button>

        </div>

      </div>
    );
  }

  // =========================================================
  // CHECKOUT PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 px-6 py-12 sm:py-16">

      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-10">

          <button
            onClick={onHomeClick}
            className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-pink-600"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </button>

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
            Checkout
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Complete Your Order
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Select your preferred payment method to complete your purchase.
          </p>

        </div>


        {/* Main Card */}
        <div className="rounded-[2rem] border border-pink-100 bg-white p-6 shadow-sm sm:p-8">

          {/* Payment Heading */}
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
              <WalletCards size={21} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Payment Method
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose how you would like to pay.
              </p>
            </div>

          </div>


          {/* Payment Options */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            {/* eSewa */}
            <button
              type="button"
              onClick={() => {
                setPaymentMethod("esewa");
                setMessage("");
              }}
              className={`cursor-pointer rounded-2xl border p-5 text-left transition ${
                paymentMethod === "esewa"
                  ? "border-pink-500 bg-pink-50 ring-2 ring-pink-100"
                  : "border-slate-200 bg-white hover:border-pink-200"
              }`}
            >

              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-600">
                  eS
                </div>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    paymentMethod === "esewa"
                      ? "border-pink-500"
                      : "border-slate-300"
                  }`}
                >
                  {paymentMethod === "esewa" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-pink-500" />
                  )}
                </div>

              </div>

              <p className="mt-5 font-semibold text-slate-900">
                eSewa
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Pay using your eSewa account.
              </p>

            </button>


            {/* Khalti */}
            <button
              type="button"
              onClick={() => {
                setPaymentMethod("khalti");
                setMessage("");
              }}
              className={`cursor-pointer rounded-2xl border p-5 text-left transition ${
                paymentMethod === "khalti"
                  ? "border-pink-500 bg-pink-50 ring-2 ring-pink-100"
                  : "border-slate-200 bg-white hover:border-pink-200"
              }`}
            >

              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 font-bold text-violet-600">
                  K
                </div>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    paymentMethod === "khalti"
                      ? "border-pink-500"
                      : "border-slate-300"
                  }`}
                >
                  {paymentMethod === "khalti" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-pink-500" />
                  )}
                </div>

              </div>

              <p className="mt-5 font-semibold text-slate-900">
                Khalti
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Pay securely with Khalti.
              </p>

            </button>


            {/* Cash on Delivery */}
            <button
              type="button"
              onClick={() => {
                setPaymentMethod("cash");
                setMessage("");
              }}
              className={`cursor-pointer rounded-2xl border p-5 text-left transition ${
                paymentMethod === "cash"
                  ? "border-pink-500 bg-pink-50 ring-2 ring-pink-100"
                  : "border-slate-200 bg-white hover:border-pink-200"
              }`}
            >

              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Banknote size={21} />
                </div>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    paymentMethod === "cash"
                      ? "border-pink-500"
                      : "border-slate-300"
                  }`}
                >
                  {paymentMethod === "cash" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-pink-500" />
                  )}
                </div>

              </div>

              <p className="mt-5 font-semibold text-slate-900">
                Cash on Delivery
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Pay when your order arrives.
              </p>

            </button>

          </div>


          {/* Security note */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">

            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0 text-pink-600"
            />

            <p className="text-xs leading-5 text-slate-500">
              Your payment information is handled securely.
              Online payment options will redirect you to the selected
              payment provider when the payment gateway is connected.
            </p>

          </div>


          {/* Error / info message */}
          {message && (
            <div className="mt-6 rounded-xl bg-pink-50 px-4 py-3 text-sm font-medium text-pink-700">
              {message}
            </div>
          )}


          {/* Button */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-8 w-full cursor-pointer rounded-full bg-slate-900 py-4 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : paymentMethod === "cash"
              ? "Place Order"
              : paymentMethod
              ? `Continue with ${
                  paymentMethod === "esewa"
                    ? "eSewa"
                    : "Khalti"
                }`
              : "Select Payment Method"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default Checkout;