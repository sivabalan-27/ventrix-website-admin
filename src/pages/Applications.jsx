
import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Search,
  Filter,
  Eye,
  X,
  LoaderCircle,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";

const PAGE_SIZE = 10;

const applicationStatuses = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];

const statusStyles = {
  Applied: "bg-blue-500/10 text-blue-400",
  "Under Review": "bg-yellow-500/10 text-yellow-400",
  Shortlisted: "bg-purple-500/10 text-purple-400",
  Interview: "bg-cyan-500/10 text-cyan-400",
  Selected: "bg-emerald-500/10 text-emerald-400",
  Rejected: "bg-red-500/10 text-red-400",
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Applications() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: PAGE_SIZE,
    totalApplications: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [resumeLoading, setResumeLoading] = useState("");
  const [actionError, setActionError] = useState("");

  // CSV export states
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");


  // Fetch applications with server-side pagination
  const fetchApplications = async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/admin/applications", {
        params: {
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          page: currentPage,
          limit: PAGE_SIZE,
        },
        signal,
      });

      setApplications(response.data.applications || []);

      setPagination(
        response.data.pagination || {
          currentPage,
          pageSize: PAGE_SIZE,
          totalApplications: response.data.total || 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      if (err.code === "ERR_CANCELED") return;

      setError(
        err.response?.data?.message ||
          "Unable to load applications. Please try again."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    fetchApplications(controller.signal);

    return () => controller.abort();
  }, [search, statusFilter, currentPage]);

  // Search changes reset pagination
  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Status filter changes reset pagination
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Navigate to another page
  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.totalPages ||
      page === currentPage ||
      loading
    ) {
      return;
    }

    setCurrentPage(page);
  };

  // Export all matching applications to CSV
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      setExportError("");

      const params = {
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page: 1,
        limit: 100,
      };

      // Fetch the first page
      const firstResponse = await api.get("/api/admin/applications", {
        params,
      });

      let allApplications = [
        ...(firstResponse.data.applications || []),
      ];

      const totalPages =
        firstResponse.data.pagination?.totalPages || 1;

      // Fetch remaining pages
      for (let page = 2; page <= totalPages; page++) {
        const response = await api.get("/api/admin/applications", {
          params: {
            ...params,
            page,
          },
        });

        allApplications.push(
          ...(response.data.applications || [])
        );
      }

      if (allApplications.length === 0) {
        setExportError("No applications available to export.");
        return;
      }

      const columns = [
        "Full Name",
        "Email",
        "Phone",
        "Position",
        "Location",
        "Qualification",
        "LinkedIn",
        "Portfolio",
        "Message",
        "Status",
        "Applied Date",
        "Resume Filename",
      ];

      const escapeCSV = (value) => {
        let text = String(value ?? "");

        // Prevent spreadsheet formula injection
        if (/^[\s]*[=+\-@\t\r]/.test(text)) {
          text = `'${text}`;
        }

        return `"${text.replace(/"/g, '""')}"`;
      };

      const rows = allApplications.map((application) => [
        application.fullName,
        application.email,
        application.phone,
        application.position,
        application.location,
        application.qualification,
        application.linkedin,
        application.portfolio,
        application.message,
        application.status || "Applied",
        application.createdAt
          ? new Date(application.createdAt).toLocaleString("en-IN")
          : "",
        application.resume?.filename || "",
      ]);

      const csvContent = [
        columns.map(escapeCSV).join(","),
        ...rows.map((row) =>
          row.map(escapeCSV).join(",")
        ),
      ].join("\r\n");

      // UTF-8 BOM for Excel compatibility
      const blob = new Blob(["\uFEFF", csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `ventrix-applications-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      setExportError(
        err.response?.data?.message ||
          "Unable to export applications."
      );
    } finally {
      setExporting(false);
    }
  };

  // Fetch individual application details
  const handleViewApplication = async (id) => {
    try {
      setDetailsLoading(true);
      setActionError("");
      setSelectedApplication(null);

      const response = await api.get(`/api/admin/applications/${id}`);

      setSelectedApplication(response.data.application);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Unable to load application details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // Update application status
  const handleStatusUpdate = async (newStatus) => {
    if (!selectedApplication || updating) return;

    try {
      setUpdating(true);
      setActionError("");

      const response = await api.patch(
        `/api/admin/applications/${selectedApplication._id}/status`,
        { status: newStatus }
      );

      setSelectedApplication(response.data.application);

      await fetchApplications();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Unable to update application status."
      );
    } finally {
      setUpdating(false);
    }
  };

  // View or download resume using authenticated API
  const handleResumeAction = async (action) => {
    if (!selectedApplication?.resume?.filename || resumeLoading) return;

    let previewWindow = null;

    try {
      setResumeLoading(action);
      setActionError("");

      // Open a blank tab immediately to avoid popup blocking
      if (action === "view") {
        previewWindow = window.open("", "_blank");

        if (!previewWindow) {
          throw new Error(
            "Please allow pop-ups in your browser to view the resume."
          );
        }

        previewWindow.document.title = "Loading Resume...";
        previewWindow.document.body.innerHTML =
          "<p style='font-family:Arial;padding:24px'>Loading resume...</p>";
      }

      const response = await api.get(
        `/api/admin/applications/${selectedApplication._id}/resume`,
        {
          responseType: "blob",
          params: action === "download" ? { download: "true" } : {},
        }
      );

      const contentType =
        response.headers["content-type"] || "application/octet-stream";

      const blob = new Blob([response.data], {
        type: contentType,
      });

      const fileUrl = window.URL.createObjectURL(blob);
      const filename = selectedApplication.resume.filename;

      if (action === "view") {
        previewWindow.location.href = fileUrl;

        // Keep the URL available while the PDF viewer loads
        window.setTimeout(() => {
          window.URL.revokeObjectURL(fileUrl);
        }, 60000);
      } else {
        const link = document.createElement("a");

        link.href = fileUrl;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => {
          window.URL.revokeObjectURL(fileUrl);
        }, 1000);
      }
    } catch (err) {
      if (previewWindow && !previewWindow.closed) {
        previewWindow.close();
      }

      setActionError(
        err.response?.data?.message ||
          err.message ||
          "Unable to access the resume."
      );
    } finally {
      setResumeLoading("");
    }
  };

  const startRecord =
    pagination.totalApplications === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const endRecord = Math.min(
    currentPage * PAGE_SIZE,
    pagination.totalApplications
  );

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Job Applications
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          View and manage candidate applications.
        </p>
      </div>

      {/* Search, filter and export */}
      <div className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-[#0c1424] px-4 py-3">
            <Search size={18} className="text-slate-500" />

            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search candidates..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0c1424] px-4 py-3">
            <Filter size={17} className="text-slate-500" />

            <select
              value={statusFilter}
              onChange={(e) =>
                handleStatusFilterChange(e.target.value)
              }
              className="bg-transparent text-sm text-slate-300 outline-none"
            >
              <option value="" className="bg-[#0c1424]">
                All Statuses
              </option>

              {applicationStatuses.map((status) => (
                <option
                  key={status}
                  value={status}
                  className="bg-[#0c1424]"
                >
                  {status}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={
              exporting ||
              loading ||
              pagination.totalApplications === 0
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <FileSpreadsheet size={17} />
            )}

            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        {exportError && (
          <p className="text-sm text-red-400">
            {exportError}
          </p>
        )}
      </div>

      {/* Applications table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0c1424]">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="font-semibold text-white">
            Job Applications
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {loading
              ? "Loading applications..."
              : `${pagination.totalApplications} applications found`}
          </p>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-187.5 text-left text-sm">
            <thead className="bg-slate-900/60 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Candidate</th>
                <th className="px-5 py-4">Position</th>
                <th className="px-5 py-4">Applied Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <LoaderCircle
                      className="mx-auto animate-spin text-blue-400"
                      size={24}
                    />

                    <p className="mt-3 text-sm text-slate-400">
                      Loading applications...
                    </p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-sm text-red-400"
                  >
                    {error}
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No applications found.
                  </td>
                </tr>
              ) : (
                applications.map((application) => (
                  <tr
                    key={application._id}
                    className="transition hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">
                        {application.fullName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {application.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {application.position}
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {formatDate(application.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusStyles[application.status] ||
                          statusStyles.Applied
                        }`}
                      >
                        {application.status || "Applied"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleViewApplication(application._id)
                        }
                        aria-label={`View ${application.fullName}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {!loading &&
          !error &&
          pagination.totalApplications > 0 && (
            <div className="flex flex-col gap-4 border-t border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                Showing{" "}
                <span className="font-medium text-white">
                  {startRecord}-{endRecord}
                </span>{" "}
                of{" "}
                <span className="font-medium text-white">
                  {pagination.totalApplications}
                </span>{" "}
                applications
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(currentPage - 1)
                  }
                  disabled={
                    !pagination.hasPreviousPage || loading
                  }
                  className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="whitespace-nowrap text-sm text-slate-400">
                  Page{" "}
                  <span className="font-semibold text-white">
                    {pagination.currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-white">
                    {pagination.totalPages}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(currentPage + 1)
                  }
                  disabled={!pagination.hasNextPage || loading}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Application details modal */}
      {(selectedApplication || detailsLoading || actionError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-[#0c1424] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Application Details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Candidate information and application status
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedApplication(null);
                  setActionError("");
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-16 text-center">
                <LoaderCircle
                  className="mx-auto animate-spin text-blue-400"
                  size={28}
                />

                <p className="mt-3 text-sm text-slate-400">
                  Loading application details...
                </p>
              </div>
            ) : actionError && !selectedApplication ? (
              <p className="px-6 py-8 text-sm text-red-400">
                {actionError}
              </p>
            ) : selectedApplication ? (
              <div className="space-y-6 p-6">
                {actionError && (
                  <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                    {actionError}
                  </p>
                )}

                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {selectedApplication.fullName}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {selectedApplication.position}
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {[
                    ["Email", selectedApplication.email],
                    ["Phone", selectedApplication.phone],
                    ["Location", selectedApplication.location],
                    ["Qualification", selectedApplication.qualification],
                    ["Applied Date", formatDate(selectedApplication.createdAt)],
                    ["LinkedIn", selectedApplication.linkedin],
                    ["Portfolio", selectedApplication.portfolio],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-slate-500">
                        {label}
                      </p>

                      {label === "LinkedIn" ||
                      label === "Portfolio" ? (
                        value ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block break-all text-sm text-blue-400 hover:underline"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="mt-1 text-sm text-slate-300">
                            —
                          </p>
                        )
                      ) : (
                        <p className="mt-1 wrap-break-word text-sm text-slate-200">
                          {value || "—"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Resume actions */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/10 p-3 text-blue-400">
                      <FileText size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        Resume
                      </p>

                      <p className="truncate text-xs text-slate-400">
                        {selectedApplication.resume?.filename ||
                          "No resume uploaded"}
                      </p>
                    </div>
                  </div>

                  {selectedApplication.resume?.filename && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleResumeAction("view")
                        }
                        disabled={Boolean(resumeLoading)}
                        className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
                      >
                        {resumeLoading === "view" ? (
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Eye size={16} />
                        )}
                        View Resume
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleResumeAction("download")
                        }
                        disabled={Boolean(resumeLoading)}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
                      >
                        {resumeLoading === "download" ? (
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Download size={16} />
                        )}
                        Download Resume
                      </button>
                    </div>
                  )}
                </div>

                {/* Application message */}
                <div>
                  <p className="text-xs text-slate-500">
                    Application Message
                  </p>

                  <p className="mt-2 whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm leading-6 text-slate-300">
                    {selectedApplication.message ||
                      "No message provided."}
                  </p>
                </div>

                {/* Status update */}
                <div className="border-t border-slate-800 pt-5">
                  <label className="mb-2 block text-sm font-medium text-white">
                    Update Application Status
                  </label>

                  <select
                    value={selectedApplication.status || "Applied"}
                    onChange={(e) =>
                      handleStatusUpdate(e.target.value)
                    }
                    disabled={updating}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    {applicationStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  {updating && (
                    <p className="mt-2 text-xs text-slate-400">
                      Updating application status...
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default Applications;
