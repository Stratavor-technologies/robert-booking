import { useEffect, useState } from "react";
import { useAppData } from "../context/AppDataContext";

export default function NoProvidersSection({ address, userEmail, onNoThanks }) {
  const { categories } = useAppData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [localName, setLocalName] = useState("");
  const [localEmail, setLocalEmail] = useState(userEmail || "");
  const [localPhone, setLocalPhone] = useState(address?.phone || "");
  const [localCategory, setLocalCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]); 
  
  // Validation states
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    category: ""
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    category: false
  });

  useEffect(() => {
    console.log("📍 Enquiry Address Data:", address);
  }, [address]);

  useEffect(() => {
    if (localCategory) {
      const filtered = categories.filter(category =>
        category.name?.toLowerCase().includes(localCategory.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [localCategory, categories]);


    // ADD THIS NEW USEEFFECT - START
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.category-dropdown-container')) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // ADD THIS NEW USEEFFECT - END

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
    
    // Clear phone error when user starts typing
    if (errors.phone && input.trim() !== "") {
      setErrors(prev => ({ ...prev, phone: "" }));
    }
  };

 // ADD THIS NEW FUNCTION - START
  // Handle category selection
  const handleCategorySelect = (category) => {
    setLocalCategory(category.name);
    setShowCategoryDropdown(false);
    
    // Clear category error when a category is selected
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: "" }));
    }
  };

  // Handle category input change
  const handleCategoryChange = (e) => {
    setLocalCategory(e.target.value);
    setShowCategoryDropdown(true);
    
    // Clear error when user starts typing
    if (errors.category && e.target.value.trim() !== "") {
      setErrors(prev => ({ ...prev, category: "" }));
    }
  };
  // ADD THIS NEW FUNCTION - END


  // --- ✉️ Email validation ---
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // --- ✅ Validation functions ---
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim() === "" ? "Name is required" : "";
      case "email":
        if (value.trim() === "") return "Email is required";
        if (!isValidEmail(value)) return "Please enter a valid email address";
        return "";
      case "phone":
        if (value.trim() === "") return "Phone number is required";
        const cleanedPhone = value.replace(/\D/g, "");
        if (cleanedPhone.length !== 10) return "Phone number must be exactly 10 digits";
        return "";
      case "category":
        return value.trim() === "" ? "Service category is required" : "";
      default:
        return "";
    }
  };

  // --- 🎯 Handle field blur (when user leaves a field) ---
  const handleBlur = (fieldName) => (e) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const error = validateField(fieldName, e.target.value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // --- 📤 Handle form submission ---
  const handleSubmit = async () => {
    // Mark all fields as touched to show all errors
    const allTouched = {
      name: true,
      email: true,
      phone: true,
      category: true
    };
    setTouched(allTouched);

    // Validate all fields
    const newErrors = {
      name: validateField("name", localName),
      email: validateField("email", localEmail),
      phone: validateField("phone", localPhone),
      category: validateField("category", localCategory)
    };

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== "");
    if (hasErrors) {
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors).find(key => newErrors[key] !== "");
      if (firstErrorField) {
        const element = document.querySelector(`[data-field="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanedPhone = localPhone.replace(/\D/g, ""); // remove formatting

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
        category: localCategory,
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
        alert("We Will Notify you soon");
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

  // Handle "No Thanks" button click
  const handleNoThanks = () => {
    console.log("User declined notification");
    if (onNoThanks) {
      onNoThanks();
    }
  };

  // Helper function to get input border color based on validation
  const getInputBorderColor = (fieldName) => {
    if (!touched[fieldName]) return "border-gray-200";
    return errors[fieldName] ? "border-red-400" : "border-green-400";
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 space-y-8 border border-amber-100 relative">
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
            We're expanding! Provide your contact info and we'll notify you when
            services become available in your area.
          </p>
        </div>
      </div>

      {/* Conditional Rendering: Buttons or Form */}
      {!showForm ? (
        // Initial Buttons View
        <div className="space-y-4">
          <div className="flex gap-4">
            {/* Notify Me Button */}
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg 
              font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 
              hover:scale-[1.02] flex items-center justify-center gap-3 group"
            >
              <svg
                className="w-5 h-5 text-white transition-transform group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM4.93 4.93l14.14 14.14M14.83 14.83a4 4 0 01-5.66-5.66l5.66 5.66z"
                />
              </svg>
              Notify Me
            </button>

            {/* No Thanks Button */}
            <button
              onClick={handleNoThanks}
              className="flex-1 py-4 bg-gray-200 text-gray-700 text-lg 
              font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 
              hover:scale-[1.02] flex items-center justify-center gap-3 group"
            >
              <svg
                className="w-5 h-5 text-gray-600 transition-transform group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              No Thanks
            </button>
          </div>

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
              We'll contact you as soon as we have providers in your area
            </p>
          </div>
        </div>
      ) : (
        // Form View (shown when user clicks "Notify Me")
        <div className="space-y-6">
          {/* 🧍 Name Field */}
          <div className="space-y-2" data-field="name">
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
              onChange={(e) => {
                setLocalName(e.target.value);
                // Clear error when user starts typing
                if (errors.name && e.target.value.trim() !== "") {
                  setErrors(prev => ({ ...prev, name: "" }));
                }
              }}
              onBlur={handleBlur("name")}
              disabled={isSubmitting}
              className={`w-full border ${getInputBorderColor("name")} rounded-xl px-4 py-3.5 
                bg-white/50 text-black focus:ring-2 focus:ring-amber-400 focus:border-amber-400 
                focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              
            />
            {touched.name && errors.name && (
              <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.name}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2" data-field="email">
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
              onChange={(e) => {
                setLocalEmail(e.target.value);
                // Clear error when user starts typing
                if (errors.email && e.target.value.trim() !== "") {
                  setErrors(prev => ({ ...prev, email: "" }));
                }
              }}
              onBlur={handleBlur("email")}
              disabled={isSubmitting}
              className={`w-full border ${getInputBorderColor("email")} rounded-xl px-4 py-3.5 
                bg-white/50 text-black focus:ring-2 focus:ring-amber-400 focus:border-amber-400 
                focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
             
            />
            {touched.email && errors.email && (
              <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.email}
              </div>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2" data-field="phone">
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
              onBlur={handleBlur("phone")}
              disabled={isSubmitting}
              className={`w-full border ${getInputBorderColor("phone")} rounded-xl px-4 py-3.5 
                bg-white/50 text-black focus:ring-2 focus:ring-amber-400 focus:border-amber-400 
                focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              
            />
            {touched.phone && errors.phone && (
              <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.phone}
              </div>
            )}
          </div>

                   {/* Category Field */}
          <div className="space-y-2 category-dropdown-container" data-field="category">
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Service Category
              <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full">
                Required
              </span>
            </label>
            
            <div className="relative">
              <input
                type="text"
                value={localCategory}
                onChange={handleCategoryChange}
                onFocus={() => setShowCategoryDropdown(true)}
                onBlur={handleBlur("category")}
                disabled={isSubmitting}
                className={`w-full border ${getInputBorderColor("category")} rounded-xl px-4 py-3.5 
                  bg-white/50 text-black focus:ring-2 focus:ring-amber-400 focus:border-amber-400 
                  focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                
              />
              
              {/* Dropdown arrow */}
              <div 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Dropdown menu */}
              {showCategoryDropdown && filteredCategories.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className="px-4 py-3 hover:bg-amber-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                      onClick={() => handleCategorySelect(category)}
                    >
                      <div className="font-medium text-gray-800">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-gray-500 mt-1">{category.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showCategoryDropdown && localCategory && filteredCategories.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
                  <div className="text-gray-500 text-center">
                    No categories found matching "{localCategory}"
                  </div>
                </div>
              )}
            </div>

            {touched.category && errors.category && (
              <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.category}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              What type of service are you looking for? Type to search or select from the dropdown.
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg 
            font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 
            flex items-center justify-center gap-3 group relative overflow-hidden ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
            }`}
          >
            {isSubmitting && (
              <div className="absolute inset-0 bg-amber-500 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <svg
              className={`w-5 h-5 text-white transition-transform ${
                isSubmitting ? "opacity-0" : "group-hover:scale-110"
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
      )}
    </div>
  );
}