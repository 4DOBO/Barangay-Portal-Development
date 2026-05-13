import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FolderKanban, Plus, Calendar, Pencil, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

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

  const [displayName, setDisplayName] = useState("Admin");

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      navigate("/login");
      return;
    }
    // Fetch user name to satisfy the 'author' requirement in the updates table
    const name =
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.name ||
      session.user.email?.split("@")[0] || "Admin";
    setDisplayName(name);
    setAccessToken(session.access_token);
  };

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

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("updates") // <--- Changed from "projects"
        .select("*")
        .eq("category", "Project") // <--- Only fetch projects
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: Project[] = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          imageUrl: p.image_url || "",
          status: p.status || "ongoing",
          createdAt: p.created_at,
        }));
        setProjects(mapped);
      }
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
      const dbData = {
        title: formData.title,
        description: formData.description,
        image_url: formData.imageUrl,
        status: formData.status,
        category: "Project", // <--- Required by updates table
        author: displayName, // <--- Required by updates table
        priority: "low",     // <--- Required by updates table
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from("updates") // <--- Changed from "projects"
          .update(dbData)
          .eq("id", editingProjectId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("updates") // <--- Changed from "projects"
          .insert([dbData]);
        if (insertError) throw insertError;
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
      const { error: deleteError } = await supabase
        .from("updates") // <--- Changed from "projects"
        .delete()
        .eq("id", projectId);

      if (deleteError) throw deleteError;

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
        {/* Header & Stats */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#1350A3] bg-transparent p-5 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">Projects</h1>
                <p className="text-sm text-gray-600">Manage and showcase ongoing and completed barangay projects.</p>
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold border border-[#1350A3] shadow-[2px_2px_0px_0px_#1350A3] transition-transform active:translate-y-1 active:shadow-none"
              >
                <Plus className="w-5 h-5" />
                {showForm ? "Cancel" : "New Project"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-[#1350A3]/10 text-[#1350A3] rounded-md border border-[#1350A3]">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Projects</p>
                  <p className="text-xl font-bold text-gray-900">{projects.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-md border border-[#1350A3]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ongoing</p>
                  <p className="text-xl font-bold text-gray-900">
                    {projects.filter(p => p.status === "ongoing").length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-md border border-[#1350A3]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Completed</p>
                  <p className="text-xl font-bold text-gray-900">
                    {projects.filter(p => p.status === "completed").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
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
          <div className="bg-white rounded-2xl border border-[#1350A3] p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FolderKanban className="w-5 h-5" />
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
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed border border-[#1350A3] shadow-[2px_2px_0px_0px_#1350A3] transition-transform active:translate-y-1 active:shadow-none"
              >
                {submitting ? (editingProjectId ? "Saving..." : "Creating...") : (editingProjectId ? "Save Changes" : "Create Project")}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#1350A3] p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">All Projects</h2>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No projects yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="relative border border-[#1350A3] rounded-2xl overflow-hidden hover:shadow-[4px_4px_0px_0px_#1350A3] transition">
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
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${project.status === "completed"
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
                    <p className="text-sm text-gray-600">{project.description}</p>
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
