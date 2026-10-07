/*remove click garda cart ma number 0 dekhako xaina*/
import { useState, useEffect } from "react"; /**useEffect lets us run the API request when the homepage loads */

import { Check } from "lucide-react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductSection from "./components/ProductSection";
import ProductDetails from "./components/ProductDetails";
import Features from "./components/Features";
import About from "./components/About";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import CartDrawer from "./components/CartDrawer";
import CategorySection from "./components/CategorySection";
import OfferSection from "./components/OfferSection";
import BenefitsSection from "./components/BenefitSection";
import CommunitySection from "./components/CommunitySection";
import Shop from "./components/Shop";
import Auth from "./components/Auth";
import ResetPassword from "./components/ResetPassword";
import ChatWidget from "./components/ChatWidget";
import KhaltiVerify from "./components/KhaltiVerify";

function App() {

  
  // Keeps track of which page the user is viewing
  const [currentPage, setCurrentPage] = useState("home"); //useState() is a React Hook that must be called inside component function

  const [userRole, setUserRole] = useState(
  localStorage.getItem("customer_role")
  );

  // Keeps track of the number shown on the cart icon
  const [cartCount, setCartCount] = useState(0);

  //for messges added to cart
  const [toastMessage, setToastMessage] = useState("");

  //guest cart 
  const [guestCart, setGuestCart] = useState(() => {
  const savedCart = localStorage.getItem("guest_cart");

  return savedCart
    ? JSON.parse(savedCart)
    : [];
});

useEffect(() => {
  localStorage.setItem(
    "guest_cart",
    JSON.stringify(guestCart)
  );
}, [guestCart]);

  const [isLoggedIn, setIsLoggedIn] = useState(
  !!localStorage.getItem("access_token") //!!token=ture if !!null=false
);

 if (window.location.pathname === "/reset-password") {
  return (
    <ResetPassword
      onBackToLogin={() => {
        window.history.pushState(
          {},
          "",
          "/"
        );

        window.location.reload();
      }}
    />
  );
}
  // Stores whatever the customer types into the search bar
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);

  // What the Shop page should show (set by navbar links, categories, etc.)
  const [shopView, setShopView] = useState({
    category: "All",
    subcategory: null,
    saleOnly: false,
  });

  // Controls whether the cart drawer is visible
  const [isCartOpen, setIsCartOpen] = useState(false);
 
  // Handles Add to Cart
  const handleAddToCart = async (product, quantity = 1) => {

  const token = localStorage.getItem("access_token");

  // =======================================================
  // GUEST CART
  // =======================================================

  if (!token) {

    setGuestCart((previousCart) => {

      const existingItem = previousCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {

        return previousCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + quantity,
              }
            : item
        );

      }

      return [
        ...previousCart,
        {
          ...product,
          quantity,
        },
      ];
    });

    setCartCount((previousCount) =>
      previousCount + quantity
    );

     setToastMessage(
      "Product added to cart"
    );

    setTimeout(() => {
      setToastMessage("");
    }, 2500);

    return;
  }

  // =======================================================
  // LOGGED-IN CUSTOMER CART
  // =======================================================

  const customerId =
    localStorage.getItem("customer_id");

  if (!customerId) {
    return;
  }

  try {

    const response = await fetch(
      `http://127.0.0.1:8000/cart/${customerId}/items`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          product_id: product.id,
          quantity,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Add to cart failed:",
        data
      );
      return;
    }

    console.log(
      "Added to cart:",
      data
    );

    await fetchCartCount();

    setToastMessage(
      "Product added to cart"
    );

    setTimeout(() => {
      setToastMessage("");
    }, 2500);

  } catch (error) {

    console.error(
      "Add to cart error:",
      error
    );

  }
}; 

//cart count
const fetchCartCount = async () => {

  const customerId = localStorage.getItem("customer_id");

  const token =
    localStorage.getItem("access_token");

  // Guest cart
  if (!token || !customerId) {

    const savedCart =
      localStorage.getItem("guest_cart");

    if (!savedCart) {
      setCartCount(0);
      return;
    }

    const guestItems =
      JSON.parse(savedCart);

    const count =
      guestItems.reduce(
        (total, item) =>
          total + item.quantity,
        0
      );

    setCartCount(count);
    return;
  }

  if (!customerId) {
    setCartCount(0);
    return;
  }

  try {

    const response = await fetch(
      `http://127.0.0.1:8000/cart/${customerId}/count`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Unable to get cart count:", data);
      return;
    }

    setCartCount(data.cart_count);

  } catch (error) {

    console.error("Cart count error:", error);

  }
};

useEffect(() => {
  fetchCartCount();
}, []);

/*const openDashboard = () => {
  setCurrentPage("dashboard");
};*/

//provides the respective page 
const handleLoginSuccess = async (role) => {

  setUserRole(role);
  setIsLoggedIn(true);

  if (role === "customer") {

    await transferGuestCartToCustomer();

    setCurrentPage("checkout");

    return;
  }

  if (
    role === "admin" ||
    role === "employee"
  ) {
    setCurrentPage("dashboard");
    return;
  }

  setCurrentPage("home");
};

//handling the proceed to checkout
const handleProceedToCheckout = () => {

  setIsCartOpen(false);

  const token =
    localStorage.getItem("access_token");

  if (!token) {
    setCurrentPage("auth");
    return;
  }

  setCurrentPage("checkout");
};

///merging the guest cart into authenticated part, works as a helper
const transferGuestCartToCustomer = async () => {

  const token =
    localStorage.getItem("access_token");

  const customerId =
    localStorage.getItem("customer_id");

  const savedCart =
    localStorage.getItem("guest_cart");

  if (!token || !customerId || !savedCart) {
    return;
  }

  const items =
    JSON.parse(savedCart);

  for (const item of items) {

    try {

      await fetch(
        `http://127.0.0.1:8000/cart/${customerId}/items`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            product_id: item.id,
            quantity: item.quantity,
          }),
        }
      );

    } catch (error) {

      console.error(
        "Guest cart transfer error:",
        error
      );

    }
  }

  localStorage.removeItem("guest_cart");
  setGuestCart([]);
};

//logout
const handleLogout = () => {
  // Remove saved authentication information
  localStorage.removeItem("access_token");
  localStorage.removeItem("customer_id");
  localStorage.removeItem("customer_name");
  localStorage.removeItem("customer_email");
  localStorage.removeItem("customer_role");

  // Update React state
  setIsLoggedIn(false);
  setUserRole(null);
  setCartCount(0);
  setCurrentPage("home");
};

//central navigation funxtion
// Opens the Shop page with the given filter
// e.g. openShop() = everything, openShop({ saleOnly: true }), openShop({ category: "Lips" })
const openShop = ({
  category = "All",
  subcategory = null,
  saleOnly = false,
} = {}) => {
  setShopView({ category, subcategory, saleOnly });
  setCurrentPage("shop");
  window.scrollTo({ top: 0 });
};

// Features / About / Categories now live on the homepage,
// so those links take the customer home and scroll to the section
const scrollToHomeSection = (sectionId) => {
  setCurrentPage("home");

  setTimeout(() => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth" });
  }, 100);
};

const handleNavigate = (page) => {
  if (page === "shop") {
    openShop();
    return;
  }

  if (
    page === "features" ||
    page === "about" ||
    page === "categories"
  ) {
    scrollToHomeSection(page);
    return;
  }

  setCurrentPage(page);
};

const handleViewDetails = (product) => {
  setSelectedProduct(product);
  setCurrentPage("product-details");
  window.scrollTo({ top: 0 });
};

const handleSearch = () => {
  openShop();
};

const handleClearSearch = () => {
  setSearchTerm("");
};

const [showKhaltiVerify, setShowKhaltiVerify] = useState(
  () => window.location.pathname === "/khalti/verify"
);

if (showKhaltiVerify) {
  return (
    <KhaltiVerify onDone={() => { setShowKhaltiVerify(false); setCurrentPage("home"); }} />
  );
}

return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Navigation */}
      {currentPage !== "dashboard" && (
      <Navbar
        onAuthClick={() => setCurrentPage("auth")}
        onCartClick={() => setIsCartOpen(true)}
        onHomeClick={() => setCurrentPage("home")}
        onOpenShop={openShop}
        onViewDetails={handleViewDetails}
        onSearch={handleSearch}
        cartCount={cartCount}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentPage={currentPage}
        shopView={shopView}
      />
      )}

      {/* Show homepage */}
      {currentPage === "home" && (
        <>
          <Hero />

          <div id="categories" className="scroll-mt-32">
            <CategorySection
              onCategoryClick={(category) => openShop({ category })}
            />
          </div>

             <OfferSection
            onCreateAccount={() => setCurrentPage("auth")}
          />

          <ProductSection
             onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
              onViewMore={() => handleNavigate("shop")}
          />

          {/* Features (moved here from the navbar) */}
          <div id="features" className="scroll-mt-32">
            <Features embedded />
          </div>

          {/* About Us (moved here from the navbar) */}
         {/**  <div id="about" className="scroll-mt-32">
            <About embedded />
          </div>
              */}
          {/* Why Shop With Us */}
          <BenefitsSection />
          
          <CommunitySection />

          <Footer 
            onNavigate={handleNavigate}
          />

          
         {/*<button
            onClick={openDashboard}
            className="fixed bottom-6 right-6 cursor-pointer rounded-full bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-gray-700"
          >
            Dashboard
          </button>*/}
        </>
      )}

      {currentPage === "product-details" && selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onBack={() => setCurrentPage("shop")}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
        />
      )}

      {/*shows shop page */}
      {currentPage === "shop" && (
        <>
        <Shop
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
          key={JSON.stringify(shopView)} //fresh filters whenever a navbar link changes the view
          initialCategory={shopView.category}
          initialSubcategory={shopView.subcategory}
          saleOnly={shopView.saleOnly}
          searchTerm={searchTerm}
          onClearSearch={handleClearSearch}
          onBrowseAll={() => openShop()}
        />

        <Footer
          onNavigate={handleNavigate}
        />
      </>
      )}

      {/**shows features page*/}
      {currentPage === "features" && (
        <>
          <Features />

          <Footer
            onNavigate={handleNavigate}
          />
        </>
      )}

      {/**shows about page */}
      {currentPage === "about" && (
        <>
          <About />

          <Footer
            onNavigate={handleNavigate}
          />
        </>
      )}

      {/*the login sign up page */}
      {currentPage === "auth" && (
        <Auth
          onBack={() => setCurrentPage("home")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Show cart page */}
      {currentPage === "cart" && (
        <Cart 
          onHomeClick={() => setCurrentPage("home")}
          onCartUpdate={fetchCartCount}
          onCheckoutClick={() => setCurrentPage("checkout")}
          />
      )}

      {currentPage === "checkout" && (
      <Checkout
        onHomeClick={() => setCurrentPage("home")}
        onOrderComplete={() => setCartCount(0)} //shows cart count 0 after succeful checkout
      />
    )}

       {currentPage === "dashboard" && (
        <DashboardLayout role={userRole} />
      )}

     {toastMessage && (
      <div className="fixed bottom-6 left-6 z-[200] animate-[slideIn_0.25s_ease-out]">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-rose-300 bg-white px-5 py-4 shadow-2xl">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-pink-600">
            <Check size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              Added to cart
            </p>

            <p className="mt-0.5 text-xs text-slate-600">
              Product added to your cart successfully.
            </p>
          </div>

        </div>
      </div>
    )}

      <CartDrawer
      
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleProceedToCheckout}
        onCartUpdate={fetchCartCount}
      />

      {userRole !== "admin" && userRole !== "employee" && (
        <ChatWidget onViewDetails={handleViewDetails} />
      )}

      {/* Login sliding panel 
      <Login
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess} //login component can communicate the role to App
      /> */}

    </div>
  );
}

export default App;