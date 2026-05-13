import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { API_URL, publicAnonKey } from "../../lib/supabase";
import barangayBg from "../../assets/Barangay.png";
import sampleLogo from "../../assets/Sample Barangay Logo.png"
import manilaLogo from "../../assets/Manila.png"

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

const CARDS_PER_VIEW = 3;

export default function Homepage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ayudaAnnouncements, setAyudaAnnouncements] = useState<AyudaAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [projectIndex, setProjectIndex] = useState(0);
  const [ayudaIndex, setAyudaIndex] = useState(0);
  const [selectedAyuda, setSelectedAyuda] = useState<AyudaAnnouncement | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [announcementsRes, projectsRes, ayudaRes] = await Promise.all([
        fetch(`${API_URL}/announcements`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }),
        fetch(`${API_URL}/projects`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }),
        fetch(`${API_URL}/ayuda`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }),
      ]);

      const announcementsData = await announcementsRes.json();
      const projectsData = await projectsRes.json();
      const ayudaData = await ayudaRes.json();

      setAnnouncements(announcementsData.announcements || []);
      setProjects(projectsData.projects || []);
      setAyudaAnnouncements(ayudaData.ayuda || []);
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const moveCarousel = (
    direction: "prev" | "next",
    itemsLength: number,
    index: number,
    setIndex: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    const maxIndex = Math.max(itemsLength - CARDS_PER_VIEW, 0);
    if (direction === "prev") {
      setIndex(Math.max(index - 1, 0));
      return;
    }
    setIndex(Math.min(index + 1, maxIndex));
  };

  const renderCarouselControls = (
    itemsLength: number,
    index: number,
    onPrev: () => void,
    onNext: () => void,
  ) => (
    <div className="mb-8 flex justify-end gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={index === 0}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1350A3] shadow-md transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={index >= Math.max(itemsLength - CARDS_PER_VIEW, 0)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1350A3] shadow-md transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        style={{
          backgroundImage: `url(${barangayBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
          opacity: 0.5,
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <section
        className="relative min-h-[600px] flex items-center overflow-hidden z-10"
      >
        {/* Dark overlay for text readability */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.18)', zIndex: 1 }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full" style={{ position: 'absolute', left: 1000, top: -30, zIndex: 2 }}>
          <div className="max-w-3xl text-white">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight flex justify-center items-center" style={{ fontFamily: "'Mate SC', serif", fontSize: '36px', fontWeight: '400', color: '#000000', lineHeight: 1, WebkitTextStroke: '1px #000000' }}>lungsod ng maynila</h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-200 leading-relaxed flex justify-center items-center" style={{ fontFamily: "'Mate SC', serif", fontSize: '36px', fontWeight: '400', color: '#000000', lineHeight: 0.5, WebkitTextStroke: '1px #000000' }}>
              BARANGAY MALIGAYA
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <img src={barangayBg} alt="" style={{ width: '832px', height: '468px', display: 'flex', position: 'absolute', right: 1300, top: 100, boxShadow: '0 30px 60px rgba(13, 13, 14, 0.18)' }} />
              <img src={manilaLogo} alt="" style={{ width: '210px', height: '210px', display: 'flex', position: 'absolute', right: 900, top: 270 }} />
              <img src={sampleLogo} alt="" style={{ width: '340px', height: '340px', display: 'flex', position: 'absolute', right: 580, top: 200 }} />
            </div>
          </div>
        </div>
      </section>


      <section id="announcements" className="relative z-10 py-20" style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Mate SC', serif", fontSize: '48px', fontWeight: '400', color: '#000000', lineHeight: 1, WebkitTextStroke: '1px #000000' }}>LATEST ANNOUNCEMENTS</h2>
            <p className="text-xl text-gray-600" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '400', color: '#000000', lineHeight: 1 }}>Stay informed with the latest updates from our barangay</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '400', color: '#000000', lineHeight: 1 }}>Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <p className="text-gray-500 text-lg" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '400', color: '#000000', lineHeight: 1 }}>No announcements yet.</p>
            </div>
          ) : (
            <>
              {renderCarouselControls(
                announcements.length,
                announcementIndex,
                () => moveCarousel("prev", announcements.length, announcementIndex, setAnnouncementIndex),
                () => moveCarousel("next", announcements.length, announcementIndex, setAnnouncementIndex),
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {announcements.slice(announcementIndex, announcementIndex + CARDS_PER_VIEW).map((announcement) => (
                  <div key={announcement.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
                    <img
                      src={announcement.imageUrl || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop"}
                      alt={announcement.title}
                      className="w-full h-56 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-blue-600 mb-3 font-medium">
                        <Calendar className="w-4 h-4" />
                        {new Date(announcement.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{announcement.title}</h3>
                      <p className="text-gray-600 leading-relaxed line-clamp-3">{announcement.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section id="projects" className="relative z-10 py-20" style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)', marginTop: 30 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Mate SC', serif", fontSize: '48px', fontWeight: '400', color: '#000000', lineHeight: 1, WebkitTextStroke: '1px #000000' }}>BARANGAY PROJECTS</h2>
            <p className="text-xl text-gray-600" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '400', color: '#000000', lineHeight: 1 }}>Building a better community together</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '400', color: '#000000', lineHeight: 1 }}>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <p className="text-gray-500 text-lg" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '400', color: '#000000', lineHeight: 1 }}>No projects yet.</p>
            </div>
          ) : (
            <>
              {renderCarouselControls(
                projects.length,
                projectIndex,
                () => moveCarousel("prev", projects.length, projectIndex, setProjectIndex),
                () => moveCarousel("next", projects.length, projectIndex, setProjectIndex),
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.slice(projectIndex, projectIndex + CARDS_PER_VIEW).map((project) => (
                  <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100">
                    <img
                      src={project.imageUrl || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop"}
                      alt={project.title}
                      className="w-full h-56 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-4 py-1.5 rounded-full text-sm font-bold ${project.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {project.status === "completed" ? "Completed" : "Ongoing"}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                          <Calendar className="w-4 h-4" />
                          {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{project.title}</h3>
                      <p className="text-gray-600 leading-relaxed line-clamp-3">{project.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section id="ayuda" className="relative z-10 py-20" style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)', marginTop: 30 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Mate SC', serif", fontSize: '48px', fontWeight: '400', color: '#000000', lineHeight: 1, WebkitTextStroke: '1px #000000' }}>AYUDA ANNOUNCEMENTS</h2>
            <p className="text-xl text-gray-600" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '400', color: '#000000', lineHeight: 1 }}>Stay updated on ayuda programs and distributions</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '400', color: '#000000', lineHeight: 1 }}>Loading ayuda announcements...</div>
          ) : ayudaAnnouncements.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <p className="text-gray-500 text-lg" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '400', color: '#000000', lineHeight: 1 }}>No ayuda announcements yet.</p>
            </div>
          ) : (
            <>
              {renderCarouselControls(
                ayudaAnnouncements.length,
                ayudaIndex,
                () => moveCarousel("prev", ayudaAnnouncements.length, ayudaIndex, setAyudaIndex),
                () => moveCarousel("next", ayudaAnnouncements.length, ayudaIndex, setAyudaIndex),
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ayudaAnnouncements.slice(ayudaIndex, ayudaIndex + CARDS_PER_VIEW).map((ayuda) => (
                  <button
                    key={ayuda.id}
                    type="button"
                    onClick={() => {
                      if (ayuda.distributionMode === "face_to_face") {
                        setSelectedAyuda(ayuda);
                      }
                    }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left disabled:cursor-default"
                    disabled={ayuda.distributionMode !== "face_to_face"}
                  >
                    <img
                      src={ayuda.imageUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop"}
                      alt={ayuda.title}
                      className="w-full h-56 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-blue-600 mb-3 font-medium">
                        <Calendar className="w-4 h-4" />
                        {new Date(ayuda.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{ayuda.title}</h3>
                      <p className="text-gray-600 leading-relaxed line-clamp-2 mb-2">{ayuda.shortDescription}</p>
                      <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Mode:</span> {ayuda.distributionMode === "online" ? "Online" : "Face-to-Face"}</p>
                      <p className="text-sm text-gray-700 line-clamp-2"><span className="font-semibold">Requirements:</span> {ayuda.requirements}</p>
                      {ayuda.distributionMode === "online" ? (
                        <p className="mt-3 text-sm font-semibold text-[#1350A3]">Online application is available on mobile.</p>
                      ) : (
                        <p className="mt-3 text-sm font-semibold text-[#1350A3]">Click to view full ayuda details.</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {selectedAyuda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{selectedAyuda.title}</h3>
                <p className="mt-2 text-sm font-medium text-[#1350A3]">
                  {new Date(selectedAyuda.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAyuda(null)}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Close
              </button>
            </div>
            <p className="mb-4 text-gray-700">{selectedAyuda.shortDescription}</p>
            <p className="mb-2 text-sm text-gray-700"><span className="font-semibold">Distribution Mode:</span> Face-to-Face</p>
            <p className="text-sm text-gray-700"><span className="font-semibold">Requirements:</span> {selectedAyuda.requirements}</p>
          </div>
        </div>
      )}
    </div>
  );
}
