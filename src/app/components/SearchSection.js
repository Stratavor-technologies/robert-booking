export default function SearchSection({
  address,
  searchWithin,
  userEmail,
  onFieldChange,
  onSearchWithinChange,
  onUserEmailChange,
  onSearchClick,
  loadingAddress = false,
  currentEmail,
}) {
  return (
    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 space-y-8 border border-white/20 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-2">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Find Door-to-Door Services
        </h2>
        <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto">
          Discover local service providers ready to come to you
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* City & State Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* City */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              City
            </label>
            <input
              type="text"
              name="city"
              value={address.city}
              onChange={onFieldChange}
              placeholder="Enter your city"
              disabled={loadingAddress}
              className={`w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/50 shadow-sm hover:shadow-md text-black placeholder-gray-400 ${loadingAddress ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              State
            </label>
            <input
              type="text"
              name="state"
              value={address.state}
              onChange={onFieldChange}
              placeholder="Enter your state"
              disabled={loadingAddress}
              className={`w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/50 shadow-sm hover:shadow-md text-black placeholder-gray-400 ${loadingAddress ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            />
          </div>

          {/* ZIP / Postal Code */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l9 6 9-6M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z"
                />
              </svg>
              ZIP Code
            </label>
            <input
              type="text"
              name="zip"
              value={address.zip}
              onChange={onFieldChange}
              placeholder="Enter your ZIP code"
              disabled={loadingAddress}
              className={`w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/50 shadow-sm hover:shadow-md text-black placeholder-gray-400 ${loadingAddress ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            />
          </div>
        </div>


        {/* Search Within Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Search Radius
          </label>
          <SearchWithinInput
            searchWithin={searchWithin}
            onChange={onSearchWithinChange}
            disabled={loadingAddress}
          />
        </div>

        {/* Email Input */}
        {/*  <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Address
            <span className="text-xs text-gray-400 font-normal">(for personalized experience)</span>
          </label>
          <input
            type="email"
            name="userEmail"
            value={userEmail}
            onChange={(e) => onUserEmailChange(e.target.value)}
            placeholder="your.email@example.com"
            disabled={loadingAddress || currentEmail}
            className={`w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/50 shadow-sm hover:shadow-md text-black placeholder-black ${
              loadingAddress ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
        </div> */}

        {/* Search Button */}
        <button
          onClick={onSearchClick}
          disabled={loadingAddress}
          className={`w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 flex items-center justify-center gap-3 group relative overflow-hidden ${loadingAddress
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:scale-[1.02]'
            }`}
        >
          {/* Loading Overlay */}
          {loadingAddress && (
            <div className="absolute inset-0 bg-indigo-600 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <svg
            className={`w-5 h-5 text-white transition-transform ${loadingAddress ? 'opacity-0' : 'group-hover:scale-110'
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <span className={loadingAddress ? 'opacity-0' : ''}>
            {loadingAddress ? 'Searching...' : 'Search Service Providers'}
          </span>
        </button>

        {/* Loading Message */}
        {loadingAddress && (
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-center gap-3 text-blue-700">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Finding providers in your area...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchWithinInput({ searchWithin, onChange, disabled = false }) {
  return (
    <div className={`flex items-center bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 ${disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}>
      <span className="px-5 py-3.5 text-gray-600 font-semibold bg-gray-50 border-r border-gray-200 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        Within
      </span>
      <input
        type="number"
        value={searchWithin}
        min={1}
        max={40}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value <= 40 && value >= 1) {
            onChange(value);
          }
        }}
        disabled={disabled}
        className="flex-1 p-3.5 text-black placeholder-black text-center font-semibold focus:outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
        placeholder="1-20"
      />
      <span className="px-5 py-3.5 text-gray-600 font-semibold bg-gray-50 border-l border-gray-200">Miles</span>
    </div>
  );
}