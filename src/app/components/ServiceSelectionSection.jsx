export default function ServiceSelectionSection({
  selectedCategory,
  services,
  onCheckboxChange,
}) {
  if (!selectedCategory) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        Select a service type first
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
        <span className="text-lg">{selectedCategory.icon}</span>
        <span className="text-sm font-semibold">{selectedCategory.name}</span>
      </div> */}

      <div className="space-y-2">
        {selectedCategory.services.map(service => {
          const isSelected = Boolean(services?.[service.key]);

          return (
            <div
              key={service.id}
              onClick={() =>
                onCheckboxChange({
                    target: {
                        name: service.key,
                        checked: !isSelected,
                    },
                    })
              }
              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                isSelected
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  isSelected
                    ? "border-purple-500 bg-purple-500"
                    : "border-gray-300"
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">
                  {service.name}
                </div>
                <div className="text-xs text-gray-500">
                  {service.duration} min
                </div>
              </div>

              <div className="text-xs font-semibold text-green-600">
                ${parseFloat(service.price).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
