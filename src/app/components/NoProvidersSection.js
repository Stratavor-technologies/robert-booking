import { useState } from "react";

export default function NoProvidersSection({ address, onFieldChange, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (address.email === "" || address.phone === "") {
      alert("Email and Phone is required...");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 space-y-8 border border-red-100 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
      
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Service Not Available Yet
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
            We're expanding! Provide your details and we'll notify you when services become available in your area.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="space-y-6">
        {/* Email Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Address
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full">Required</span>
          </label>
          <input
            type="email"
            name="email"
            value={address.email}
            onChange={onFieldChange}
            placeholder="your.email@example.com"
            disabled={isSubmitting}
            className={`w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none transition-all duration-200 bg-white/50 shadow-sm hover:shadow-md ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
        </div>

        {/* Phone Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Phone Number
            <span className="text-xs text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={address.phone}
            onChange={onFieldChange}
            placeholder="+1 (555) 123-4567"
            disabled={isSubmitting}
            className={`w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none transition-all duration-200 bg-white/50 shadow-sm hover:shadow-md ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 flex items-center justify-center gap-3 group relative overflow-hidden ${
            isSubmitting 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-[1.02]'
          }`}
        >
          {/* Loading Overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-amber-500 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          <svg 
            className={`w-5 h-5 text-white transition-transform ${
              isSubmitting ? 'opacity-0' : 'group-hover:scale-110'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          
          <span className={isSubmitting ? 'opacity-0' : ''}>
            {isSubmitting ? 'Submitting...' : 'Notify Me When Available'}
          </span>
        </button>

        {/* Additional Info */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isSubmitting ? 'Submitting your request...' : 'We\'ll contact you as soon as we have providers in your area'}
          </p>
        </div>

        {/* Loading State Message */}
        {isSubmitting && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-center justify-center gap-3 text-amber-700">
              <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Saving your contact information...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}