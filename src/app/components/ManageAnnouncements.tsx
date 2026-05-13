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
        {/* Header & Stats */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#1350A3] bg-transparent p-5 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">Announcements</h1>
                <p className="text-sm text-gray-600">Manage public announcements for Barangay Maligaya.</p>
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold border border-[#1350A3] shadow-[2px_2px_0px_0px_#1350A3] transition-transform active:translate-y-1 active:shadow-none"
              >
                <Plus className="w-5 h-5" />
                {showForm ? "Cancel" : "New Announcement"}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-[#1350A3]/10 text-[#1350A3] rounded-md border border-[#1350A3]">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Published</p>
                  <p className="text-xl font-bold text-gray-900">{announcements.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-md border border-[#1350A3]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Latest Update</p>
                  <p className="text-xl font-bold text-gray-900">
                    {announcements.length > 0 ? new Date(Math.max(...announcements.map(a => new Date(a.createdAt).getTime()))).toLocaleDateString() : "N/A"}
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
              <Megaphone className="w-5 h-5" />
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
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed border border-[#1350A3] shadow-[2px_2px_0px_0px_#1350A3] transition-transform active:translate-y-1 active:shadow-none"
              >
                {submitting ? (editingAnnouncementId ? "Saving..." : "Creating...") : (editingAnnouncementId ? "Save Changes" : "Create Announcement")}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#1350A3] p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">All Announcements</h2>

          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No announcements yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="relative border border-[#1350A3] rounded-2xl overflow-hidden hover:shadow-[4px_4px_0px_0px_#1350A3] transition">
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
                    <p className="text-sm text-gray-600">{announcement.content}</p>
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
