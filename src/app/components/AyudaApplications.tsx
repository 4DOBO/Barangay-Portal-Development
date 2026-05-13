import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Calendar, Check, HandHelping, X } from "lucide-react";
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

interface DummyAyudaApplication {
  id: string;
  ayudaId: string;
  applicantName: string;
  mobileNumber: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export default function AyudaApplications() {
  const navigate = useNavigate();
  const [ayudaAnnouncements, setAyudaAnnouncements] = useState<AyudaAnnouncement[]>([]);
  const [applications, setApplications] = useState<DummyAyudaApplication[]>([]);
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

  useEffect(() => {
    const onlineAyuda = ayudaAnnouncements.filter((ayuda) => ayuda.distributionMode === "online");
    setApplications((prev) => {
      return onlineAyuda.flatMap((ayuda, index) => {
        const pendingId = `${ayuda.id}_dummy_1`;
        const approvedId = `${ayuda.id}_dummy_2`;
        const existingPending = prev.find((application) => application.id === pendingId);
        const existingApproved = prev.find((application) => application.id === approvedId);

        return [
          existingPending || {
            id: pendingId,
            ayudaId: ayuda.id,
            applicantName: `Juan Dela Cruz ${index + 1}`,
            mobileNumber: "09171234567",
            submittedAt: new Date().toISOString(),
            status: "pending" as const,
          },
          existingApproved || {
            id: approvedId,
            ayudaId: ayuda.id,
            applicantName: `Maria Santos ${index + 1}`,
            mobileNumber: "09987654321",
            submittedAt: new Date().toISOString(),
            status: "approved" as const,
          },
        ];
      });
    });
  }, [ayudaAnnouncements]);

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

  const updateApplicationStatus = (applicationId: string, status: "approved" | "rejected") => {
    setApplications((prev) =>
      prev.map((application) =>
        application.id === applicationId ? { ...application, status } : application,
      ),
    );
  };

  const getAyudaTitle = (ayudaId: string) =>
    ayudaAnnouncements.find((ayuda) => ayuda.id === ayudaId)?.title || "Unknown Ayuda";

  const onlineApplications = applications.filter((application) =>
    ayudaAnnouncements.some((ayuda) => ayuda.id === application.ayudaId && ayuda.distributionMode === "online"),
  );

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

          {onlineApplications.length === 0 ? (
            <div className="py-12 text-center">
              <HandHelping className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <p className="text-gray-500">No online ayuda applications available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {onlineApplications.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-xl font-bold text-gray-900">{application.applicantName}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        application.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : application.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-gray-700"><span className="font-semibold">Ayuda:</span> {getAyudaTitle(application.ayudaId)}</p>
                  <p className="mb-2 text-sm text-gray-700"><span className="font-semibold">Mobile Number:</span> {application.mobileNumber}</p>
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </div>

                  {application.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => updateApplicationStatus(application.id, "approved")}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateApplicationStatus(application.id, "rejected")}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
