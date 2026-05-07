import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Calendar } from "lucide-react";
import { API_URL, publicAnonKey } from "../../lib/supabase";
import barangayBg from "../../assets/Barangay.png";
import sampleLogo from "../../assets/Sample Barangay Logo.png";
import manilaLogo from "../../assets/Manila.png";

interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: string;
  createdAt: string;
}

export default function Homepage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [announcementsRes, projectsRes] = await Promise.all([
        fetch(`${API_URL}/announcements`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }),
        fetch(`${API_URL}/projects`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }),
      ]);

      const announcementsData = await announcementsRes.json();
      const projectsData = await projectsRes.json();

      setAnnouncements(announcementsData.announcements || []);
      setProjects(projectsData.projects || []);
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section className="relative min-h-[500px] sm:min-h-[560px] md:min-h-[600px] flex items-center overflow-hidden">
        <div
          style={{
            backgroundImage: `url(${barangayBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "absolute",
            inset: 0,
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(10,30,100,0.85) 50%, rgba(10,30,100,0.40))",
            zIndex: 1,
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-16 sm:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Text */}
          <div className="w-full lg:max-w-xl text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Welcome to Our<br />Barangay Portal
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/80 mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
              Stay connected with your community. Get updates, report issues, and track barangay projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/submit-report"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm sm:text-base text-center"
              >
                Submit a Report
              </Link>
              <a
                href="#announcements"
                className="border-2 border-white/70 hover:bg-white/10 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm sm:text-base text-center"
              >
                View Announcements
              </a>
            </div>
          </div>

          {/* Logos — same size, hidden on mobile */}
          <div className="hidden lg:flex items-center gap-8 flex-shrink-0">
            <img src={manilaLogo} alt="Lungsod ng Maynila" className="w-28 h-28 object-contain drop-shadow-xl" />
            <img src={sampleLogo} alt="Barangay Maligaya" className="w-40 h-40 object-contain drop-shadow-xl" />
          </div>
        </div>
      </section>

      {/* ── ANNOUNCEMENTS ── */}
      <section id="announcements" className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">Latest Announcements</h2>
            <p className="text-gray-500 text-sm sm:text-base md:text-lg">Stay informed with the latest updates from our barangay</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl shadow-sm">
              <p className="text-gray-400">No announcements yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {announcements.slice(0, 6).map((a) => (
                <div key={a.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
                  <img
                    src={a.imageUrl || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop"}
                    alt={a.title}
                    className="w-full h-44 sm:h-52 object-cover"
                  />
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 font-medium mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(a.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{a.title}</h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed line-clamp-3">{a.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section className="py-14 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">Barangay Projects</h2>
            <p className="text-gray-500 text-sm sm:text-base md:text-lg">Building a better community together</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <p className="text-gray-400">No projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {projects.slice(0, 6).map((p) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
                  <img
                    src={p.imageUrl || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop"}
                    alt={p.title}
                    className="w-full h-44 sm:h-52 object-cover"
                  />
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {p.status === "completed" ? "Completed" : "Ongoing"}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed line-clamp-3">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
