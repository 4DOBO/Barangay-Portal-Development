import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { HandHelping, Plus, Trash2, Calendar, Pencil } from "lucide-react";
import { supabase, API_URL, publicAnonKey } from "../../lib/supabase";

interface AyudaAnnouncement {
  id: string;
  title: string;
  shortDescription: string;
  date: string;
  requirements: string;
  distributionMode: "online" | "face_to_face";
  imageUrl: string;
  createdAt: string;
}

export default function ManageAyuda() {
  const navigate = useNavigate();
  const [ayudaAnnouncements, setAyudaAnnouncements] = useState<AyudaAnnouncement[]>([]);
  const [accessToken, setAccessToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAyudaId, setEditingAyudaId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"programs" | "applications">("programs");

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    date: "",
    requirements: "",
    distributionMode: "online" as "online" | "face_to_face",
    imageUrl: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchAyuda();
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

  const fetchAyuda = async () => {
    try {
      const response = await fetch(`${API_URL}/ayuda`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      setAyudaAnnouncements(data.ayuda || []);
    } catch (fetchError) {
      console.error("Error fetching ayuda announcements:", fetchError);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const isEditing = Boolean(editingAyudaId);
      const response = await fetch(isEditing ? `${API_URL}/ayuda/${editingAyudaId}` : `${API_URL}/ayuda`, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditing ? "update" : "create"} ayuda announcement`);
      }

      setSuccess(`Ayuda announcement ${isEditing ? "updated" : "created"} successfully!`);
      setFormData({ title: "", shortDescription: "", date: "", requirements: "", distributionMode: "online", imageUrl: "" });
      setEditingAyudaId(null);
      setShowForm(false);
      fetchAyuda();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error saving ayuda announcement:", err);
      setError(err.message || "Failed to save ayuda announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ayuda: AyudaAnnouncement) => {
    setEditingAyudaId(ayuda.id);
    setFormData({
      title: ayuda.title,
      shortDescription: ayuda.shortDescription,
      date: ayuda.date,
      requirements: ayuda.requirements,
      distributionMode: ayuda.distributionMode,
      imageUrl: ayuda.imageUrl,
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (ayudaId: string) => {
    const confirmed = window.confirm("Delete this ayuda announcement?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/ayuda/${ayudaId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete ayuda announcement");
      }

      setAyudaAnnouncements((prev) => prev.filter((ayuda) => ayuda.id !== ayudaId));
      if (editingAyudaId === ayudaId) {
        setEditingAyudaId(null);
        setFormData({ title: "", shortDescription: "", date: "", requirements: "", distributionMode: "online", imageUrl: "" });
        setShowForm(false);
      }
    } catch (err: any) {
      console.error("Error deleting ayuda announcement:", err);
      setError(err.message || "Failed to delete ayuda announcement");
    }
  };

  const onlineAyuda = ayudaAnnouncements.filter((ayuda) => ayuda.distributionMode === "online");

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("programs")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === "programs"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Ayuda Programs
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === "applications"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Ayuda Applications
            </button>
          </div>
          {activeTab === "programs" && (
            <button
              onClick={() => {
                if (showForm) {
                  setShowForm(false);
                  setEditingAyudaId(null);
                  setFormData({ title: "", shortDescription: "", date: "", requirements: "", distributionMode: "online", imageUrl: "" });
                } else {
                  setShowForm(true);
                }
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md"
            >
              <Plus className="w-5 h-5" />
              {showForm ? "Cancel" : "New Ayuda"}
            </button>
          )}
        </div>

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
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <HandHelping className="w-6 h-6" />
              {editingAyudaId ? "Edit Ayuda Announcement" : "Create New Ayuda Announcement"}
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
                  placeholder="Ayuda title"
                />
              </div>

              <div>
                <label htmlFor="shortDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  id="shortDescription"
                  required
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Short ayuda description"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                  Distribution Date *
                </label>
                <input
                  type="date"
                  id="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-semibold text-gray-700 mb-2">
                  List of Requirements *
                </label>
                <textarea
                  id="requirements"
                  required
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="List the requirements needed"
                />
              </div>

              <div>
                <label htmlFor="distributionMode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Distribution Mode *
                </label>
                <select
                  id="distributionMode"
                  value={formData.distributionMode}
                  onChange={(e) => setFormData({ ...formData, distributionMode: e.target.value as "online" | "face_to_face" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="online">Online</option>
                  <option value="face_to_face">Face-to-Face</option>
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
                {submitting ? (editingAyudaId ? "Saving..." : "Creating...") : (editingAyudaId ? "Save Changes" : "Create Ayuda")}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Ayuda Announcements</h2>

          {ayudaAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <HandHelping className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No ayuda announcements yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ayudaAnnouncements.map((ayuda) => (
                <div key={ayuda.id} className="relative border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                  {ayuda.imageUrl && (
                    <img
                      src={ayuda.imageUrl}
                      alt={ayuda.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6 pb-16">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(ayuda.date).toLocaleDateString()}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{ayuda.title}</h3>
                    <p className="text-gray-600 mb-2">{ayuda.shortDescription}</p>
                    <p className="text-sm text-gray-700"><span className="font-semibold">Mode:</span> {ayuda.distributionMode === "online" ? "Online" : "Face-to-Face"}</p>
                    <p className="text-sm text-gray-700 mt-1"><span className="font-semibold">Requirements:</span> {ayuda.requirements}</p>
                    <div className="absolute right-4 bottom-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(ayuda)}
                        className="text-gray-700 transition hover:text-blue-600"
                        style={{ background: "none", border: "none" }}
                        aria-label="Edit ayuda announcement"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ayuda.id)}
                        className="text-gray-700 transition hover:text-red-600"
                        style={{ background: "none", border: "none" }}
                        aria-label="Delete ayuda announcement"
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
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">All Online Ayuda Applications</h2>

            {onlineAyuda.length === 0 ? (
              <div className="py-12 text-center">
                <HandHelping className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <p className="text-gray-500">No online ayuda applications available yet.</p>
                <p className="mt-2 text-sm text-gray-400">Resident application data will appear here once the mobile app submission flow is connected to the backend.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {onlineAyuda.map((ayuda) => (
                  <div key={ayuda.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-xl font-bold text-gray-900">{ayuda.title}</h3>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                        Online
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-gray-700"><span className="font-semibold">Short Description:</span> {ayuda.shortDescription}</p>
                    <p className="mb-2 text-sm text-gray-700"><span className="font-semibold">Requirements:</span> {ayuda.requirements}</p>
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(ayuda.date).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-gray-500">Resident applications for this online ayuda should be fetched from the mobile app backend submission flow.</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
