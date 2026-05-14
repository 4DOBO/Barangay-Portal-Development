import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FileText, MapPin, User, Phone, Calendar, Trash2, Activity, CheckCircle, Hash, ShieldAlert, Clock } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  contactName: string;
  contactPhone: string;
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
}

type FilterStatus = "primary" | "pending" | "in-progress" | "completed";

export default function ReportsDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("primary");
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState("");
  const [displayName, setDisplayName] = useState("User");

  // NEW: Track the currently selected report for the right panel
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

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
      setLoading(true);
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          profiles:user_id (
            full_name,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedReports: Report[] = data.map((r: any) => {
          // Supabase joins can sometimes return an array or single object
          const profileInfo = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;

          return {
            id: r.id,
            title: `${r.issue_type} Issue`,
            description: r.description || "",
            category: r.issue_type || "other",
            location: r.location || "",
            contactName: profileInfo?.full_name || "Anonymous Reporter",
            contactPhone: profileInfo?.phone || "",
            status: r.status,
            createdAt: r.created_at,
            updatedAt: r.created_at,
          };
        });
        setReports(mappedReports);
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
    // Optional: Clear selection when changing tabs
    setSelectedReportId(null);
  };

  const updateReportStatus = async (reportId: string, newStatus: "pending" | "in-progress" | "completed") => {
    try {
      const dbStatus =
        newStatus === "in-progress" ? "in_progress" :
        newStatus === "completed" ? "done" :
        "pending";

      const { error } = await supabase
        .from("reports")
        .update({ status: dbStatus })
        .eq("id", reportId);

      if (error) throw error;

      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r))
      );
    } catch (error: any) {
      console.error("Error updating report status:", error);
      alert(error.message || "Failed to update report status");
    }
  };

  const deleteReport = async (reportId: string) => {
    const confirmed = window.confirm("Delete this report permanently?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;

      // If the deleted report was currently selected, clear the right panel
      if (reportId === selectedReportId) {
        setSelectedReportId(null);
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
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Resolved";
      default:
        return status;
    }
  };

  // Find the full report object based on the currently selected ID
  const activeReport = reports.find(r => r.id === selectedReportId) || null;

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header & Stats */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#1350A3] bg-transparent p-5 md:p-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome, {displayName}</h1>
              <p className="text-sm text-gray-600">Here is the current status of all resident reports in Barangay Maligaya.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-[#1350A3]/10 text-[#1350A3] rounded-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Reports</p>
                  <p className="text-xl font-bold text-gray-900">{reports.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-md">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pending</p>
                  <p className="text-xl font-bold text-gray-900">{reports.filter((r) => r.status === "pending").length}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">In Progress</p>
                  <p className="text-xl font-bold text-gray-900">{reports.filter((r) => r.status === "in-progress").length}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-md">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Resolved</p>
                  <p className="text-xl font-bold text-gray-900">{reports.filter((r) => r.status === "completed").length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Container - NEW MASTER-DETAIL LAYOUT */}
        <div className="bg-white rounded-2xl border border-[#1350A3] mb-6 overflow-hidden flex flex-col">

          {/* Tabs */}
          <div className="flex flex-col sm:flex-row overflow-x-auto border-b border-[#1350A3] shrink-0">
            <button
              onClick={() => setActiveFilter("primary")}
              className={`flex-1 flex justify-center items-center gap-2 py-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors sm:border-b-4 border-b-0 border-l-4 sm:border-l-0 ${activeFilter === "primary" ? "border-[#1350A3] text-[#1350A3] bg-gray-100" : "border-transparent text-gray-500 hover:text-[#1350A3] hover:bg-gray-50"
                }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setActiveFilter("pending")}
              className={`flex-1 flex justify-center items-center gap-2 py-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors sm:border-b-4 border-b-0 border-l-4 sm:border-l-0 ${activeFilter === "pending" ? "border-[#1350A3] text-[#1350A3] bg-gray-100" : "border-transparent text-gray-500 hover:text-[#1350A3] hover:bg-gray-50"
                }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveFilter("in-progress")}
              className={`flex-1 flex justify-center items-center gap-2 py-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors sm:border-b-4 border-b-0 border-l-4 sm:border-l-0 ${activeFilter === "in-progress" ? "border-[#1350A3] text-[#1350A3] bg-gray-100" : "border-transparent text-gray-500 hover:text-[#1350A3] hover:bg-gray-50"
                }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveFilter("completed")}
              className={`flex-1 flex justify-center items-center gap-2 py-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors sm:border-b-4 border-b-0 border-l-4 sm:border-l-0 ${activeFilter === "completed" ? "border-[#1350A3] text-[#1350A3] bg-gray-100" : "border-transparent text-gray-500 hover:text-[#1350A3] hover:bg-gray-50"
                }`}
            >
              Resolved
            </button>
          </div>

          {/* SPLIT PANE CONTAINER */}
          <div className="flex flex-col lg:flex-row h-auto min-h-[600px] lg:h-[700px]">

            {/* LEFT PANE: List View */}
            <div className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-[#1350A3] bg-gray-50/50 overflow-y-auto">
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading reports...</div>
              ) : filteredReports.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No reports found for {activeFilter === "primary" ? "all categories" : getStatusLabel(activeFilter).toLowerCase()}.
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReportId(report.id)}
                      className={`relative p-4 rounded-xl border transition-all cursor-pointer ${selectedReportId === report.id
                          ? "border-[#1350A3] bg-blue-50 shadow-[3px_3px_0px_0px_#1350A3] translate-x-1"
                          : "border-gray-200 bg-white hover:border-[#1350A3] hover:shadow-[3px_3px_0px_0px_#1350A3]"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <span className="flex items-center gap-1 text-xs font-mono text-gray-500">
                          <Hash className="w-3 h-3" />
                          RPT-{report.id.substring(0, 6).toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeColor(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{report.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT PANE: Detailed View */}
            <div className="w-full lg:w-3/5 bg-white p-6 lg:p-8 overflow-y-auto">
              {!activeReport ? (
                // Empty State
                <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                  <div className="p-4 bg-gray-50 rounded-full mb-4 border border-gray-200">
                    <FileText className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Report Selected</h3>
                  <p className="text-sm text-gray-500 max-w-sm">Select a report from the list on the left to view its full details and manage its status.</p>
                </div>
              ) : (
                // Active Report Detail
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="flex items-center gap-1 text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                      <Hash className="w-4 h-4" />
                      RPT-{activeReport.id.substring(0, 6).toUpperCase()}
                    </span>
                    <span className={`px-4 py-1.5 border rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadgeColor(activeReport.status)}`}>
                      {getStatusLabel(activeReport.status)}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{activeReport.title}</h2>

                  <div className="prose prose-sm max-w-none text-gray-700 mb-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    {activeReport.description}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-8">
                    {/* Details Column */}
                    <div>
                      <p className="text-gray-400 mb-3 text-xs uppercase font-bold tracking-wider">Report Details</p>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-gray-700">
                          <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><FileText className="w-4 h-4" /></div>
                          <span className="capitalize font-medium">{activeReport.category.replace("_", " ")}</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-700">
                          <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><Clock className="w-4 h-4" /></div>
                          <span>{new Date(activeReport.createdAt).toLocaleString()}</span>
                        </li>
                        {activeReport.location && (
                          <li className="flex items-start gap-3 text-gray-700">
                            <div className="p-2 bg-gray-100 rounded-lg text-gray-500 shrink-0"><MapPin className="w-4 h-4" /></div>
                            <span className="mt-1">{activeReport.location}</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Reporter Column */}
                    <div>
                      <p className="text-gray-400 mb-3 text-xs uppercase font-bold tracking-wider">Reporter Info</p>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-gray-700">
                          <div className="p-2 bg-blue-50 text-[#1350A3] rounded-lg"><User className="w-4 h-4" /></div>
                          <span className="font-medium">{activeReport.contactName}</span>
                        </li>
                        {activeReport.contactPhone && (
                          <li className="flex items-center gap-3 text-gray-700">
                            <div className="p-2 bg-blue-50 text-[#1350A3] rounded-lg"><Phone className="w-4 h-4" /></div>
                            <span>{activeReport.contactPhone}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-3">Update Status</p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => updateReportStatus(activeReport.id, "pending")}
                        disabled={activeReport.status === "pending"}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border ${activeReport.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300 cursor-default shadow-sm"
                          : "bg-white border-gray-300 text-gray-600 hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-300"
                          }`}
                      >
                        <ShieldAlert className="w-4 h-4" /> Pending
                      </button>
                      <button
                        onClick={() => updateReportStatus(activeReport.id, "in-progress")}
                        disabled={activeReport.status === "in-progress"}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border ${activeReport.status === "in-progress"
                          ? "bg-blue-100 text-blue-800 border-blue-300 cursor-default shadow-sm"
                          : "bg-white border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
                          }`}
                      >
                        <Activity className="w-4 h-4" /> In Progress
                      </button>
                      <button
                        onClick={() => updateReportStatus(activeReport.id, "completed")}
                        disabled={activeReport.status === "completed"}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border ${activeReport.status === "completed"
                          ? "bg-green-100 text-green-800 border-green-300 cursor-default shadow-sm"
                          : "bg-white border-gray-300 text-gray-600 hover:bg-green-50 hover:text-green-800 hover:border-green-300"
                          }`}
                      >
                        <CheckCircle className="w-4 h-4" /> Resolved
                      </button>
                    </div>

                    {/* Delete Option (Only visible when resolved/completed) */}
                    {activeReport.status === "completed" && (
                      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => deleteReport(activeReport.id)}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 hover:border-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Record
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
