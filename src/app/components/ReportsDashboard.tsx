import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FileText, MapPin, User, Phone, Calendar, Mail, Trash2, Activity, CheckCircle, Hash, ShieldAlert } from "lucide-react";
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
      // 1. Updated query to join the 'profiles' table using the foreign key
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
        const mappedReports: Report[] = data.map((r: any) => ({
          id: r.id,
          title: `${r.issue_type} Issue`,
          description: r.description || "",
          category: r.issue_type || "other",
          location: r.location || "",
          // 2. Map the actual data from the joined profiles table
          contactName: r.profiles?.full_name || "Anonymous Reporter",
          contactPhone: r.profiles?.phone || "",
          status: r.status,
          createdAt: r.created_at,
          updatedAt: r.created_at,
        }));
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
  };

  const updateReportStatus = async (reportId: string, newStatus: "pending" | "in-progress" | "completed") => {
    try {
      // 1. Add .select() to verify the row was actually updated in the DB
      const { data, error } = await supabase
        .from("reports")
        .update({ status: newStatus })
        .eq("id", reportId)
        .select(); // <--- This is the crucial addition

      if (error) throw error;

      // 2. Check for the silent failure (RLS block)
      if (!data || data.length === 0) {
        throw new Error("Update blocked by database. Please check your admin permissions or Supabase RLS policies.");
      }

      // 3. Only update local React state if the DB update was confirmed successful
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r))
      );
    } catch (error: any) {
      console.error("Error updating report status:", error);
      alert(error.message || "Failed to update report status in database.");
    }
  };

  const deleteReport = async (reportId: string) => {
    const confirmed = window.confirm("Delete this completed report?");
    if (!confirmed) return;

    try {
      // 3. Add .select() to verify the row was actually deleted
      const { data, error } = await supabase
        .from("reports")
        .delete()
        .eq("id", reportId)
        .select();

      if (error) throw error;

      // 4. Catch the silent RLS block
      if (!data || data.length === 0) {
        throw new Error("Delete blocked by database. Please check your admin permissions.");
      }

      setReports((prev) => prev.filter((report) => report.id !== reportId));
    } catch (error: any) {
      console.error("Error deleting report:", error);
      alert(error.message || "Failed to delete report in database.");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };


  const getCategoryIcon = (category: string) => {
    return <FileText className="w-4 h-4" />;
  };

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

        {/* Reports Container */}
        <div className="bg-white rounded-2xl border border-[#1350A3] mb-6 overflow-hidden">
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row overflow-x-auto border-b border-[#1350A3]">
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

          {/* List */}
          <div className="p-6 bg-transparent">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading reports...</div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No reports found for {activeFilter === "primary" ? "all categories" : getStatusLabel(activeFilter).toLowerCase()}.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredReports.map((report) => (
                  <div key={report.id} className="relative bg-white border border-[#1350A3] rounded-2xl p-6 transition hover:shadow-[4px_4px_0px_0px_#1350A3]">
                    <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="flex items-center gap-1 text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            <Hash className="w-3 h-3" />
                            RPT-{report.id.substring(0, 6).toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadgeColor(report.status)}`}>
                            {getStatusLabel(report.status)}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">{report.title}</h3>
                        <p className="text-gray-700 mb-6">{report.description}</p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm bg-transparent border border-[#1350A3] p-4 rounded-xl">
                          <div>
                            <p className="text-gray-400 mb-2 text-xs uppercase font-bold tracking-wider">Report Details</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-700">
                                {getCategoryIcon(report.category)}
                                <span className="capitalize font-medium">{report.category.replace("_", " ")}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{new Date(report.createdAt).toLocaleString()}</span>
                              </div>
                              {report.location && (
                                <div className="flex items-start gap-2 text-gray-700">
                                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                  <span>{report.location}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-400 mb-2 text-xs uppercase font-bold tracking-wider">Reporter Info</p>
                            <div className="space-y-2">
                              {report.contactName ? (
                                <div className="flex items-center gap-2 text-gray-700">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium">{report.contactName}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-gray-400 italic">
                                  <User className="w-4 h-4" />
                                  <span>Anonymous Reporter</span>
                                </div>
                              )}
                              {report.contactPhone && (
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span>{report.contactPhone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions Sidebar */}
                      <div className="flex flex-col gap-2 w-full xl:w-48 shrink-0 bg-transparent p-4 rounded-xl border border-[#1350A3] xl:border-none xl:p-0">
                        <p className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-1 xl:block hidden">Update Status</p>

                        {/* Pending Button - Disabled ONLY if currently pending */}
                        <button
                          onClick={() => updateReportStatus(report.id, "pending")}
                          disabled={report.status === "pending"}
                          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors border ${report.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 border-[#1350A3] cursor-default"
                            : "bg-white border-[#1350A3] text-gray-900 hover:bg-yellow-50 hover:text-yellow-800"
                            }`}
                        >
                          <ShieldAlert className="w-4 h-4" /> Pending
                        </button>

                        {/* In Progress Button - Disabled ONLY if currently in-progress */}
                        <button
                          onClick={() => updateReportStatus(report.id, "in-progress")}
                          disabled={report.status === "in-progress"}
                          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors border ${report.status === "in-progress"
                            ? "bg-blue-100 text-blue-800 border-[#1350A3] cursor-default"
                            : "bg-white border-[#1350A3] text-gray-900 hover:bg-blue-50 hover:text-blue-800"
                            }`}
                        >
                          <Activity className="w-4 h-4" /> In Progress
                        </button>

                        {/* Resolved Button - Disabled ONLY if currently completed */}
                        <button
                          onClick={() => updateReportStatus(report.id, "completed")}
                          disabled={report.status === "completed"}
                          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors border ${report.status === "completed"
                            ? "bg-green-100 text-green-800 border-[#1350A3] cursor-default"
                            : "bg-white border-[#1350A3] text-gray-900 hover:bg-green-50 hover:text-green-800"
                            }`}
                        >
                          <CheckCircle className="w-4 h-4" /> Resolved
                        </button>

                        {activeFilter === "completed" && report.status === "completed" && (
                          <>
                            <div className="h-px bg-[#1350A3] my-2 hidden xl:block"></div>
                            <button
                              onClick={() => deleteReport(report.id)}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#1350A3] text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Delete Record
                            </button>
                          </>
                        )}
                      </div>
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
