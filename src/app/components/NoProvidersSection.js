import { useEffect, useState } from "react";

export default function NoProvidersSection({ address, userEmail }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [localName, setLocalName] = useState("");
  const [localEmail, setLocalEmail] = useState(userEmail || "");
  const [localPhone, setLocalPhone] = useState(address?.phone || "");

  useEffect(() => {
    console.log("📍 Enquiry Address Data:", address);
  }, [address]);

  // --- 📞 Auto-format phone input ---
  const handlePhoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // keep only digits
    if (input.length > 10) input = input.slice(0, 10); // limit 10 digits

    // Format as (123) 456-7890
    if (input.length > 6) {
      input = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6)}`;
    } else if (input.length > 3) {
      input = `(${input.slice(0, 3)}) ${input.slice(3)}`;
    } else if (input.length > 0) {
      input = `(${input}`;
    }
    setLocalPhone(input);
  };

  // --- ✉️ Simple email validation ---
  const isValidEmail = (email) => email.includes("@");


  const handleSubmit = async () => {
    if (localName.trim() === "" || localEmail.trim() === "" || localPhone.trim() === "") {
      alert("Name, Email, and Phone are required...");
      return;
    }

    if (!isValidEmail(localEmail)) {
      alert("Please enter a valid email address containing '@'.");
      return;
    }

    const cleanedPhone = localPhone.replace(/\D/g, ""); // remove formatting

    if (cleanedPhone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }


    setIsSubmitting(true);
    try {
      const payload = {
        fullAddress: address?.fullAddress || "",
        city: address?.city || "",
        state: address?.state || "",
        pincode: address?.zip || "",
        lat: address?.lat || "",
        lon: address?.lon || "",
        enquiredBy: localName,
        email: localEmail,
        phoneNumber: cleanedPhone,
      };

      console.log("📤 Sending enquiry payload:", payload);

      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();


      if (data.success) {
        setSubmitted(true);
        alert("We Will Notify you soon ")

      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("❌ Error submitting enquiry:", err);
      alert("Failed to send enquiry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 space-y-8 border border-amber-100 relative overflow-hidden">
      {/* Top Gradient Bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 
              2.502-1.667 1.732-2.5L13.732 4c-.77-.833-
              1.964-.833-2.732 0L4.35 16.5c-.77.833.192 
              2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Service Not Available Yet
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
            We're expanding! Provide your contact info and we’ll notify you when
            services become available in your area.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* 🧍 Name Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            {/* 👤 Name Icon */}
            <svg
              className="w-4 h-4 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A10.97 10.97 0 0112 15c2.5 0 4.847.815 6.879 2.196M15 
           11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Name
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full">
              Required
            </span>
          </label>

          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="John Doe"
            disabled={isSubmitting}
            className={`w-full border border-gray-200 rounded-xl px-4 py-3.5 
      bg-white/50 text-black focus:ring-2 focus:ring-amber-400 focus:border-amber-400 
      focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
          />
        </div>


        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 
                8M5 19h14a2 2 0 002-2V7a2 2 0 
                00-2-2H5a2 2 0 00-2 2v10a2 
                2 0 002 2z"
              />
            </svg>
            Email Address
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full">
              Required
            </span>
          </label>
          <input
            type="email"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            placeholder="your.email@example.com"
            disabled={isSubmitting}
            className={`w-full border border-gray-200 rounded-xl px-4 py-3.5 
            bg-white/50 text-gray-600 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 
            focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
          />
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 
                0 01.948.684l1.498 4.493a1 1 
                0 01-.502 1.21l-2.257 1.13a11.042 
                11.042 0 005.516 5.516l1.13-2.257a1 
                1 0 011.21-.502l4.493 1.498a1 1 
                0 01.684.949V19a2 2 0 01-2 2h-1C9.716 
                21 3 14.284 3 6V5z"
              />
            </svg>
            Phone Number
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full">
              Required
            </span>
          </label>
          <input
            type="tel"
            value={localPhone}
            onChange={handlePhoneChange}
            placeholder="+1 (555) 123-4567"
            disabled={isSubmitting}
            className={`w-full border text-black border-gray-200 rounded-xl px-4 py-3.5 
            bg-white/50 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 
            focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg 
          font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 
          flex items-center justify-center gap-3 group relative overflow-hidden ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
            }`}
        >
          {isSubmitting && (
            <div className="absolute inset-0 bg-amber-500 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <svg
            className={`w-5 h-5 text-white transition-transform ${isSubmitting ? "opacity-0" : "group-hover:scale-110"
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 
              0L21 8M5 19h14a2 2 0 002-2V7a2 
              2 0 00-2-2H5a2 2 0 00-2 2v10a2 
              2 0 002 2z"
            />
          </svg>
          <span className={isSubmitting ? "opacity-0" : ""}>
            {isSubmitting ? "Submitting..." : "Notify Me When Available"}
          </span>
        </button>

        {/* Info Text */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 
                12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {isSubmitting
              ? "Submitting your request..."
              : "We'll contact you as soon as we have providers in your area"}
          </p>
        </div>
      </div>
    </div>
  );
}
