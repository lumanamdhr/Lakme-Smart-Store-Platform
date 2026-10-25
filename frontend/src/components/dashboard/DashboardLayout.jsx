import { useEffect, useState } from "react";

import {
  Package,
  Boxes,
  AlertTriangle,
  CircleOff,
} from "lucide-react";

import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import StatCard from "./StatCard";

import Inventory from "../Inventory";
import Sales from "../Sales";
import Customers from "../Customers";
import Intelligence from "../Intelligence";
import UserManangement from "../Users";


function DashboardLayout({ role }) {

  const [activeSection, setActiveSection] = useState(
    () => localStorage.getItem("dashboard_section") || "Overview"
  );

  // Remember the section so a reload returns here
  useEffect(() => {
    localStorage.setItem("dashboard_section", activeSection);
  }, [activeSection]);
     // Product picked in the header search; Inventory opens filtered to it
  const [inventorySearch, setInventorySearch] =
    useState("");

  const [inventory, setInventory] =
    useState(null);

  const [inventoryDetails, setInventoryDetails] =
    useState(null);


  // =========================================================
  // FETCH INVENTORY DATA
  // =========================================================

  useEffect(() => {

    const fetchInventory = async () => {

      try {

        // ---------------------------------------------------
        // INVENTORY SUMMARY
        // ---------------------------------------------------

        const response = await fetch(
          "http://127.0.0.1:8000/dashboard/inventory"
        );


        const data = await response.json();


        if (!response.ok) {

          console.error(
            "Inventory API error:",
            data
          );

          return;
        }


        // Store inventory summary
        setInventory(data);


        // ---------------------------------------------------
        // INVENTORY DETAILS
        // ---------------------------------------------------

        const detailsResponse = await fetch(
          "http://127.0.0.1:8000/dashboard/inventory/details"
        );


        const detailsData =
          await detailsResponse.json();


        if (detailsResponse.ok) {

          setInventoryDetails(
            detailsData
          );

        }

      } catch (error) {

        console.error(
          "Failed to fetch inventory:",
          error
        );

      }

    };


    fetchInventory();

  }, []);


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="flex min-h-screen bg-slate-50">


      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <DashboardSidebar
        role={role}
        activeSection={activeSection}
        onSectionChange={(section) => {
          setInventorySearch(""); // clicking the sidebar clears any picked product
          setActiveSection(section);
   }}
      />


      {/* =====================================================
          MAIN AREA
          ===================================================== */}

      <div className="flex-1">


        {/* ===================================================
            HEADER
            =================================================== */}

        <DashboardHeader
          role={role}

          onLogout={() => {

            localStorage.removeItem(
              "access_token"
            );

            localStorage.removeItem(
              "customer_id"
            );

            localStorage.removeItem(
              "customer_name"
            );

            localStorage.removeItem(
              "customer_email"
            );

            localStorage.removeItem(
              "customer_role"
            );

            window.location.reload();

          }}
            onNavigate={setActiveSection}
            onSelectProduct={(product) => {
                setInventorySearch(product.name);
                setActiveSection("Inventory");
              }}   
          
        />


        {/* ===================================================
            MAIN CONTENT
            =================================================== */}

        <main className="min-w-0 p-6 lg:p-8">


          {/* =================================================
              OVERVIEW
              ================================================= */}

          {activeSection === "Overview" && (

            <div className="pt-1">


              {/* PAGE TITLE */}

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
                  Dashboard
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  Overview
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  A high-level view of your store's current
                  performance and operations.
                </p>

              </div>


              {/* SUMMARY CARDS */}

              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">


                {/* =================================================
                    TOTAL PRODUCTS
                    ================================================= */}

                <StatCard
                  title="Total Products"
                  value={
                    inventory
                      ? inventory.total_products
                      : "—"
                  }
                  description="Products currently in the catalog"
                  icon={Package}
                  iconBg="bg-indigo-50"
                  iconColor="text-indigo-600"
                />


                {/* =================================================
                    TOTAL STOCK
                    ================================================= */}

                <StatCard
                  title="Total Stock"
                  value={
                    inventory
                      ? inventory.total_stock
                      : "—"
                  }
                  description="Units currently available"
                  icon={Boxes}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                />


                {/* =================================================
                    LOW STOCK
                    ================================================= */}

                <StatCard
                  title="Low Stock"
                  value={
                    inventory
                      ? inventory.low_stock
                      : "—"
                  }
                  description="Products needing attention"
                  icon={AlertTriangle}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-600"
                />


                {/* =================================================
                    OUT OF STOCK
                    ================================================= */}

                <StatCard
                  title="Out of Stock"
                  value={
                    inventory
                      ? inventory.out_of_stock
                      : "—"
                  }
                  description="Products currently unavailable"
                  icon={CircleOff}
                  iconBg="bg-red-50"
                  iconColor="text-red-600"
                />

              </div>


              {/* =================================================
                  QUICK SUMMARY
                  ================================================= */}

              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-start gap-4">

                  <div className="rounded-xl bg-violet-50 p-3 text-violet-600">

                    <Package size={20} />

                  </div>

                  <div>

                    <h2 className="text-lg font-semibold text-slate-900">
                      Store Overview
                    </h2>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                      Use the sections in the sidebar to explore
                      inventory, sales, customer behavior, and
                      business intelligence.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              INVENTORY
              ================================================= */}

          {activeSection === "Inventory" && (

              <Inventory
                role={role}
                key={inventorySearch}
                initialSearch={inventorySearch}
              />

          )}


          {/* =================================================
              SALES
              ================================================= */}

          {activeSection === "Sales" && (

            <Sales role={role} />

          )}


          {/* =================================================
              CUSTOMERS
              ================================================= */}

          {activeSection === "Customers" && (

            <Customers role={role} />

          )}


          {/* =================================================
              INTELLIGENCE
              ================================================= */}

          {activeSection === "Intelligence" && (

            <Intelligence />

          )}

          {/**users */}
          {activeSection === "User Management" && (
            <UserManangement />
          )}

        </main>

      </div>

    </div>
  );
}


export default DashboardLayout;