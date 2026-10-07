import { useEffect, useState } from "react";

function KhaltiVerify({ onDone }) {
  const [status, setStatus] = useState("checking"); // checking | success | failed

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const pidx = params.get("pidx");
      const token = localStorage.getItem("access_token");

      if (!pidx) {
        setStatus("failed");
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/payments/khalti/verify?pidx=${pidx}`,
          { method: "POST", headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        setStatus(data.success ? "success" : "failed");
      } catch (error) {
        setStatus("failed");
      }
    };

    verify();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 px-6 text-center">
      {status === "checking" && <p className="text-lg text-gray-700">Confirming your payment...</p>}

      {status === "success" && (
        <>
          <p className="text-2xl font-semibold text-gray-900">Payment successful!</p>
          <p className="text-gray-600">Your order has been placed.</p>
        </>
      )}

      {status === "failed" && (
        <>
          <p className="text-2xl font-semibold text-gray-900">Payment not completed</p>
          <p className="text-gray-600">No charge was made. You can try again from your cart.</p>
        </>
      )}

      <button
        onClick={() => {
          window.history.replaceState({}, "", "/");
          onDone();
        }}
        className="mt-4 cursor-pointer rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
      >
        Continue Shopping
      </button>
    </div>
  );
}

export default KhaltiVerify;