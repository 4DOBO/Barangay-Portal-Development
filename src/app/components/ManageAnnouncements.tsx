import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Megaphone, Plus, Trash2, Calendar, Pencil } from "lucide-react";
import { supabase, API_URL, publicAnonKey } from "../../lib/supabase";

interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

export default function ManageAnnouncements() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [accessToken, setAccessToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchAnnouncements();
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

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_URL}/announcements`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const isEditing = Boolean(editingAnnouncementId);
      const response = await fetch(isEditing ? `${API_URL}/announcements/${editingAnnouncementId}` : `${API_URL}/announcements`, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditing ? "update" : "create"} announcement`);
      }

      setSuccess(`Announcement ${isEditing ? "updated" : "created"} successfully!`);
      setFormData({ title: "", content: "", imageUrl: "" });
      setEditingAnnouncementId(null);
      setShowForm(false);
      fetchAnnouncements();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error saving announcement:", err);
      setError(err.message || "Failed to save announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncementId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      imageUrl: announcement.imageUrl,
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (announcementId: string) => {
    const confirmed = window.confirm("Delete this announcement?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/announcements/${announcementId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete announcement");
      }

      setAnnouncements((prev) => prev.filter((announcement) => announcement.id !== announcementId));
      if (editingAnnouncementId === announcementId) {
        setEditingAnnouncementId(null);
        setFormData({ title: "", content: "", imageUrl: "" });
        setShowForm(false);
      }
    } catch (err: any) {
      console.error("Error deleting announcement:", err);
      setError(err.message || "Failed to delete announcement");
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
                {editingAnnouncementId ? "Edit Announcement" : "Create Announcement"}
              </h1>
            )}
          </div>
          <button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingAnnouncementId(null);
                setFormData({ title: "", content: "", imageUrl: "" });
              } else {
                setShowForm(true);
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md"
          >
            <Plus className="w-5 h-5" />
            {showForm ? "Cancel" : "New Announcement"}
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
              <Megaphone className="w-6 h-6" />
              {editingAnnouncementId ? "Edit Announcement" : "Create New Announcement"}
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
                  placeholder="Announcement title"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  id="content"
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Announcement content"
                />
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
                {submitting ? (editingAnnouncementId ? "Saving..." : "Creating...") : (editingAnnouncementId ? "Save Changes" : "Create Announcement")}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Announcements</h2>

          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No announcements yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="relative border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                  {announcement.imageUrl && (
                    <img
                      src={announcement.imageUrl}
                      alt={announcement.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6 pb-16">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{announcement.title}</h3>
                    <p className="text-gray-600">{announcement.content}</p>
                    <div className="absolute right-4 bottom-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(announcement)}
                        className="text-gray-700 transition hover:text-blue-600"
                        style={{ background: "none", border: "none" }}
                        aria-label="Edit announcement"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(announcement.id)}
                        className="text-gray-700 transition hover:text-red-600"
                        style={{ background: "none", border: "none" }}
                        aria-label="Delete announcement"
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
