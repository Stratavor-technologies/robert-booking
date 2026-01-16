import { useState, useEffect } from "react";

export default function ServicesSection({ 
  services, 
  onCheckboxChange, 
  loadingServices = false,
  selectedProvider,
  providers,
  events,
  onClose,
  categories = []
}) {
  const [selectedCount, setSelectedCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [showAllServices, setShowAllServices] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryView, setShowCategoryView] = useState(true); // Start with category view

  // Get the provider's available services and group by category
  useEffect(() => {
    if (selectedProvider && providers && events && categories) {
      const provider = providers.find(p => p.id === selectedProvider);
      if (provider && provider.services) {
        // Get all services for this provider
        const providerServices = provider.services
          .map(serviceId => {
            const service = events.find(event => event.id === serviceId.toString());
            if (service) {
              const serviceKey = service.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/(^_+|_+$)/g, '');
              
              return {
                id: service.id,
                name: service.name,
                price: service.price || "0.00",
                currency: service.currency || "USD",
                key: serviceKey,
                description: service.description,
                duration: service.duration || 60
              };
            }
            return null;
          })
          .filter(service => service !== null);

        setAvailableServices(providerServices);

        // Group services by category
        const groupedByCategory = {};
        
        // Initialize categories that have services from this provider
        categories.forEach(category => {
          if (Array.isArray(category.events)) {
            const categoryEventIds = category.events.map(id => Number(id)).filter(id => !isNaN(id));
            const categoryServices = providerServices.filter(service => 
              categoryEventIds.includes(Number(service.id))
            );
            
            if (categoryServices.length > 0) {
              groupedByCategory[category.id] = {
                ...category,
                services: categoryServices,
                icon: getCategoryIcon(category.name)
              };
            }
          }
        });

        // Convert to array and sort by category name
        const categoryArray = Object.values(groupedByCategory)
          .sort((a, b) => a.name.localeCompare(b.name));

        setServiceCategories(categoryArray);
      }
    } else {
      setAvailableServices([]);
      setServiceCategories([]);
    }
  }, [selectedProvider, providers, events, services, categories]);

  // Helper function to get icon for category
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'nails': '💅',
      'hair': '💇',
      'massage': '💆',
      'spa': '✨',
      'skin': '🌟',
      'makeup': '💄',
      'eyelash': '👁️',
      'eyebrow': '✏️',
      'waxing': '🔥',
      'default': '🔧'
    };

    const lowerName = categoryName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key)) {
        return icon;
      }
    }
    return iconMap.default;
  };

  // Get services for selected category
  const getSelectedCategoryServices = () => {
    if (!selectedCategory) return [];
    const category = serviceCategories.find(cat => cat.id === selectedCategory);
    return category ? category.services : [];
  };

  // Get services to show (based on showAllServices toggle)
  const getServicesToShow = () => {
    const selectedCategoryServices = getSelectedCategoryServices();
    if (selectedCategoryServices.length === 0) return [];
    
    return showAllServices 
      ? selectedCategoryServices 
      : selectedCategoryServices.slice(0, 5);
  };

  // Generate service groups based on selected category
  const getServiceGroups = () => {
    if (!selectedCategory || serviceCategories.length === 0) {
      return [];
    }

    const selectedCategoryData = serviceCategories.find(cat => cat.id === selectedCategory);
    if (!selectedCategoryData) return [];

    const servicesToShow = getServicesToShow();

    return [
      {
        title: selectedCategoryData.name,
        icon: selectedCategoryData.icon,
        description: selectedCategoryData.description || `Select services from ${selectedCategoryData.name} category`,
        services: servicesToShow,
        showAllButton: selectedCategoryData.services.length > 5 && !showAllServices
      }
    ];
  };

  const serviceGroups = getServiceGroups();

  // Update selected count with animation
  useEffect(() => {
    const count = Object.values(services).filter(Boolean).length;
    if (count !== selectedCount) {
      setIsAnimating(true);
      setSelectedCount(count);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [services, selectedCount]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Toggle show all services
  const toggleShowAllServices = () => {
    setShowAllServices(!showAllServices);
  };

  // Handle category selection - switch to services view
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowAllServices(false);
    setShowCategoryView(false); // Switch to services view
  };

  // Go back to category selection
  const handleBackToCategories = () => {
    setShowCategoryView(true);
    setSelectedCategory(null);
    setShowAllServices(false);
  };

  // Handle service selection directly
  const handleServiceSelect = (service) => {
    const serviceKey = service.key;
    
    // Toggle the checkbox state
    const newCheckedState = !services[serviceKey];
    
    // Call parent handler with synthetic event
    if (onCheckboxChange) {
      const syntheticEvent = {
        target: {
          name: serviceKey,
          checked: newCheckedState
        }
      };
      onCheckboxChange(syntheticEvent);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-gray-100 relative">
      {/* Cross Button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 group"
        aria-label="Close services section"
      >
        <svg 
          className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">3</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {showCategoryView ? "Select Category" : "Select Services"}
          </h2>
          <p className="text-gray-600 mt-1">
            {showCategoryView
              ? `Choose a category to view available services`
              : selectedCategory 
                ? `Viewing services in ${serviceCategories.find(c => c.id === selectedCategory)?.name}`
                : "No services available"}
          </p>
        </div>
      </div>

      {/* Back button when in services view */}
      {!showCategoryView && (
        <button
          onClick={handleBackToCategories}
          className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to categories</span>
        </button>
      )}

      {/* Loading State */}
      {loadingServices ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Services</h3>
          <p className="text-gray-600">Preparing available services for your selection...</p>
        </div>
      ) : showCategoryView ? (
        /* CATEGORY VIEW - Full width */
        <div>
          {/* Category Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Available Categories</h3>
              <p className="text-gray-600 mt-1">
                Select a category to view available services
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Categories</div>
              <div className="text-lg font-semibold text-purple-600">
                {serviceCategories.length}
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          {serviceCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    {/* Category Icon */}
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl">
                      {category.icon}
                    </div>
                    
                    {/* Category Info */}
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                        {category.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {category.services.length} service{category.services.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    {/* Arrow Indicator */}
                    <div className="text-gray-400 group-hover:text-purple-500 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {category.description && (
                    <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                      {category.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Categories Available</h3>
              <p className="text-gray-600">This provider doesn't have services in any available categories.</p>
            </div>
          )}
        </div>
      ) : (
        /* SERVICES VIEW - Full width */
        <div>
          {/* Category Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-lg">
                  {serviceCategories.find(c => c.id === selectedCategory)?.icon || '🔧'}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {serviceCategories.find(c => c.id === selectedCategory)?.name || 'Services'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {getSelectedCategoryServices().length} service{getSelectedCategoryServices().length !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Selected Category</div>
                <div className="text-lg font-semibold text-purple-600">
                  {serviceCategories.find(c => c.id === selectedCategory)?.name || '---'}
                </div>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 gap-8">
            {serviceGroups.map((group, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:border-purple-200 transition-all duration-300"
              >
                {/* Group Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-lg">
                    {group.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{group.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                  </div>
                </div>

                {/* Services List */}
                {group.services.length > 0 ? (
                  <div className="space-y-4">
                    {group.services.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        isChecked={services[service.key] || false}
                        onSelect={handleServiceSelect}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No services available in this category.</p>
                  </div>
                )}

                {/* Show All Services Button */}
                {group.showAllButton && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={toggleShowAllServices}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-medium rounded-xl border border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 group"
                    >
                      <span>View All {getSelectedCategoryServices().length} Services</span>
                      <svg 
                        className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Show Less Button (when all services are shown) */}
                {showAllServices && getSelectedCategoryServices().length > 5 && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={toggleShowAllServices}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 group"
                    >
                      <svg 
                        className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <span>Show Less</span>
                    </button>
                  </div>
                )}  
              </div>
            ))}
          </div>

          {/* Selected Services Summary */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  selectedCount > 0 
                    ? 'bg-purple-100' 
                    : 'bg-gray-100'
                } ${isAnimating ? 'scale-110' : ''}`}>
                  {selectedCount > 0 ? (
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {selectedCount} service{selectedCount !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              {selectedCount > 0 && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Ready for next step</div>
                  <div className="text-sm font-semibold text-purple-600 flex items-center gap-1">
                    Continue to schedule
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Selection Guidance */}
            {availableServices.length > 0 && selectedCount === 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-blue-700">
                    Select one or more services to continue with your booking
                  </p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {availableServices.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Selection Progress</span>
                  <span>{availableServices.length > 0 ? Math.round((selectedCount / availableServices.length) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${availableServices.length > 0 ? (selectedCount / availableServices.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Service Card Component (simplified - direct checkbox toggle)
function ServiceCard({ service, isChecked, onSelect }) {
  const [isRecentlyChanged, setIsRecentlyChanged] = useState(false);

  const handleClick = () => {
    onSelect(service);
    setIsRecentlyChanged(true);
    setTimeout(() => setIsRecentlyChanged(false), 300);
  };

  // Format price function
  const formatPrice = (price, currency) => {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) return `$${0.00}`;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(priceNum);
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group relative overflow-hidden
        ${isChecked 
          ? "border-purple-500 bg-purple-50 shadow-md" 
          : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm"
        } ${isRecentlyChanged ? 'scale-105' : ''}`}
    >
      {/* Animated background effect */}
      {isRecentlyChanged && (
        <div className="absolute inset-0 bg-purple-500 opacity-10 animate-pulse rounded-xl"></div>
      )}
      
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all relative
              ${isChecked
                ? "border-purple-500 bg-purple-500 shadow-sm"
                : "border-gray-300 bg-white group-hover:border-purple-400"
              }`}
            >
              {isChecked && (
                <svg 
                  className="w-4 h-4 text-white transition-all duration-200"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              
              {/* Ripple effect */}
              {isRecentlyChanged && (
                <div className="absolute inset-0 border-2 border-purple-500 rounded-lg animate-ping opacity-60"></div>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <span className={`font-medium transition-colors block
              ${isChecked ? "text-purple-700 font-semibold" : "text-gray-700"}
            `}>
              {service.name}
            </span>
            {service.description && (
              <p className="text-sm text-gray-500 mt-1">
                {service.description}
              </p>
            )}
          </div>
        </div>

        {/* Price and Duration */}
        <div className="text-right">
          <div className={`text-sm font-semibold px-3 py-1 rounded-lg transition-colors mb-1
            ${isChecked ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}
          `}>
            {formatPrice(service.price, service.currency)}
          </div>
          <div className="text-xs text-gray-500">
            {service.duration} min
          </div>
        </div>
      </div>
    </div>
  );
}