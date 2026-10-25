import { useEffect, useState } from "react";

import {
  Package,
  AlertTriangle,
  CircleDollarSign,
  ShoppingBag,
  Users,
  MapPin,
  TrendingUp,
  Lightbulb,
  RefreshCw,
} from "lucide-react";


function Intelligence() {

  // =========================================================
  // STATE
  // =========================================================

  // Stores the complete intelligence API response
  const [intelligenceData, setIntelligenceData] =
    useState(null);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error message
  const [message, setMessage] = useState("");


  // =========================================================
  // FETCH INTELLIGENCE DATA
  // =========================================================

  const fetchIntelligence = async () => {

    try {

      // Get JWT token
      const token =
        localStorage.getItem("access_token");


      // Make sure user is logged in
      if (!token) {

        setMessage(
          "Please login to view intelligence."
        );

        setLoading(false);

        return;
      }


      // -----------------------------------------------------
      // REQUEST INTELLIGENCE DATA FROM FASTAPI
      // -----------------------------------------------------

      const response = await fetch(
        "http://127.0.0.1:8000/dashboard/intelligence",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      // Convert response into JavaScript
      const data = await response.json();


      // Check API response
      if (!response.ok) {

        setMessage(
          data.detail ||
          "Unable to load intelligence data."
        );

        return;
      }


      // Save intelligence response
      setIntelligenceData(data);

    } catch (error) {

      console.error(
        "Intelligence error:",
        error
      );

      setMessage(
        "Unable to connect to server."
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {

    fetchIntelligence();

  }, []);


  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {

    return (
      <div className="py-10">

        <p className="text-sm text-slate-500">
          Loading intelligence data...
        </p>

      </div>
    );

  }


  // =========================================================
  // ERROR STATE
  // =========================================================

  if (message) {

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

        <p className="text-sm text-red-600">
          {message}
        </p>

      </div>
    );

  }


  // =========================================================
  // SAFETY CHECK
  // =========================================================

  if (!intelligenceData) {
    return null;
  }


  // =========================================================
  // SHORT VARIABLES FOR EASIER READING
  // =========================================================

  const summary =
    intelligenceData.summary;

  const inventory =
    intelligenceData.inventory;

  const sales =
    intelligenceData.sales;

  const customers =
    intelligenceData.customers;

  const insights =
    intelligenceData.insights;


  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (

    <div className="space-y-8">


      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div>

        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
          Intelligence
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Business Intelligence
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Combine inventory, sales, and customer data to
          identify important patterns and support better
          business decisions.
        </p>

      </div>


      {/* =====================================================
          SUMMARY CARDS
          ===================================================== */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">


        {/* PRODUCTS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Products
              </p>

              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {summary.total_products}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Products in inventory
              </p>

            </div>

            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">

              <Package size={20} />

            </div>

          </div>

        </div>


        {/* REVENUE */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Revenue
              </p>

              <p className="mt-3 text-2xl font-semibold text-slate-900">

                Rs.{" "}

                {Number(
                  summary.total_revenue
                ).toLocaleString()}

              </p>

              <p className="mt-2 text-xs text-slate-400">
                From completed sales
              </p>

            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">

              <CircleDollarSign size={20} />

            </div>

          </div>

        </div>


        {/* ORDERS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Customer Orders
              </p>

              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {summary.total_orders}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Completed orders
              </p>

            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">

              <ShoppingBag size={20} />

            </div>

          </div>

        </div>


        {/* ACTIVE BUYERS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Active Buyers
              </p>

              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {summary.active_buyers}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Customers with completed orders
              </p>

            </div>

            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">

              <Users size={20} />

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          BUSINESS INSIGHTS
          ===================================================== */}
{/*
      <section>

        <div className="mb-5">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            Analysis
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Business Insights
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Important findings generated from your current
            business data.
          </p>

        </div>


        <div className="grid gap-5">

          {insights.length === 0 ? (

            <div className="rounded-2xl border border-slate-200 bg-white p-8">

              <p className="text-sm text-slate-500">
                No significant insights available right now.
              </p>

            </div>

          ) : (

            insights.map((insight, index) => {

              let icon = Lightbulb;

              let iconStyle =
                "bg-slate-100 text-slate-600";

              let priorityStyle =
                "bg-slate-100 text-slate-600";


              // Inventory insight
              if (insight.type === "inventory") {

                icon = AlertTriangle;

                iconStyle =
                  "bg-red-50 text-red-600";

                priorityStyle =
                  insight.priority === "High"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700";
              }


              // Sales insight
              if (insight.type === "sales") {

                icon = TrendingUp;

                iconStyle =
                  "bg-blue-50 text-blue-600";

                priorityStyle =
                  "bg-blue-50 text-blue-700";
              }


              // Customer insight
              if (insight.type === "customer") {

                icon = Users;

                iconStyle =
                  "bg-violet-50 text-violet-600";

                priorityStyle =
                  "bg-violet-50 text-violet-700";
              }


              const InsightIcon = icon;


              return (

                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >

                  <div className="flex items-start gap-4">


                    <div
                      className={`rounded-xl p-3 ${iconStyle}`}
                    >

                      <InsightIcon size={20} />

                    </div>


                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-semibold text-slate-900">
                          {insight.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyle}`}
                        >
                          {insight.priority}
                        </span>

                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {insight.message}
                      </p>

                    </div>

                  </div>

                </div>

              );

            })

          )}

        </div>

      </section>
*/}

       {/* =====================================================
          SALES + CUSTOMER INTELLIGENCE
          ===================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">


        {/* SALES */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">

                <TrendingUp size={20} />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Sales Intelligence
                </h2>

                <p className="text-sm text-slate-500">
                  Strongest sales indicators.
                </p>

              </div>

            </div>

          </div>


          <div className="space-y-4">


            {/* TOP PRODUCT */}

            {sales.top_product && (

              <div className="rounded-xl bg-blue-50 p-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Top Product
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {sales.top_product.name}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {sales.top_product.units_sold} units sold
                </p>

              </div>

            )}


            {/* TOP CATEGORY */}

            {sales.top_category && (

              <div className="rounded-xl bg-emerald-50 p-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Top Category
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {sales.top_category.category}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {sales.top_category.units_sold} units sold
                </p>

              </div>

            )}

          </div>

        </div>


        {/* CUSTOMERS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">

                <Users size={20} />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Customer Intelligence
                </h2>

                <p className="text-sm text-slate-500">
                  Strongest customer indicators.
                </p>

              </div>

            </div>

          </div>


          <div className="space-y-4">


            {/* TOP CUSTOMER */}

            {customers.top_customer && (

              <div className="rounded-xl bg-violet-50 p-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                  Highest-Spending Customer
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {customers.top_customer.name}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Rs.{" "}
                  {Number(
                    customers.top_customer.spending
                  ).toLocaleString()}
                </p>

              </div>

            )}


            {/* AGE GROUP */}

            <div className="rounded-xl bg-orange-50 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                Largest Age Segment
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {customers.dominant_age_group}
              </p>

            </div>


            {/* LOCATION */}

            {customers.dominant_location && (

              <div className="rounded-xl bg-pink-50 p-4">

                <div className="flex items-center gap-2">

                  <MapPin
                    size={16}
                    className="text-pink-600"
                  />

                  <p className="text-xs font-semibold uppercase tracking-wide text-pink-600">
                    Dominant Location
                  </p>

                </div>

                <p className="mt-2 font-semibold text-slate-900">
                  {customers.dominant_location.location}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {customers.dominant_location.customers} customer
                  {customers.dominant_location.customers !== 1
                    ? "s"
                    : ""}
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

          {/* =====================================================
          ABC PRODUCT CLASSIFICATION
          ===================================================== */}

      <section>

        <div className="mb-5">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
            Inventory Intelligence
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Product Classification (ABC Analysis)
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Products ranked by revenue contribution — Class A drives the
            majority of revenue and deserves the most attention.
          </p>

        </div>

        {/* Summary cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          {["A", "B", "C"].map((cls) => {

            const classProducts = inventory.abc_classification.filter(
              (p) => p.class === cls
            );
            const classRevenue = classProducts.reduce(
              (sum, p) => sum + p.revenue, 0
            );
            const totalRevenue = inventory.abc_classification.reduce(
              (sum, p) => sum + p.revenue, 0
            );
            const sharePercent = totalRevenue > 0
              ? Math.round((classRevenue / totalRevenue) * 100)
              : 0;

            const styles = {
              A: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", bar: "bg-emerald-500" },
              B: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", bar: "bg-amber-500" },
              C: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", bar: "bg-slate-400" },
            }[cls];

            return (
              <div
                key={cls}
                className={`rounded-2xl border ${styles.border} ${styles.bg} p-5`}
              >
                <p className={`text-sm font-semibold ${styles.text}`}>
                  Class {cls}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {classProducts.length}
                  <span className="ml-1 text-sm font-normal text-slate-500">
                    products
                  </span>
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full ${styles.bar}`}
                    style={{ width: `${sharePercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {sharePercent}% of total revenue
                </p>
              </div>
            );
          })}

        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="min-w-full text-sm">

              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

                <tr>

                  <th className="px-6 py-4 font-semibold">
                    Product
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Revenue
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Class
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {inventory.abc_classification.map((product) => {

                  const borderColor = {
                    A: "border-l-emerald-500",
                    B: "border-l-amber-500",
                    C: "border-l-slate-300",
                  }[product.class];

                  return (
                    <tr
                      key={product.product_id}
                      className={`border-l-4 ${borderColor} transition hover:bg-slate-50`}
                    >

                      <td className="px-6 py-4 font-medium text-slate-800">
                        {product.product_name}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        Rs. {product.revenue.toLocaleString()}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            product.class === "A"
                              ? "bg-emerald-50 text-emerald-700"
                              : product.class === "B"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          Class {product.class}
                        </span>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        </div>

      </section>


      {/* =====================================================
          DATA REFRESH NOTE
          ===================================================== */}

      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <div className="rounded-lg bg-white p-2 text-slate-600 shadow-sm">

          <RefreshCw size={18} />

        </div>

        <div>

          <p className="text-sm font-medium text-slate-800">
            Intelligence is data-driven
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            These insights are generated from the current
            inventory, sales, and customer records. As new
            purchases and customer data are added, the analysis
            automatically changes.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Intelligence;