import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FileText, MapPin, User, Phone, Calendar, Mail, Trash2 } from "lucide-react";
import { supabase, API_URL, publicAnonKey } from "../../lib/supabase";

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  contactName: string;
  contactPhone: string;
  status: "pending" | "in_progress" | "done";
  createdAt: string;
  updatedAt: string;
}

type FilterStatus = "primary" | "pending" | "in_progress" | "done";

export default function ReportsDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("primary");
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState("");
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchReports();
    }
  }, [accessToken]);

  useEffect(() => {
    applyFilter();
  }, [reports, activeFilter]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      navigate("/login");
      return;
    }
    const metadataName =
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.name ||
      session.user.user_metadata?.display_name;
    const emailName = session.user.email?.split("@")[0];
    setDisplayName(metadataName || emailName || "User");
    setAccessToken(session.access_token);
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });

      const data = await response.json();
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (activeFilter === "primary") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter((r) => r.status === activeFilter));
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: "pending" | "in_progress" | "done") => {
    try {
      const response = await fetch(`${API_URL}/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update report");
      }

      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r))
      );
    } catch (error: any) {
      console.error("Error updating report status:", error);
      alert(error.message || "Failed to update report status");
    }
  };

  const deleteReport = async (reportId: string) => {
    const confirmed = window.confirm("Delete this completed report?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/reports/${reportId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete report");
      }

      setReports((prev) => prev.filter((report) => report.id !== reportId));
    } catch (error: any) {
      console.error("Error deleting report:", error);
      alert(error.message || "Failed to delete report");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "done":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  const getFilterButtonClass = (filter: FilterStatus) => {
    const isActive = activeFilter === filter;

    if (!isActive) {
      return "border-b-2 border-transparent text-gray-600 hover:text-gray-900";
    }

    switch (filter) {
      case "pending":
        return "border-b-2 border-yellow-600 text-yellow-600";
      case "in_progress":
        return "border-b-2 border-blue-600 text-blue-600";
      case "done":
        return "border-b-2 border-green-600 text-green-600";
      default:
        return "border-b-2 border-[#1350A3] text-[#1350A3]";
    }
  };

  const getFilterIndicatorClass = (filter: FilterStatus) => {
    const isActive = activeFilter === filter;

    if (!isActive) {
      return "border-gray-400 bg-transparent text-gray-400";
    }

    switch (filter) {
      case "pending":
        return "border-yellow-600 bg-yellow-600 text-yellow-600";
      case "in_progress":
        return "border-blue-600 bg-blue-600 text-blue-600";
      case "done":
        return "border-green-600 bg-green-600 text-green-600";
      default:
        return "border-[#1350A3] bg-transparent text-[#1350A3]";
    }
  };

  const getCategoryIcon = (category: string) => {
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-black bg-transparent p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {displayName}</h1>
            <p className="text-gray-600">Have a great day.</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm font-medium text-gray-500">
              Total Reports as of {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-4xl font-bold text-[#1350A3]">{reports.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap gap-2 p-4 border-b">
            <button
              onClick={() => setActiveFilter("primary")}
              className={`flex items-center gap-3 px-2 py-3 text-lg font-semibold transition ${getFilterButtonClass("primary")}`}
            >
              <Mail className={`h-5 w-5 ${getFilterIndicatorClass("primary")}`} />
              Primary ({reports.length})
            </button>
            <button
              onClick={() => setActiveFilter("pending")}
              className={`flex items-center gap-3 px-2 py-3 text-lg font-semibold transition ${getFilterButtonClass("pending")}`}
            >
              <span className={`h-4 w-4 rounded-xs border ${getFilterIndicatorClass("pending")}`} />
              Pending ({reports.filter((r) => r.status === "pending").length})
            </button>
            <button
              onClick={() => setActiveFilter("in_progress")}
              className={`flex items-center gap-3 px-2 py-3 text-lg font-semibold transition ${getFilterButtonClass("in_progress")}`}
            >
              <span className={`h-4 w-4 rounded-xs border ${getFilterIndicatorClass("in_progress")}`} />
              In Progress ({reports.filter((r) => r.status === "in_progress").length})
            </button>
            <button
              onClick={() => setActiveFilter("done")}
              className={`flex items-center gap-3 px-2 py-3 text-lg font-semibold transition ${getFilterButtonClass("done")}`}
            >
              <span className={`h-4 w-4 rounded-xs border ${getFilterIndicatorClass("done")}`} />
              Done ({reports.filter((r) => r.status === "done").length})
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading reports...</div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No reports found for the {activeFilter === "primary" ? "all categories" : getStatusLabel(activeFilter)}.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div key={report.id} className="relative border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                    {activeFilter === "done" && report.status === "done" && (
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-red-600 transition hover:text-red-700"
                        style={{ background: "none", border: "none" }}
                        aria-label="Delete report"
                      >
                        <Trash2 className="h-6 w-6" />
                      </button>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{report.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(report.status)}`}>
                            {getStatusLabel(report.status)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(report.category)}
                            <span className="capitalize">{report.category.replace("_", " ")}</span>
                          </div>
                          {report.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{report.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(report.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{report.description}</p>
                        {(report.contactName || report.contactPhone) && (
                          <div className="flex gap-4 text-sm text-gray-600">
                            {report.contactName && (
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{report.contactName}</span>
                              </div>
                            )}
                            {report.contactPhone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                <span>{report.contactPhone}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        onClick={() => updateReportStatus(report.id, "pending")}
                        disabled={report.status === "pending"}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Mark Pending
                      </button>
                      <button
                        onClick={() => updateReportStatus(report.id, "in_progress")}
                        disabled={report.status === "in_progress"}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Mark In Progress
                      </button>
                      <button
                        onClick={() => updateReportStatus(report.id, "done")}
                        disabled={report.status === "done"}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Mark Done
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
