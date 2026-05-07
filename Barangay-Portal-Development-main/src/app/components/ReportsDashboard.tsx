import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FileText, MapPin, User, Phone, Calendar } from "lucide-react";
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

  const getCategoryIcon = (category: string) => {
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports Dashboard</h1>
          <p className="text-gray-600">Manage and track all resident reports</p>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap gap-2 p-4 border-b">
            <button
              onClick={() => setActiveFilter("primary")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeFilter === "primary"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Primary ({reports.length})
            </button>
            <button
              onClick={() => setActiveFilter("pending")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeFilter === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending ({reports.filter((r) => r.status === "pending").length})
            </button>
            <button
              onClick={() => setActiveFilter("in_progress")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeFilter === "in_progress"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              In Progress ({reports.filter((r) => r.status === "in_progress").length})
            </button>
            <button
              onClick={() => setActiveFilter("done")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeFilter === "done"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
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
                  <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
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
