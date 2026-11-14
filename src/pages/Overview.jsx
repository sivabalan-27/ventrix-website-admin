
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

import {
  BriefcaseBusiness,
  Users,
  MessageSquare,
  Clock3,
  RefreshCw,
  Activity,
  AlertCircle,
  BarChart3,
  TrendingUp,
} from "lucide-react";

import StatCard from "../components/StatCard";

const STATUS_COLORS = {
  Applied: "bg-blue-500",
  "Under Review": "bg-yellow-500",
  Shortlisted: "bg-purple-500",
  Interview: "bg-cyan-500",
  Selected: "bg-emerald-500",
  Rejected: "bg-red-500",
};

const PRIORITY_COLORS = {
  High: "bg-red-500",
  Medium: "bg-yellow-500",
  Low: "bg-emerald-500",
  Unclassified: "bg-slate-500",
};

function Overview() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    newApplications: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
  });

  const [analytics, setAnalytics] = useState({
    applicationStatuses: [],
    enquiryPriorities: [],
    monthlyTrends: [],
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/api/admin/dashboard/stats");

      setStats(response.data.stats);

      setAnalytics({
        applicationStatuses:
          response.data.analytics?.applicationStatuses || [],
        enquiryPriorities:
          response.data.analytics?.enquiryPriorities || [],
        monthlyTrends:
          response.data.analytics?.monthlyTrends || [],
      });

      setRecentActivity(response.data.recentActivity || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    {
      title: "Total Applications",
      value: stats.totalApplications,
      description: "All submitted applications",
      icon: BriefcaseBusiness,
      color: "blue",
    },
    {
      title: "New Applications",
      value: stats.newApplications,
      description: "Awaiting review",
      icon: Users,
      color: "purple",
    },
    {
      title: "Total Enquiries",
      value: stats.totalEnquiries,
      description: "All service enquiries",
      icon: MessageSquare,
      color: "cyan",
    },
    {
      title: "New Enquiries",
      value: stats.newEnquiries,
      description: "Awaiting response",
      icon: Clock3,
      color: "orange",
    },
  ];

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      Applied: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "Under Review": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      Shortlisted: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Interview: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      Selected: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Rejected: "bg-red-500/10 text-red-400 border-red-500/20",
      New: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Contacted: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      "In Discussion": "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Converted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Closed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };

    return (
      styles[status] ||
      "bg-slate-500/10 text-slate-400 border-slate-500/20"
    );
  };

  const applicationStatusTotal = analytics.applicationStatuses.reduce(
    (total, item) => total + item.count,
    0
  );

  const enquiryPriorityTotal = analytics.enquiryPriorities.reduce(
    (total, item) => total + item.count,
    0
  );

  const maxMonthlyValue = Math.max(
    1,
    ...analytics.monthlyTrends.flatMap((item) => [
      item.applications,
      item.enquiries,
    ])
  );

  return (
    <div className="space-y-8">
      {/* Dashboard heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Dashboard Overview
            </h1>

            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              Live
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Monitor job applications and service enquiries.
          </p>

          {lastUpdated && (
            <p className="mt-2 text-xs text-slate-500">
              Last updated: {formatDate(lastUpdated)}
            </p>
          )}
        </div>

        <button
          onClick={() => fetchDashboardData(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#111c30] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={19} className="shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>

          <button
            onClick={() => fetchDashboardData(true)}
            className="text-left text-sm font-semibold text-red-300 hover:text-white"
          >
            Try again
          </button>
        </div>
      )}

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Activity size={17} className="text-blue-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Performance Summary
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-4">
          {statCards.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      </section>

      {/* Analytics */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Analytics & Insights
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* Application status chart */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c1424] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">
                  Application Status
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Distribution by application stage
                </p>
              </div>

              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <BriefcaseBusiness size={20} />
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-5 flex items-end justify-between">
                <span className="text-sm text-slate-400">
                  Total applications
                </span>
                <span className="text-3xl font-bold text-white">
                  {applicationStatusTotal}
                </span>
              </div>

              {loading ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  Loading analytics...
                </p>
              ) : applicationStatusTotal === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No application data available.
                </p>
              ) : (
                <div className="space-y-5">
                  {analytics.applicationStatuses.map((item) => {
                    const percentage =
                      (item.count / applicationStatusTotal) * 100;

                    return (
                      <div key={item.status}>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                STATUS_COLORS[item.status] || "bg-slate-500"
                              }`}
                            />
                            <span className="text-sm text-slate-300">
                              {item.status}
                            </span>
                          </div>

                          <span className="text-sm font-semibold text-white">
                            {item.count}
                            <span className="ml-2 text-xs font-normal text-slate-500">
                              {percentage.toFixed(0)}%
                            </span>
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              STATUS_COLORS[item.status] || "bg-slate-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Enquiry priority chart */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c1424] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">
                  Enquiry Priority
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  AI-classified service enquiries
                </p>
              </div>

              <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                <MessageSquare size={20} />
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-5 flex items-end justify-between">
                <span className="text-sm text-slate-400">
                  Total enquiries
                </span>
                <span className="text-3xl font-bold text-white">
                  {enquiryPriorityTotal}
                </span>
              </div>

              {loading ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  Loading analytics...
                </p>
              ) : enquiryPriorityTotal === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No enquiry classification data available.
                </p>
              ) : (
                <div className="space-y-5">
                  {["High", "Medium", "Low", "Unclassified"].map(
                    (priority) => {
                      const item = analytics.enquiryPriorities.find(
                        (entry) => entry.priority === priority
                      );

                      const count = item?.count || 0;
                      const percentage =
                        (count / enquiryPriorityTotal) * 100;

                      return (
                        <div key={priority}>
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${PRIORITY_COLORS[priority]}`}
                              />
                              <span className="text-sm text-slate-300">
                                {priority}
                              </span>
                            </div>

                            <span className="text-sm font-semibold text-white">
                              {count}
                              <span className="ml-2 text-xs font-normal text-slate-500">
                                {percentage.toFixed(0)}%
                              </span>
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${PRIORITY_COLORS[priority]}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monthly trends */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1424] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-white">
                Monthly Trends
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Applications and enquiries received over the last six months.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-400">
                  Applications
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                <span className="text-xs text-slate-400">
                  Enquiries
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="py-12 text-center text-sm text-slate-500">
              Loading monthly trends...
            </p>
          ) : analytics.monthlyTrends.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No monthly trend data available.
            </p>
          ) : (
            <div className="mt-8">
              <div className="grid h-56 grid-cols-6 gap-3 sm:gap-6">
                {analytics.monthlyTrends.map((item) => {
                  const applicationHeight =
                    (item.applications / maxMonthlyValue) * 100;

                  const enquiryHeight =
                    (item.enquiries / maxMonthlyValue) * 100;

                  return (
                    <div
                      key={item.month}
                      className="flex min-w-0 flex-col items-center"
                    >
                      <div className="mb-2 flex h-6 w-full justify-center gap-1 text-[10px] text-slate-400">
                        <span>{item.applications || ""}</span>
                        <span>{item.enquiries || ""}</span>
                      </div>

                      <div className="flex w-full flex-1 items-end justify-center gap-1 border-b border-slate-700">
                        <div
                          title={`${item.applications} applications`}
                          className="w-3 rounded-t-sm bg-blue-500 transition-all duration-500 sm:w-5"
                          style={{
                            height: `${applicationHeight}%`,
                            minHeight:
                              item.applications > 0 ? "4px" : "0px",
                          }}
                        />

                        <div
                          title={`${item.enquiries} enquiries`}
                          className="w-3 rounded-t-sm bg-cyan-400 transition-all duration-500 sm:w-5"
                          style={{
                            height: `${enquiryHeight}%`,
                            minHeight: item.enquiries > 0 ? "4px" : "0px",
                          }}
                        />
                      </div>

                      <span className="mt-3 text-xs text-slate-400">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-800 pt-4 text-xs text-slate-500">
                <TrendingUp size={15} />
                Monthly data is based on record creation dates.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent activity */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0c1424]">
        <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest applications and service enquiries.
            </p>
          </div>

          <span className="w-fit rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-400">
            {recentActivity.length} recent records
          </span>
        </div>

        {loading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-4"
              >
                <div className="h-11 w-11 rounded-xl bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-slate-800" />
                  <div className="h-3 w-2/3 rounded bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="rounded-full border border-slate-700 bg-slate-800/50 p-4">
              <MessageSquare size={25} className="text-slate-400" />
            </div>

            <h3 className="mt-4 font-medium text-white">
              No recent activity
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              New applications and service enquiries will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentActivity.map((activity, index) => (
              <div
                key={activity.id || `${activity.type}-${index}`}
                className="flex flex-col gap-3 px-5 py-5 transition hover:bg-slate-800/20 sm:flex-row sm:items-center sm:px-6"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    activity.type === "application"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-cyan-500/10 text-cyan-400"
                  }`}
                >
                  {activity.type === "application" ? (
                    <BriefcaseBusiness size={20} />
                  ) : (
                    <MessageSquare size={20} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-white">
                    {activity.name || "Unknown"}
                  </h3>

                  <p className="mt-1 truncate text-sm text-slate-400">
                    {activity.description || "New activity"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>

                <span
                  className={`w-fit shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                    activity.status
                  )}`}
                >
                  {activity.status || "Unknown"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Overview;
