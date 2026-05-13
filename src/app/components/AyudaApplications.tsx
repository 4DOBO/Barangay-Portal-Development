import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Calendar, HandHelping } from "lucide-react";
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

export default function AyudaApplications() {
  const navigate = useNavigate();
  const [ayudaAnnouncements, setAyudaAnnouncements] = useState<AyudaAnnouncement[]>([]);
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState("");

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
      setError("Failed to load ayuda applications.");
    }
  };

  const onlineAyuda = ayudaAnnouncements.filter((ayuda) => ayuda.distributionMode === "online");

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1">
            <h1
              className="text-center text-gray-900"
              style={{ fontFamily: "'Mate SC', serif", fontSize: "40px", fontWeight: 400 }}
            >
              Ayuda Applications
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">All Online Ayuda Applications</h2>

          {onlineAyuda.length === 0 ? (
            <div className="py-12 text-center">
              <HandHelping className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <p className="text-gray-500">No online ayuda applications available yet.</p>
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
                  <p className="text-sm text-gray-500">Resident applications will appear here once the mobile submission flow is connected.</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
