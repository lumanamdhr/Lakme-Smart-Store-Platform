import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  KeyRound,
  Mail,
} from "lucide-react";
   import GoogleSection from "./GoogleSection";


function Auth({
  onBack,
  onLoginSuccess,
}) {
  // Controls Login, Signup or Forgot Password
  const [mode, setMode] = useState("login");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");

  // Email verification (a code is sent once, at signup)
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

     // Counts down the "Resend code" cooldown
     useEffect(() => {
       if (resendSeconds <= 0) return;
       const timer = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
       return () => clearTimeout(timer);
     }, [resendSeconds]);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Messages
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({});

  // Loading state
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // SWITCH MODE
  // --------------------------------------------------

  const switchMode = (newMode) => {
    setMode(newMode);
    setMessage("");
    setMessageType("");
    setErrors({});

    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // --------------------------------------------------
  // VALIDATION HELPERS
  // --------------------------------------------------

  // Name should contain letters only.
  // Spaces, hyphens and apostrophes are allowed.
  const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

  // Email validation
  const emailRegex =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  // Location validation
  // Allows letters, spaces, hyphens and commas.
  const locationRegex = /^[A-Za-z]+(?:[A-Za-z ,'-]*[A-Za-z])?$/;

  // --------------------------------------------------
  // LOGIN VALIDATION
  // --------------------------------------------------

  const validateLogin = () => {
    const newErrors = {};

    const email = loginEmail.trim();

    if (!email) {
      newErrors.loginEmail = "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.loginEmail =
        "Please enter a valid email address.";
    }

    if (!loginPassword) {
      newErrors.loginPassword = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------
  // SIGNUP VALIDATION
  // --------------------------------------------------

  const validateSignup = () => {
    const newErrors = {};

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = signupEmail.trim();
    const cleanLocation = location.trim();

    // First Name
    if (!cleanFirstName) {
      newErrors.firstName = "First name is required.";
    } else if (!nameRegex.test(cleanFirstName)) {
      newErrors.firstName =
        "First name can contain letters, spaces, hyphens and apostrophes only.";
    }

    // Last Name
    if (!cleanLastName) {
      newErrors.lastName = "Last name is required.";
    } else if (!nameRegex.test(cleanLastName)) {
      newErrors.lastName =
        "Last name can contain letters, spaces, hyphens and apostrophes only.";
    }

    // Date of Birth
    if (!dateOfBirth) {
      newErrors.dateOfBirth =
        "Date of birth is required.";
    } else {
      const selectedDate = new Date(dateOfBirth);
      const today = new Date();

      // Remove time from today's date
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        newErrors.dateOfBirth =
          "Date of birth cannot be in the future.";
      }
    }

    // Gender
    if (!gender) {
      newErrors.gender =
        "Please select your gender.";
    }

    // Location
    if (!cleanLocation) {
      newErrors.location =
        "Location is required.";
    } else if (!locationRegex.test(cleanLocation)) {
      newErrors.location =
        "Please enter a valid location.";
    }

    // Email
    if (!cleanEmail) {
      newErrors.signupEmail =
        "Email is required.";
    } else if (!emailRegex.test(cleanEmail)) {
      newErrors.signupEmail =
        "Please enter a valid email address.";
    }

    // Password
    if (!signupPassword) {
      newErrors.signupPassword =
        "Password is required.";
    } else if (signupPassword.length < 8) {
      newErrors.signupPassword =
        "Password must contain at least 8 characters.";
    } else if (!/[A-Z]/.test(signupPassword)) {
      newErrors.signupPassword =
        "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(signupPassword)) {
      newErrors.signupPassword =
        "Password must contain at least one lowercase letter.";
    } else if (!/[0-9]/.test(signupPassword)) {
      newErrors.signupPassword =
        "Password must contain at least one number.";
    }

    // Confirm Password
    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (signupPassword !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------
  // FORGOT PASSWORD VALIDATION
  // --------------------------------------------------

  const validateForgotPassword = () => {
    const newErrors = {};

    const email = forgotEmail.trim();

    if (!email) {
      newErrors.forgotEmail =
        "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.forgotEmail =
        "Please enter a valid email address.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  //verification process
       const goToVerify = (email) => {
       setVerifyEmail(email);
       setVerifyCode("");
       setErrors({});
       setMode("verify");
       setResendSeconds(60);
       setMessage(`We sent a 6-digit code to ${email}. Enter it below to verify your email.`);
       setMessageType("success");
     };

     const requestNewCode = async (email) => {
       try {
         await fetch("http://127.0.0.1:8000/resend-verification", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ email }),
         });
       } catch (error) {
         console.error("Resend code error:", error);
       }
     };

     const handleVerify = async (event) => {
       event.preventDefault();
       setMessage("");
       setMessageType("");

       if (!/^\d{6}$/.test(verifyCode.trim())) {
         setMessage("Please enter the 6-digit code.");
         setMessageType("error");
         return;
       }

       setLoading(true);

       try {
         const response = await fetch("http://127.0.0.1:8000/verify-email", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ email: verifyEmail, code: verifyCode.trim() }),
         });
         const data = await response.json();

         if (!response.ok) {
           setMessage(typeof data.detail === "string" ? data.detail : "Verification failed.");
           setMessageType("error");
           return;
         }

         setLoginEmail(verifyEmail);
         setVerifyCode("");
         setMode("login");
         setMessage("Email verified! You can now log in.");
         setMessageType("success");
       } catch (error) {
         console.error("Verify error:", error);
         setMessage("Unable to connect to the server.");
         setMessageType("error");
       } finally {
         setLoading(false);
       }
     };

     const handleResend = async () => {
       if (resendSeconds > 0) return;
       await requestNewCode(verifyEmail);
       setResendSeconds(60);
       setMessage("A new code has been sent. Please check your email.");
       setMessageType("success");
     };


       const handleGoogleLogin = async (credential) => {
       setMessage("");
       setMessageType("");
       setLoading(true);

       try {
         const response = await fetch("http://127.0.0.1:8000/auth/google", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ credential }),
         });
         const data = await response.json();

         if (!response.ok) {
           setMessage(typeof data.detail === "string" ? data.detail : "Google sign-in failed.");
           setMessageType("error");
           return;
         }

         // Same saved info as a normal login
         localStorage.setItem("access_token", data.access_token);
         localStorage.setItem("customer_id", data.customer_id);
         localStorage.setItem("customer_name", data.name);
         localStorage.setItem("customer_email", data.email);
         localStorage.setItem("customer_role", data.role);

         setMessage("Login successful.");
         setMessageType("success");

         setTimeout(() => {
           onLoginSuccess(data.role);
         }, 500);
       } catch (error) {
         console.error("Google login error:", error);
         setMessage("Unable to connect to the server.");
         setMessageType("error");
       } finally {
         setLoading(false);
       }
     };

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!validateLogin()) {
      return;
    }

    setLoading(true);

    try {
      // OAuth2 expects form data
      const formData = new URLSearchParams();

      formData.append(
        "username",
        loginEmail.trim()
      );

      formData.append(
        "password",
        loginPassword
      );

      const response = await fetch(
        "http://127.0.0.1:8000/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Right password, but the email was never verified: send a fresh code
           if (response.status === 403 && data.detail === "EMAIL_NOT_VERIFIED") {
             await requestNewCode(loginEmail.trim());
             goToVerify(loginEmail.trim());
             return;
           }
        const errorMessage =
          typeof data.detail === "string"
            ? data.detail
            : "Login failed.";

        setMessage(errorMessage);
        setMessageType("error");
        return;
      }

      // Save authentication information
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "customer_id",
        data.customer_id
      );

      localStorage.setItem(
        "customer_name",
        data.name
      );

      localStorage.setItem(
        "customer_email",
        data.email
      );

      localStorage.setItem(
        "customer_role",
        data.role
      );

      setMessage("Login successful.");
      setMessageType("success");

      // Tell App about the logged-in user's role
      setTimeout(() => {
        onLoginSuccess(data.role);
      }, 500);

    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Unable to connect to the server."
      );

      setMessageType("error");

    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // SIGN UP
  // --------------------------------------------------

  const handleSignup = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!validateSignup()) {
      return;
    }

    setLoading(true);

    try {
      // Combine first and last name
      const fullName =
        `${firstName.trim()} ${lastName.trim()}`.trim();

      const response = await fetch(
        "http://127.0.0.1:8000/customers",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: fullName,
            email: signupEmail.trim(),
            password: signupPassword,
            date_of_birth: dateOfBirth,
            gender: gender,
            location: location.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          typeof data.detail === "string"
            ? data.detail
            : "Unable to create account.";

        setMessage(errorMessage);
        setMessageType("error");
        return;
      }

    // Account created: ask for the code that was just emailed
    goToVerify(signupEmail.trim());
      
    } catch (error) {
      console.error("Signup error:", error);

      setMessage(
        "Unable to connect to the server."
      );

      setMessageType("error");

    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FORGOT PASSWORD
  // --------------------------------------------------

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!validateForgotPassword()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: forgotEmail.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          typeof data.detail === "string"
            ? data.detail
            : "Unable to process your request.";

        setMessage(errorMessage);
        setMessageType("error");
        return;
      }

      setMessage(
        "If an account with this email exists, a password reset link has been sent."
      );

      setMessageType("success");

    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setMessage(
        "Unable to connect to the server."
      );

      setMessageType("error");

    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 px-6 py-10">

      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <button
          onClick={onBack}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-rose-600"
        >
          <ArrowLeft size={17} />
          Back to Home
        </button>

        <div className="mt-8 grid overflow-hidden rounded-[2rem] bg-white shadow-xl lg:grid-cols-2">

          {/* Left visual section */}
          <div className="relative hidden min-h-[650px] overflow-hidden bg-gradient-to-br from-rose-200 via-pink-100 to-amber-100 lg:block">

            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/30" />

            <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-rose-300/30" />

            <div className="relative z-10 flex h-full flex-col justify-center px-14">

              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-700">
                Beauty & You
              </p>

              <h1 className="mt-5 max-w-md text-5xl font-semibold leading-tight text-gray-900">
                Your beauty journey starts here.
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-gray-600">
                Sign in to continue shopping or create an account
                and discover your favorite Lakmé beauty essentials.
              </p>

            </div>
          </div>

          {/* Right form section */}
          <div className="px-7 py-10 sm:px-12 sm:py-14">

            {/* Mobile brand */}
            <div className="lg:hidden">

              <p className="text-center text-2xl font-semibold tracking-[0.25em] text-gray-900">
                LAKMÉ
              </p>

            </div>

            {/* Heading */}
            <div className="mt-6 text-center">

              <h2 className="mt-3 text-3xl font-semibold text-rose-500">

                {mode === "login"
                  ? "Welcome"
                  : mode === "signup"
                  ? "Create Your Account"
                  : mode === "verify"
                  ? "Verify Your Email"
                  : "Forgot Password"}

              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">

                {mode === "login"
                  ? "Log in to continue your beauty journey."
                  : mode === "signup"
                  ? "Create your account and discover more from Lakmé."
                  : mode === "verify"
                  ? "Enter the 6-digit code we emailed you."
                  : "Enter your registered email address to reset your password."}

              </p>

            </div>

            {/* Login / Signup switch */}
            {mode !== "forgot" && mode !== "verify" && (
              <div className="mx-auto mt-8 flex max-w-sm rounded-full bg-stone-100 p-1">

                <button
                  type="button"
                  onClick={() =>
                    switchMode("login")
                  }
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition ${
                    mode === "login"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  <LogIn size={16} />
                  Login
                </button>

                <button
                  type="button"
                  onClick={() =>
                    switchMode("signup")
                  }
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition ${
                    mode === "signup"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  <UserPlus size={16} />
                  Sign Up
                </button>

              </div>
        )}

            {/* Messages */}
            {message && (
              <div
                className={`mx-auto mt-6 max-w-sm rounded-xl px-4 py-3 text-sm ${
                  messageType === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {message}
              </div>
            )}

                {/* ================================================= */}
                {/* VERIFY EMAIL FORM */}
                {/* ================================================= */}

            {mode === "verify" && (
                 <form
                   onSubmit={handleVerify}
                   className="mx-auto mt-8 max-w-sm space-y-5"
                 >
                   <div className="flex justify-center">
                     <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                       <Mail size={25} />
                     </div>
                   </div>

                   <div>
                     <label className="mb-2 block text-sm font-medium text-gray-700">
                       Verification code
                     </label>

                     <input
                       type="text"
                       inputMode="numeric"
                       maxLength={6}
                       value={verifyCode}
                       onChange={(event) =>
                         setVerifyCode(event.target.value.replace(/\D/g, ""))
                       }
                       autoComplete="one-time-code"
                       placeholder="000000"
                       className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-center text-2xl tracking-[0.5em] text-gray-800 outline-none transition focus:border-rose-300 focus:bg-white"
                     />
                   </div>

                   <button
                     type="submit"
                     disabled={loading}
                     className="w-full cursor-pointer rounded-full bg-gray-900 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                   >
                     {loading ? "Verifying..." : "Verify Email"}
                   </button>

                   <button
                     type="button"
                     onClick={handleResend}
                     disabled={resendSeconds > 0}
                     className="w-full cursor-pointer text-sm font-medium text-gray-500 hover:text-rose-600 disabled:cursor-not-allowed disabled:text-gray-300"
                   >
                     {resendSeconds > 0
                       ? `Resend code in ${resendSeconds}s`
                       : "Resend code"}
                   </button>

                   <button
                     type="button"
                     onClick={() => switchMode("login")}
                     className="w-full cursor-pointer text-sm font-medium text-gray-500 hover:text-rose-600"
                   >
                     ← Back to Login
                   </button>
                 </form>
            )}

            {/* ================================================= */}
            {/* LOGIN FORM */}
            {/* ================================================= */}

            {mode === "login" && (
              <form
                onSubmit={handleLogin}
                className="mx-auto mt-8 max-w-sm space-y-5"
              >

                {/* Email */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <input
                    type="text"
                    name="email"
                    value={loginEmail}
                    onChange={(event) =>
                      setLoginEmail(event.target.value)
                    }
                    autoComplete="email"
                    placeholder="Enter your email"
                    className={`w-full rounded-xl border ${
                      errors.loginEmail
                        ? "border-red-400"
                        : "border-stone-200"
                    } bg-stone-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-rose-300 focus:bg-white`}
                  />

                  {errors.loginEmail && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.loginEmail}
                    </p>
                  )}

                </div>

                {/* Password */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={loginPassword}
                      onChange={(event) =>
                        setLoginPassword(event.target.value)
                      }
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={`w-full rounded-xl border ${
                        errors.loginPassword
                          ? "border-red-400"
                          : "border-stone-200"
                      } bg-stone-50 px-4 py-3 pr-12 text-sm text-gray-800 outline-none transition focus:border-rose-300 focus:bg-white`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-2 text-gray-400 hover:text-rose-600"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                  {errors.loginPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.loginPassword}
                    </p>
                  )}

                </div>

                {/* Forgot password */}
                <div className="text-right">

                  <button
                    type="button"
                    onClick={() =>
                      switchMode("forgot")
                    }
                    className="cursor-pointer text-sm font-medium text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Forgot Password?
                  </button>

                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer rounded-full bg-gray-900 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {loading
                    ? "Logging in..."
                    : "Login"}
                </button>
              <GoogleSection onCredential={handleGoogleLogin} />
              </form>
            )}

            {/* ================================================= */}
            {/* SIGNUP FORM */}
            {/* ================================================= */}

            {mode === "signup" && (
              <form
                onSubmit={handleSignup}
                className="mx-auto mt-8 max-w-sm space-y-5"
              >

                {/* First + Last Name */}
                <div className="grid gap-4 sm:grid-cols-2">

                  {/* First Name */}
                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      First Name
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      value={firstName}
                      onChange={(event) =>
                        setFirstName(event.target.value)
                      }
                      autoComplete="given-name"
                      placeholder="First name"
                      className={`w-full rounded-xl border ${
                        errors.firstName
                          ? "border-red-400"
                          : "border-stone-200"
                      } bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white`}
                    />

                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.firstName}
                      </p>
                    )}

                  </div>

                  {/* Last Name */}
                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Last Name
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      value={lastName}
                      onChange={(event) =>
                        setLastName(event.target.value)
                      }
                      autoComplete="family-name"
                      placeholder="Last name"
                      className={`w-full rounded-xl border ${
                        errors.lastName
                          ? "border-red-400"
                          : "border-stone-200"
                      } bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white`}
                    />

                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lastName}
                      </p>
                    )}

                  </div>

                </div>

                {/* Date of Birth */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={dateOfBirth}
                    onChange={(event) =>
                      setDateOfBirth(event.target.value)
                    }
                    className={`w-full rounded-xl border ${
                      errors.dateOfBirth
                        ? "border-red-400"
                        : "border-stone-200"
                    } bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white`}
                  />

                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.dateOfBirth}
                    </p>
                  )}

                </div>

                {/* Gender */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={gender}
                    onChange={(event) =>
                      setGender(event.target.value)
                    }
                    className={`w-full rounded-xl border ${
                      errors.gender
                        ? "border-red-400"
                        : "border-stone-200"
                    } bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white`}
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Other">
                      Other
                    </option>

                    <option value="Prefer not to say">
                      Prefer not to say
                    </option>

                  </select>

                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.gender}
                    </p>
                  )}

                </div>

                {/* Location */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="Enter your city"
                    className={`w-full rounded-xl border ${
                      errors.location
                        ? "border-red-400"
                        : "border-stone-200"
                    } bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white`}
                  />

                  {errors.location && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.location}
                    </p>
                  )}

                </div>

                {/* Email */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <input
                    type="text"
                    name="email"
                    value={signupEmail}
                    onChange={(event) =>
                      setSignupEmail(event.target.value)
                    }
                    autoComplete="email"
                    placeholder="Enter your email"
                    className={`w-full rounded-xl border ${
                      errors.signupEmail
                        ? "border-red-400"
                        : "border-stone-200"
                    } bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white`}
                  />

                  {errors.signupEmail && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.signupEmail}
                    </p>
                  )}

                </div>

                {/* Password */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="newPassword"
                      value={signupPassword}
                      onChange={(event) =>
                        setSignupPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      placeholder="Create a password"
                      className={`w-full rounded-xl border ${
                        errors.signupPassword
                          ? "border-red-400"
                          : "border-stone-200"
                      } bg-stone-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-rose-300 focus:bg-white`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-2 text-gray-400 hover:text-rose-600"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                  {errors.signupPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.signupPassword}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-gray-500">
                    Use at least 8 characters with uppercase,
                    lowercase and a number.
                  </p>

                </div>

                {/* Confirm Password */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      className={`w-full rounded-xl border ${
                        errors.confirmPassword
                          ? "border-red-400"
                          : "border-stone-200"
                      } bg-stone-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-rose-300 focus:bg-white`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-2 text-gray-400 hover:text-rose-600"
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}

                </div>

                {/* Create account */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer rounded-full bg-gray-900 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Account"}
                </button>
              <GoogleSection onCredential={handleGoogleLogin} />
              </form>
            )}

            {/* ================================================= */}
            {/* FORGOT PASSWORD FORM */}
            {/* ================================================= */}

            {mode === "forgot" && (
              <form
                onSubmit={handleForgotPassword}
                className="mx-auto mt-8 max-w-sm space-y-5"
              >

                <div className="flex justify-center">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                    <KeyRound size={25} />
                  </div>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <input
                    type="text"
                    name="forgotEmail"
                    value={forgotEmail}
                    onChange={(event) =>
                      setForgotEmail(event.target.value)
                    }
                    autoComplete="email"
                    placeholder="Enter your registered email"
                    className={`w-full rounded-xl border ${
                      errors.forgotEmail
                        ? "border-red-400"
                        : "border-stone-200"
                    } bg-stone-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-rose-300 focus:bg-white`}
                  />

                  {errors.forgotEmail && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.forgotEmail}
                    </p>
                  )}

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer rounded-full bg-gray-900 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {loading
                    ? "Sending..."
                    : "Send Reset Link"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    switchMode("login")
                  }
                  className="w-full cursor-pointer text-sm font-medium text-gray-500 hover:text-rose-600"
                >
                  ← Back to Login
                </button>

              </form>
            )}

          </div>
        </div>

      </div>

    </main>
  );
}

export default Auth;