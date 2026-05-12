import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FolderKanban, Plus, Calendar, Pencil, Trash2 } from "lucide-react";
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    status: "ongoing",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchProjects();
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
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const isEditing = Boolean(editingProjectId);
      const response = await fetch(isEditing ? `${API_URL}/projects/${editingProjectId}` : `${API_URL}/projects`, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditing ? "update" : "create"} project`);
      }

      setSuccess(`Project ${isEditing ? "updated" : "created"} successfully!`);
      setFormData({ title: "", description: "", imageUrl: "", status: "ongoing" });
      setEditingProjectId(null);
      setShowForm(false);
      fetchProjects();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error saving project:", err);
      setError(err.message || "Failed to save project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProjectId(project.id);
    setFormData({
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl,
      status: project.status,
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (projectId: string) => {
    const confirmed = window.confirm("Delete this project?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete project");
      }

      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      if (editingProjectId === projectId) {
        setEditingProjectId(null);
        setFormData({ title: "", description: "", imageUrl: "", status: "ongoing" });
        setShowForm(false);
      }
    } catch (err: any) {
      console.error("Error deleting project:", err);
      setError(err.message || "Failed to delete project");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1">
            {showForm && (
              <h1
                className="text-center text-gray-900"
                style={{ fontFamily: "'Mate SC', serif", fontSize: "40px", fontWeight: 400 }}
              >
                Projects
              </h1>
            )}
          </div>
          <button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingProjectId(null);
                setFormData({ title: "", description: "", imageUrl: "", status: "ongoing" });
              } else {
                setShowForm(true);
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md"
          >
            <Plus className="w-5 h-5" />
            {showForm ? "Cancel" : "New Project"}
          </button>
        </div>

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
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FolderKanban className="w-6 h-6" />
              {editingProjectId ? "Edit Project" : "Create New Project"}
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
                  placeholder="Project title"
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
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Project description"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (editingProjectId ? "Saving..." : "Creating...") : (editingProjectId ? "Save Changes" : "Create Project")}
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
              {projects.map((project) => (
                <div key={project.id} className="relative border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                  {project.imageUrl && (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6 pb-16">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          project.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {project.status === "completed" ? "Completed" : "Ongoing"}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-gray-600">{project.description}</p>
                    <div className="absolute right-4 bottom-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(project)}
                        className="text-gray-700 transition hover:text-blue-600"
                        style={{ background: "none", border: "none" }}
                        aria-label="Edit project"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(project.id)}
                        className="text-gray-700 transition hover:text-red-600"
                        style={{ background: "none", border: "none" }}
                        aria-label="Delete project"
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
      </div>
    </div>
  );
}
