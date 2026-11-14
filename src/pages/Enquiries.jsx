
import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Search,
  Eye,
  X,
  Loader2,
  RefreshCw,
  Mail,
  Calendar,
  User,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STATUSES = [
  "New",
  "Contacted",
  "In Discussion",
  "Converted",
  "Closed",
];

const PAGE_SIZE = 10;

const statusStyles = {
  New: "bg-blue-500/10 text-blue-400",
  Contacted: "bg-yellow-500/10 text-yellow-400",
  "In Discussion": "bg-purple-500/10 text-purple-400",
  Converted: "bg-emerald-500/10 text-emerald-400",
  Closed: "bg-slate-500/10 text-slate-400",
};

const priorityStyles = {
  High: "text-red-400",
  Medium: "text-yellow-400",
  Low: "text-emerald-400",
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCustomerName = (name) => {
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 80
  ) {
    return "Unknown Customer";
  }

  return name.trim();
};

function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: PAGE_SIZE,
    totalEnquiries: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch enquiries with search, filtering and pagination
  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: PAGE_SIZE,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await api.get("/api/admin/enquiries", {
        params,
      });

      setEnquiries(response.data.enquiries || []);

      setPagination(
        response.data.pagination || {
          currentPage: 1,
          pageSize: PAGE_SIZE,
          totalEnquiries: response.data.total || 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load enquiries. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [search, statusFilter, page]);

  // Reset to first page when search or filter changes
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleViewEnquiry = async (id) => {
    try {
      setDetailLoading(true);
      setSelectedEnquiry(null);
      setError("");

      const response = await api.get(`/api/admin/enquiries/${id}`);

      setSelectedEnquiry(response.data.enquiry);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load enquiry details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // Update enquiry status
  const handleStatusUpdate = async (id, status) => {
    try {
      setUpdating(true);
      setError("");

      const response = await api.patch(
        `/api/admin/enquiries/${id}/status`,
        { status }
      );

      setSelectedEnquiry(response.data.enquiry);

      // Refresh current page so filtered results remain accurate
      await fetchEnquiries();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update enquiry status."
      );
    } finally {
      setUpdating(false);
    }
  };

  const closeModal = () => {
    setSelectedEnquiry(null);
  };

  const ai = selectedEnquiry?.aiClassification;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Service Enquiries
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          View and manage customer enquiries and leads.
        </p>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-[#0c1424] px-4 py-3">
          <Search size={18} className="shrink-0 text-slate-500" />

          <input
            type="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, email or subject..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="rounded-xl border border-slate-800 bg-[#0c1424] px-5 py-3 text-sm text-slate-300 outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>

          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={fetchEnquiries}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#0c1424] px-5 py-3 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Enquiries table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0c1424]">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">
              Recent Enquiries
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {pagination.totalEnquiries} enquiries found
            </p>
          </div>
        </div>

        {/* Horizontally scrollable table */}
        <div className="w-full overflow-x-auto overscroll-x-contain">
          <p className="px-5 py-2 text-xs text-slate-500 md:hidden">
            Swipe horizontally to view all columns →
          </p>

          <table className="w-full min-w-225 table-fixed text-left text-sm">
            <thead className="bg-slate-900/60 text-xs uppercase text-slate-500">
              <tr>
                <th className="w-[23%] px-5 py-4">Customer</th>
                <th className="w-[20%] px-5 py-4">Subject</th>
                <th className="w-[17%] px-5 py-4">Category</th>
                <th className="w-[10%] px-5 py-4">Priority</th>
                <th className="w-[11%] px-5 py-4">Date</th>
                <th className="w-[12%] px-5 py-4">Status</th>
                <th className="w-[7%] px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <Loader2
                      className="mx-auto animate-spin text-blue-400"
                      size={25}
                    />

                    <p className="mt-3 text-sm text-slate-400">
                      Loading enquiries...
                    </p>
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                enquiries.map((enquiry) => {
                  const category =
                    enquiry.aiClassification?.category ||
                    "Unclassified";

                  const priority =
                    enquiry.aiClassification?.priority || "—";

                  return (
                    <tr
                      key={enquiry._id}
                      className="transition hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-4">
                        <p
                          className="max-w-47.5 truncate font-medium text-white"
                          title={formatCustomerName(enquiry.name)}
                        >
                          {formatCustomerName(enquiry.name)}
                        </p>

                        <p
                          className="mt-1 max-w-47.5 truncate text-xs text-slate-500"
                          title={enquiry.email}
                        >
                          {enquiry.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        <p className="truncate" title={enquiry.subject}>
                          {enquiry.subject}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="truncate text-slate-300" title={category}>
                          {category}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`font-medium ${
                            priorityStyles[priority] ||
                            "text-slate-500"
                          }`}
                        >
                          {priority}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                        {formatDate(enquiry.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                            statusStyles[enquiry.status] ||
                            statusStyles.New
                          }`}
                        >
                          {enquiry.status || "New"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleViewEnquiry(enquiry._id)}
                          aria-label={`View ${formatCustomerName(enquiry.name)}`}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {!loading && pagination.totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing{" "}
              {(pagination.currentPage - 1) * pagination.pageSize + 1}
              {" – "}
              {Math.min(
                pagination.currentPage * pagination.pageSize,
                pagination.totalEnquiries
              )}
              {" of "}
              {pagination.totalEnquiries} enquiries
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="text-sm text-slate-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  setPage((previous) => previous + 1)
                }
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enquiry details modal */}
      {(selectedEnquiry || detailLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-[#0c1424] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Enquiry Details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Customer enquiry information
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-16 text-center">
                <Loader2
                  className="mx-auto animate-spin text-blue-400"
                  size={28}
                />

                <p className="mt-3 text-sm text-slate-400">
                  Loading enquiry details...
                </p>
              </div>
            ) : selectedEnquiry && (
              <div className="space-y-6 p-6">
                {/* Customer information */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <User
                      size={18}
                      className="mt-1 shrink-0 text-slate-500"
                    />

                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">
                        Customer
                      </p>

                      <p className="mt-1 wrap-break-word font-medium text-white">
                        {formatCustomerName(selectedEnquiry.name)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail
                      size={18}
                      className="mt-1 shrink-0 text-slate-500"
                    />

                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">
                        Email
                      </p>

                      <p className="mt-1 break-all font-medium text-white">
                        {selectedEnquiry.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar
                      size={18}
                      className="mt-1 shrink-0 text-slate-500"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Submitted
                      </p>

                      <p className="mt-1 font-medium text-white">
                        {formatDate(selectedEnquiry.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">
                      Subject
                    </p>

                    <p className="mt-1 wrap-break-word font-medium text-white">
                      {selectedEnquiry.subject}
                    </p>
                  </div>
                </div>

                {/* Customer message */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <MessageSquare
                      size={17}
                      className="text-blue-400"
                    />

                    <h3 className="font-medium text-white">
                      Customer Message
                    </h3>
                  </div>

                  <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-300">
                    {selectedEnquiry.message}
                  </p>
                </div>

                {/* AI classification */}
                {ai ? (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles
                        size={18}
                        className="text-blue-400"
                      />

                      <h3 className="font-medium text-white">
                        AI Lead Analysis
                      </h3>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500">
                          Category
                        </p>

                        <p className="mt-1 text-sm text-slate-200">
                          {ai.category || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Priority
                        </p>

                        <p
                          className={`mt-1 text-sm font-medium ${
                            priorityStyles[ai.priority] ||
                            "text-slate-300"
                          }`}
                        >
                          {ai.priority || "—"}
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="text-xs text-slate-500">
                          Recommended Service
                        </p>

                        <p className="mt-1 text-sm text-slate-200">
                          {ai.recommendedService || "—"}
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="text-xs text-slate-500">
                          AI Summary
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          {ai.summary || "No summary available."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-sm text-slate-400">
                      AI classification is not available for this enquiry.
                    </p>
                  </div>
                )}

                {/* Status management */}
                <div className="border-t border-slate-800 pt-5">
                  <label className="mb-2 block text-sm font-medium text-white">
                    Update Enquiry Status
                  </label>

                  <select
                    value={selectedEnquiry.status || "New"}
                    disabled={updating}
                    onChange={(e) =>
                      handleStatusUpdate(
                        selectedEnquiry._id,
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  {updating && (
                    <p className="mt-2 flex items-center gap-2 text-xs text-blue-400">
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                      Updating status...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Enquiries;
