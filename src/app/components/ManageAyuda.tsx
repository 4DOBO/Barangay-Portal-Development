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
                {editingAyudaId ? "Edit Ayuda" : "Create Ayuda"}
              </h1>
            )}
          </div>
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
      </div>
    </div>
  );
}
