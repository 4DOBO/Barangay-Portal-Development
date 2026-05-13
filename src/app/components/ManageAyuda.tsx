import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { HandHelping, Plus, Trash2, Calendar, Pencil, DollarSign, Users } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface AyudaProgram {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  distribution: string;
  eligibility: string;
  createdAt: string;
}

interface AyudaApplication {
  id: string;
  programId: string;
  programTitle: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: string;
  method: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  appliedAt: string;
}

export default function ManageAyuda() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<AyudaProgram[]>([]);
  const [applications, setApplications] = useState<AyudaApplication[]>([]);
  const [accessToken, setAccessToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAyudaId, setEditingAyudaId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"programs" | "applications">("programs");

  const emptyForm = {
    title: "",
    description: "",
    amount: "",
    status: "upcoming",
    startDate: "",
    endDate: "",
    distribution: "online",
    eligibility: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchPrograms();
      fetchApplications();
    }
  }, [accessToken]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      navigate("/login");
      return;
    }
    setAccessToken(session.access_token);
  };

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("ayuda_programs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: AyudaProgram[] = data.map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          amount: a.amount,
          status: a.status || "upcoming",
          startDate: a.start_date || "",
          endDate: a.end_date || "",
          distribution: a.distribution,
          eligibility: a.eligibility,
          createdAt: a.created_at,
        }));
        setPrograms(mapped);
      }
    } catch (fetchError) {
      console.error("Error fetching ayuda programs:", fetchError);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("ayuda_applications")
        .select("*, ayuda_programs(title), profiles(email, full_name)")
        .order("applied_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: AyudaApplication[] = data.map((a: any) => ({
          id: a.id,
          programId: a.program_id,
          programTitle: a.ayuda_programs?.title || "Unknown Program",
          userId: a.user_id,
          userEmail: a.profiles?.email || "N/A",
          userName: a.profiles?.full_name || "N/A",
          status: a.status || "pending",
          method: a.method,
          accountName: a.account_name || "",
          accountNumber: a.account_number || "",
          bankName: a.bank_name || "",
          appliedAt: a.applied_at || a.created_at,
        }));
        setApplications(mapped);
      }
    } catch (fetchError) {
      console.error("Error fetching ayuda applications:", fetchError);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const isEditing = Boolean(editingAyudaId);
      const dbData = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount) || 0,
        status: formData.status,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        distribution: formData.distribution,
        eligibility: formData.eligibility,
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from("ayuda_programs")
          .update(dbData)
          .eq("id", editingAyudaId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("ayuda_programs")
          .insert([dbData]);
        if (insertError) throw insertError;
      }

      setSuccess(`Ayuda program ${isEditing ? "updated" : "created"} successfully!`);
      setFormData(emptyForm);
      setEditingAyudaId(null);
      setShowForm(false);
      fetchPrograms();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error saving ayuda program:", err);
      setError(err.message || "Failed to save ayuda program");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (program: AyudaProgram) => {
    setEditingAyudaId(program.id);
    setFormData({
      title: program.title,
      description: program.description,
      amount: String(program.amount),
      status: program.status,
      startDate: program.startDate,
      endDate: program.endDate,
      distribution: program.distribution,
      eligibility: program.eligibility,
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (ayudaId: string) => {
    const confirmed = window.confirm("Delete this ayuda program?");
    if (!confirmed) return;

    try {
      const { error: deleteError } = await supabase
        .from("ayuda_programs")
        .delete()
        .eq("id", ayudaId);

      if (deleteError) throw deleteError;

      setPrograms((prev) => prev.filter((p) => p.id !== ayudaId));
      if (editingAyudaId === ayudaId) {
        setEditingAyudaId(null);
        setFormData(emptyForm);
        setShowForm(false);
      }
    } catch (err: any) {
      console.error("Error deleting ayuda program:", err);
      setError(err.message || "Failed to delete ayuda program");
    }
  };

  const updateApplicationStatus = async (appId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("ayuda_applications")
        .update({ status: newStatus })
        .eq("id", appId);
      if (error) throw error;
      setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err: any) {
      alert(err.message || "Failed to update application status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "ended": return "bg-gray-100 text-gray-700";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Stats */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#1350A3] bg-transparent p-5 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">Ayuda Management</h1>
                <p className="text-sm text-gray-600">Manage barangay assistance programs and view resident applications.</p>
              </div>
              {activeTab === "programs" && (
                <button
                  onClick={() => {
                    if (showForm) {
                      setShowForm(false);
                      setEditingAyudaId(null);
                      setFormData(emptyForm);
                    } else {
                      setShowForm(true);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold border border-[#1350A3] shadow-[2px_2px_0px_0px_#1350A3] transition-transform active:translate-y-1 active:shadow-none"
                >
                  <Plus className="w-5 h-5" />
                  {showForm ? "Cancel" : "New Ayuda"}
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-[#1350A3]/10 text-[#1350A3] rounded-md border border-[#1350A3]">
                  <HandHelping className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Programs</p>
                  <p className="text-xl font-bold text-gray-900">{programs.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-md border border-[#1350A3]">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active</p>
                  <p className="text-xl font-bold text-gray-900">
                    {programs.filter(p => p.status === "active").length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-md border border-[#1350A3]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Applications</p>
                  <p className="text-xl font-bold text-gray-900">{applications.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl border border-[#1350A3] mb-6 overflow-hidden">
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row overflow-x-auto border-b border-[#1350A3]">
            <button
              onClick={() => setActiveTab("programs")}
              className={`flex-1 flex justify-center items-center gap-2 py-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors sm:border-b-4 border-b-0 border-l-4 sm:border-l-0 ${activeTab === "programs" ? "border-[#1350A3] text-[#1350A3] bg-gray-100" : "border-transparent text-gray-500 hover:text-[#1350A3] hover:bg-gray-50"
                }`}
            >
              Ayuda Programs
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`flex-1 flex justify-center items-center gap-2 py-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors sm:border-b-4 border-b-0 border-l-4 sm:border-l-0 ${activeTab === "applications" ? "border-[#1350A3] text-[#1350A3] bg-gray-100" : "border-transparent text-gray-500 hover:text-[#1350A3] hover:bg-gray-50"
                }`}
            >
              Ayuda Applications ({applications.length})
            </button>
          </div>

          <div className="p-6 bg-transparent">
            {activeTab === "programs" && (
              <>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {success}
                  </div>
                )}

                {showForm && (
                  <div className="bg-white rounded-2xl border border-[#1350A3] p-8 mb-8 shadow-[4px_4px_0px_0px_#1350A3]">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <HandHelping className="w-5 h-5" />
                      {editingAyudaId ? "Edit Ayuda Program" : "Create New Ayuda Program"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          id="title"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ayuda program title"
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          id="description"
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe the ayuda program"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                            Amount (₱) *
                          </label>
                          <input
                            type="number"
                            id="amount"
                            required
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                            Status *
                          </label>
                          <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="active">Active</option>
                            <option value="ended">Ended</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
                            Start Date
                          </label>
                          <input
                            type="date"
                            id="startDate"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
                            End Date
                          </label>
                          <input
                            type="date"
                            id="endDate"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="distribution" className="block text-sm font-semibold text-gray-700 mb-2">
                          Distribution Method *
                        </label>
                        <select
                          id="distribution"
                          value={formData.distribution}
                          onChange={(e) => setFormData({ ...formData, distribution: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="online">Online</option>
                          <option value="face-to-face">Face-to-Face</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="eligibility" className="block text-sm font-semibold text-gray-700 mb-2">
                          Eligibility Requirements *
                        </label>
                        <textarea
                          id="eligibility"
                          required
                          value={formData.eligibility}
                          onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Who is eligible for this program?"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed border border-[#1350A3] shadow-[2px_2px_0px_0px_#1350A3] transition-transform active:translate-y-1 active:shadow-none"
                      >
                        {submitting ? (editingAyudaId ? "Saving..." : "Creating...") : (editingAyudaId ? "Save Changes" : "Create Ayuda Program")}
                      </button>
                    </form>
                  </div>
                )}

                <div className="bg-transparent">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">All Ayuda Programs</h2>

                  {programs.length === 0 ? (
                    <div className="text-center py-12">
                      <HandHelping className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No ayuda programs yet. Create your first one!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {programs.map((program) => (
                        <div key={program.id} className="relative border border-[#1350A3] rounded-2xl overflow-hidden hover:shadow-[4px_4px_0px_0px_#1350A3] transition">
                          <div className="p-6 pb-16">
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(program.status)}`}>
                                {program.status}
                              </span>
                              <span className="text-lg font-bold text-[#1350A3]">₱{program.amount.toLocaleString()}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                            <p className="text-gray-600 mb-4">{program.description}</p>
                            
                            <div className="grid gap-2 text-sm bg-gray-50 border border-[#1350A3] p-4 rounded-xl">
                              <p className="text-gray-700"><span className="font-bold uppercase text-xs tracking-wider text-gray-500 block mb-1">Distribution</span> {program.distribution}</p>
                              <p className="text-gray-700"><span className="font-bold uppercase text-xs tracking-wider text-gray-500 block mb-1">Eligibility</span> {program.eligibility}</p>
                              {(program.startDate || program.endDate) && (
                                <p className="text-gray-700">
                                  <span className="font-bold uppercase text-xs tracking-wider text-gray-500 block mb-1">Period</span>
                                  {program.startDate ? new Date(program.startDate).toLocaleDateString() : "TBD"} — {program.endDate ? new Date(program.endDate).toLocaleDateString() : "TBD"}
                                </p>
                              )}
                            </div>
                            
                            <div className="absolute right-4 bottom-4 flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleEdit(program)}
                                className="text-gray-700 transition hover:text-blue-600"
                                style={{ background: "none", border: "none" }}
                                aria-label="Edit ayuda program"
                              >
                                <Pencil className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(program.id)}
                                className="text-gray-700 transition hover:text-red-600"
                                style={{ background: "none", border: "none" }}
                                aria-label="Delete ayuda program"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "applications" && (
              <div className="bg-transparent">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Resident Ayuda Applications</h2>

                {applications.length === 0 ? (
                  <div className="py-12 text-center bg-gray-50 border border-[#1350A3] rounded-2xl border-dashed">
                    <HandHelping className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                    <p className="text-gray-500">No ayuda applications yet.</p>
                    <p className="mt-2 text-sm text-gray-400">Applications submitted by residents via the mobile app will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="border border-[#1350A3] rounded-2xl p-6 hover:shadow-[4px_4px_0px_0px_#1350A3] transition">
                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{app.programTitle}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                                {app.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mt-3">
                              <p><span className="font-bold">Applicant:</span> {app.userName}</p>
                              <p><span className="font-bold">Email:</span> {app.userEmail}</p>
                              <p><span className="font-bold">Method:</span> {app.method}</p>
                              <p><span className="font-bold">Applied:</span> {new Date(app.appliedAt).toLocaleDateString()}</p>
                              {app.bankName && <p><span className="font-bold">Bank:</span> {app.bankName}</p>}
                              {app.accountName && <p><span className="font-bold">Account:</span> {app.accountName}</p>}
                            </div>
                          </div>
                          {app.status === "pending" && (
                            <div className="flex items-start gap-2 shrink-0">
                              <button
                                onClick={() => updateApplicationStatus(app.id, "approved")}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateApplicationStatus(app.id, "rejected")}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
