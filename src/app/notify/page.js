"use client";

import { useEffect, useState } from "react";

export default function NotifyPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredEnquiries = enquiries.filter((enquiry) => {
    return (
      enquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.enquiredBy?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] text-gray-600 text-lg">
        Loading enquiries...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          Enquiry Management
        </h1>
        <p className="text-white text-base">
          Seamlessly manage and track all your enquiries in one elegant view.
        </p>
        <div className="w-20 h-[2px] bg-gradient-to-r from-amber-500 to-orange-400 mx-auto mt-3 rounded-full"></div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="🔍 Search by name, city, state, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 bg-gray-50 focus:bg-white focus:border-amber-500 transition-all duration-200 rounded-xl px-4 py-2 w-full sm:w-1/3 shadow-sm placeholder-gray-400 text-sm text-black"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200 bg-white backdrop-blur-sm">
        <table className="min-w-full border-collapse text-sm text-gray-700">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
            <tr>
              {[
                "ID",
                "Name",
                "Date",
                "State",
                "City",
                "Email",
                "Phone",
                "Status",
                "Action",
              ].map((head) => (
                <th
                  key={head}
                  className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-xs border-r last:border-none"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEnquiries.length > 0 ? (
              filteredEnquiries.map((enquiry, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 hover:bg-amber-50/50 transition ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {/* ID — first 4 chars of _id */}
                  <td className="p-4 border-r font-mono text-gray-700">
                    {enquiry._id?.slice(0, 4) || "----"}
                  </td>

                  {/* Name (enquiredBy) */}
                  <td className="p-4 border-r font-medium text-gray-800 capitalize">
                    {enquiry.enquiredBy || "N/A"}
                  </td>

                  <td className="p-4 border-r text-gray-600">
                    {new Date(enquiry.createdAt).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4 border-r font-medium text-gray-800">
                    {enquiry.state || "N/A"}
                  </td>
                  <td className="p-4 border-r">{enquiry.city || "N/A"}</td>
                  <td className="p-4 border-r max-w-[200px] truncate text-blue-600 hover:underline cursor-pointer">
                    {enquiry.email}
                  </td>
                  <td className="p-4 border-r text-gray-700">
                    {enquiry.phoneNumber || "—"}
                  </td>
                  <td className="p-4 border-r">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        enquiry.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : enquiry.status === "contacted"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {enquiry.status || "New"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg shadow hover:shadow-md hover:scale-105 transition">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="p-8 text-center text-gray-500 font-medium"
                >
                  No enquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer subtle note */}
      <p className="text-center text-gray-400 text-xs mt-6">
        © {new Date().getFullYear()} Enquiry Management Dashboard
      </p>
    </div>
  );
}
