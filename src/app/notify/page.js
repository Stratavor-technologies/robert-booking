"use client";

import { useEffect, useState } from "react";

export default function NotifyPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const res = await fetch("/api/enquiry");
        const data = await res.json();

        if (data.success) {
          setEnquiries(data.data || []);
        } else {
          console.error("❌ Failed to fetch enquiries:", data.error);
        }
      } catch (err) {
        console.error("❌ Error fetching enquiries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

  // Filter enquiries based on search and status
  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesSearch = 
      enquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.phoneNumber?.includes(searchTerm);
    
    const matchesStatus = filterStatus === "all" || enquiry.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: "bg-blue-100 text-blue-800", label: "New" },
      contacted: { color: "bg-amber-100 text-amber-800", label: "Contacted" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" }
    };
    
    const config = statusConfig[status] || statusConfig.new;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Safe coordinate formatting function
  const formatCoordinate = (coord) => {
    if (coord === null || coord === undefined) return "—";
    if (typeof coord === 'number') {
      return coord.toFixed(4);
    }
    if (typeof coord === 'string') {
      const num = parseFloat(coord);
      return !isNaN(num) ? num.toFixed(4) : "—";
    }
    return "—";
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh]">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-lg font-medium text-gray-700">Loading enquiries...</span>
        <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your data</p>
      </div>
    );
  }

  if (enquiries.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] text-gray-500">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">📋</span>
        </div>
        <p className="text-xl font-medium mb-2">No enquiries yet</p>
        <p className="text-gray-400">New enquiries will appear here once submitted.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 my-25">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white-900 mb-3">
          📋 Enquiry Management
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Manage and track all customer enquiries in one place
        </p>
      </div>

      {/* Stats and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{enquiries.length}</div>
              <div className="text-sm text-gray-500">Total Enquiries</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
          
          </div>

         
        </div>
      </div>

      {/* Enquiries Grid */}
      <div className="grid gap-6">
        {filteredEnquiries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">No matching enquiries</p>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredEnquiries.map((enquiry) => (
            <div
              key={enquiry._id}
              className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-amber-200 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedEnquiry(enquiry)}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left Section - Main Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                        {enquiry.city || "Unknown City"}, {enquiry.state || "N/A"}
                      </h3>
                      {getStatusBadge(enquiry.status)}
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(enquiry.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 text-sm">
                    📍 {enquiry.fullAddress || "No address provided"}
                  </p>

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-400">📧</span>
                      <div>
                        <div className="text-xs text-gray-500 font-medium">Email</div>
                        <div className="text-gray-900 font-medium truncate">{enquiry.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-400">📞</span>
                      <div>
                        <div className="text-xs text-gray-500 font-medium">Phone</div>
                        <div className="text-gray-900 font-medium">{enquiry.phoneNumber}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-400">📮</span>
                      <div>
                        <div className="text-xs text-gray-500 font-medium">Pincode</div>
                        <div className="text-gray-900 font-medium">{enquiry.pincode || "—"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-400">📍</span>
                      <div>
                        <div className="text-xs text-gray-500 font-medium">Coordinates</div>
                        <div className="text-gray-900 font-medium text-xs">
                          {formatCoordinate(enquiry.lat)}, {formatCoordinate(enquiry.lon)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEnquiry(enquiry);
                  }}
                  className="lg:self-start px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors font-medium text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Enquiry Details</h2>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">City</label>
                      <p className="text-gray-900">{selectedEnquiry.city || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">State</label>
                      <p className="text-gray-900">{selectedEnquiry.state || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Address</label>
                      <p className="text-gray-900">{selectedEnquiry.fullAddress || "No address provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Pincode</label>
                      <p className="text-gray-900">{selectedEnquiry.pincode || "—"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedEnquiry.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <p className="text-gray-900">{selectedEnquiry.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Coordinates</label>
                      <p className="text-gray-900 text-sm">
                        Lat: {formatCoordinate(selectedEnquiry.lat)}<br />
                        Lon: {formatCoordinate(selectedEnquiry.lon)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
             
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}