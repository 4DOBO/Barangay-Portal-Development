import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FolderKanban, Plus, Trash2, Calendar, Megaphone, X } from "lucide-react";
import { supabase, API_URL, publicAnonKey } from "../../lib/supabase";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: string;
  createdAt: string;
}

export default function ManageProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [accessToken, setAccessToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Announcement modal state
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annProject, setAnnProject] = useState<Project | null>(null);
  const [annForm, setAnnForm] = useState({ title: "", content: "", imageUrl: "" });
  const [annSubmitting, setAnnSubmitting] = useState(false);
  const [annError, setAnnError] = useState("");

  const [formData, setFormData] = useState({ title: "", description: "", imageUrl: "", status: "ongoing" });

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => { if (accessToken) fetchProjects(); }, [accessToken]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { navigate("/login"); return; }
    setAccessToken(session.access_token);
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create project");
      setSuccess("Project created successfully!");
      setFormData({ title: "", description: "", imageUrl: "", status: "ongoing" });
      setShowForm(false);
      fetchProjects();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setDeleting(id); setError("");
    try {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        const text = await response.text();
        let message = "Failed to delete project";
        try { message = JSON.parse(text).error || message; } catch {}
        throw new Error(message);
      }
      setSuccess("Project deleted successfully!");
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete project");
    } finally {
      setDeleting(null);
    }
  };

  const openAnnModal = (project: Project) => {
    setAnnProject(project);
    setAnnForm({
      title: `Update: ${project.title}`,
      content: "",
      imageUrl: project.imageUrl || "",
    });
    setAnnError("");
    setShowAnnModal(true);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnError(""); setAnnSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(annForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create announcement");
      setShowAnnModal(false);
      setSuccess("Announcement created successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setAnnError(err.message || "Failed to create announcement");
    } finally {
      setAnnSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">

      {/* ── ANNOUNCEMENT MODAL ── */}
      {showAnnModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAnnModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <button onClick={() => setShowAnnModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" /> Create Announcement
            </h2>
            <p className="text-sm text-gray-500 mb-6">From project: <span className="font-semibold text-gray-700">{annProject?.title}</span></p>

            {annError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{annError}</div>}

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Content *</label>
                <textarea
                  required
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Announcement content..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  value={annForm.imageUrl}
                  onChange={(e) => setAnnForm({ ...annForm, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={annSubmitting}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition text-sm"
                >
                  {annSubmitting ? "Creating..." : "Create Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Projects</h1>
            <p className="text-gray-600">Create and manage barangay projects</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md">
            <Plus className="w-5 h-5" />
            {showForm ? "Cancel" : "New Project"}
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">{success}</div>}

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FolderKanban className="w-6 h-6" /> Create New Project
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Project title" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Project description" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL (Optional)</label>
                <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://example.com/image.jpg" />
              </div>
              <button type="submit" disabled={submitting} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                {submitting ? "Creating..." : "Create Project"}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Projects</h2>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No projects yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p) => (
                <div key={p.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-48 object-cover" />}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${p.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                        {p.status === "completed" ? "Completed" : "Ongoing"}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{p.title}</h3>
                    <p className="text-gray-600 mb-4">{p.description}</p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => openAnnModal(p)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition font-semibold text-sm"
                      >
                        <Megaphone className="w-4 h-4" />
                        Create Announcement
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition font-semibold text-sm disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleting === p.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
