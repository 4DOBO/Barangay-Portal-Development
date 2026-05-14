import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Megaphone, Plus, Trash2, Calendar, Pencil, Clock, Tag, X } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Update {
  id: string;
  title: string;
  category: string;
  description: string;
  eventDate: string;
  eventTime: string;
  author: string;
  priority: string;
  imageUrl: string;
  createdAt: string;
}

export default function ManageAnnouncements() {
  const navigate = useNavigate();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [accessToken, setAccessToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Admin");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const emptyForm = {
    title: "",
    category: "Announcement",
    description: "",
    eventDate: "",
    eventTime: "",
    priority: "low",
    imageUrl: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchUpdates();
    }
  }, [accessToken]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      navigate("/login");
      return;
    }
    const name =
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.name ||
      session.user.email?.split("@")[0] || "Admin";
    setDisplayName(name);
    setAccessToken(session.access_token);
  };

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from("updates")
        .select("*")
        .in("category", ["Announcement", "Event", "Notice"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: Update[] = data.map((u: any) => ({
          id: u.id,
          title: u.title,
          category: u.category,
          description: u.description,
          eventDate: u.event_date || "",
          eventTime: u.event_time || "",
          author: u.author,
          priority: u.priority,
          createdAt: u.created_at,
          imageUrl: u.image_url || "",
        }));
        setUpdates(mapped);
      }
    } catch (err) {
      console.error("Error fetching updates:", err);
      setUpdates([]);
    }
  };

  const convertFileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Failed to read image file."));
          return;
        }

        const image = new Image();
        image.onload = () => {
          const maxWidth = 1200;
          const maxHeight = 1200;
          let { width, height } = image;

          if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Failed to process image file."));
            return;
          }

          context.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        image.onerror = () => reject(new Error("Failed to process image file."));
        image.src = reader.result;
      };
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const isEditing = Boolean(editingId);
      let finalImageUrl = formData.imageUrl;

      if (imageFile) {
        finalImageUrl = await convertFileToDataUrl(imageFile);
      }

      const dbData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        event_date: formData.eventDate || null,
        event_time: formData.eventTime || null,
        author: displayName,
        priority: formData.priority,
        image_url: finalImageUrl,
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from("updates")
          .update(dbData)
          .eq("id", editingId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("updates")
          .insert([dbData]);
        if (insertError) throw insertError;
      }

      setSuccess(`Update ${isEditing ? "saved" : "published"} successfully!`);
      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);
      setImageFile(null);
      fetchUpdates();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error saving update:", err);
      setError(err.message || "Failed to save update");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (update: Update) => {
    setEditingId(update.id);
    setFormData({
      title: update.title,
      category: update.category,
      description: update.description,
      eventDate: update.eventDate,
      eventTime: update.eventTime,
      priority: update.priority,
      imageUrl: update.imageUrl,
    });
    setImageFile(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (updateId: string) => {
    const confirmed = window.confirm("Delete this update?");
    if (!confirmed) return;

    try {
      const { error: deleteError } = await supabase
        .from("updates")
        .delete()
        .eq("id", updateId);
      if (deleteError) throw deleteError;
      setUpdates((prev) => prev.filter((u) => u.id !== updateId));
      if (editingId === updateId) {
        setEditingId(null);
        setFormData(emptyForm);
        setShowForm(false);
        setImageFile(null);
      }
    } catch (err: any) {
      console.error("Error deleting update:", err);
      setError(err.message || "Failed to delete update");
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case "event": return "bg-purple-100 text-purple-800";
      case "notice": return "bg-yellow-100 text-yellow-800";
      default: return "bg-blue-100 text-blue-800";
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
                <h1 className="text-xl font-bold text-gray-900 mb-1">Updates & Announcements</h1>
                <p className="text-sm text-gray-600">Manage public updates, announcements, and notices for the community.</p>
              </div>
              <button
                onClick={() => {
                  if (showForm) {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData(emptyForm);
                    setImageFile(null);
                  } else {
                    setShowForm(true);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold border border-[#1350A3] shadow-[2px_2px_0px_0px_#1350A3] transition-transform active:translate-y-1 active:shadow-none"
              >
                <Plus className="w-5 h-5" />
                {showForm ? "Cancel" : "New Update"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-[#1350A3]/10 text-[#1350A3] rounded-md border border-[#1350A3]">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Updates</p>
                  <p className="text-xl font-bold text-gray-900">{updates.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-md border border-[#1350A3]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Events</p>
                  <p className="text-xl font-bold text-gray-900">
                    {updates.filter(u => u.category.toLowerCase() === "event").length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#1350A3] p-3 flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-md border border-[#1350A3]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Latest Update</p>
                  <p className="text-xl font-bold text-gray-900">
                    {updates.length > 0 ? new Date(Math.max(...updates.map(u => new Date(u.createdAt).getTime()))).toLocaleDateString() : "N/A"}
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
              {editingId ? "Edit Update" : "Create New Update"}
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
                  placeholder="Update title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Event">Event</option>
                    <option value="Notice">Notice</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
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
                  placeholder="Update description"
                />
              </div>

              <div>
                <label htmlFor="announcementImage" className="block text-sm font-semibold text-gray-700 mb-2">
                  Announcement Image (Optional)
                </label>
                {formData.imageUrl && !imageFile && (
                  <div className="mb-3 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                    <img src={formData.imageUrl} alt="Current announcement" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  id="announcementImage"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="eventDate" className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="eventTime" className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Time (Optional)
                  </label>
                  <input
                    type="time"
                    id="eventTime"
                    value={formData.eventTime}
                    onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed border border-[#1350A3] shadow-[2px_2px_0px_0px_#1350A3] transition-transform active:translate-y-1 active:shadow-none"
              >
                {submitting ? (editingId ? "Saving..." : "Publishing...") : (editingId ? "Save Changes" : "Publish Update")}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#1350A3] p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">All Updates</h2>

          {updates.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No updates yet. Publish your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {updates.map((update) => (
                <div key={update.id} className="relative border border-[#1350A3] rounded-2xl overflow-hidden hover:shadow-[4px_4px_0px_0px_#1350A3] transition">
                  {/* Priority bar */}
                  <div className={`h-1.5 w-full ${update.priority === "high" ? "bg-red-500" : update.priority === "medium" ? "bg-orange-500" : "bg-green-500"}`} />
                  {update.imageUrl && (
                    <img
                      src={update.imageUrl}
                      alt={update.title}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <div className="p-6 pb-16">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getCategoryBadge(update.category)}`}>
                        {update.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityBadge(update.priority)}`}>
                        {update.priority}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{update.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{update.description}</p>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {update.eventDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(update.eventDate).toLocaleDateString()}
                        </div>
                      )}
                      {update.eventTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {update.eventTime.slice(0, 5)}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        By {update.author}
                      </div>
                    </div>

                    <div className="absolute right-4 bottom-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(update)}
                        className="text-gray-700 transition hover:text-blue-600"
                        style={{ background: "none", border: "none" }}
                        aria-label="Edit update"
                        title="Edit update"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(update.id)}
                        className="text-gray-700 transition hover:text-red-600"
                        style={{ background: "none", border: "none" }}
                        aria-label="Delete update"
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
