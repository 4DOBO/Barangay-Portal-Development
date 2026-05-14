import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabase";
import barangayBg from "../../assets/Barangay.png";
import sampleLogo from "../../assets/Sample Barangay Logo.png"
import manilaLogo from "../../assets/Manila.png"

interface Announcement {
  id: string;
  title: string;
  category: string;
  description: string;
  eventDate: string;
  author: string;
  priority: string;
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

interface AyudaProgram {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  distribution: string;
  eligibility: string;
  createdAt: string;
}

const CARDS_PER_VIEW = 3;
const ANNOUNCEMENT_OVERRIDES_KEY = "announcement_overrides";
const HIDDEN_ANNOUNCEMENTS_KEY = "hidden_announcements";

export default function Homepage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ayudaPrograms, setAyudaPrograms] = useState<AyudaProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [projectIndex, setProjectIndex] = useState(0);
  const [ayudaIndex, setAyudaIndex] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [selectedAyuda, setSelectedAyuda] = useState<AyudaProgram | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch ONLY from updates and ayuda_programs (since projects are now inside updates)
      const [updatesRes, ayudaRes] = await Promise.all([
        supabase.from("updates").select("*").order("created_at", { ascending: false }),
        supabase.from("ayuda_programs").select("*").order("created_at", { ascending: false }),
      ]);

      if (updatesRes.data) {
        const allUpdates = updatesRes.data;

        // 1. Filter out Projects to get Announcements & Events
        const fetchedAnnouncements = allUpdates.filter((u: any) => u.category !== "Project");
        setAnnouncements(fetchedAnnouncements.map((a: any) => ({
          id: a.id,
          title: a.title,
          category: a.category,
          description: a.description,
          eventDate: a.event_date || "",
          author: a.author,
          priority: a.priority,
          createdAt: a.created_at,
          imageUrl: a.image_url || "",
        })));

        // 2. Filter ONLY Projects for the Projects carousel
        const fetchedProjects = allUpdates.filter((u: any) => u.category === "Project");
        setProjects(fetchedProjects.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          imageUrl: p.image_url || "",
          status: p.status || "ongoing",
          createdAt: p.created_at,
        })));
      }

      if (ayudaRes.data) {
        setAyudaPrograms(ayudaRes.data.map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          amount: a.amount,
          status: a.status || "upcoming",
          startDate: a.start_date || "",
          endDate: a.end_date || "",
          distribution: a.distribution,
          eligibility: a.eligibility,
          createdAt: a.created_at,
        })));
      }
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
  ) => {
    if (itemsLength <= CARDS_PER_VIEW) {
      return null;
    }

    return (
      <div className="mb-8 flex justify-between gap-3 lg:hidden">
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
  };

  const renderSideCarouselControls = (
    itemsLength: number,
    index: number,
    onPrev: () => void,
    onNext: () => void,
  ) => {
    if (itemsLength <= CARDS_PER_VIEW) {
      return null;
    }

    return (
      <>
        <button
          type="button"
          onClick={onPrev}
          disabled={index === 0}
          className="absolute left-0 top-1/2 z-20 hidden h-12 w-12 -translate-x-[90%] -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1350A3] shadow-md transition disabled:cursor-not-allowed disabled:opacity-40 lg:flex"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={index >= Math.max(itemsLength - CARDS_PER_VIEW, 0)}
          className="absolute right-0 top-1/2 z-20 hidden h-12 w-12 translate-x-[90%] -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1350A3] shadow-md transition disabled:cursor-not-allowed disabled:opacity-40 lg:flex"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fixed background */}
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

      {/* Hero Section — photo left, text + logos right */}
      <section className="relative z-10 overflow-hidden">
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.06)', zIndex: 1 }} />

        <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-12">
            {/* Left — Barangay photo */}
            <div className="w-full md:w-[55%] shrink-0">
              <img
                src={barangayBg}
                alt="Barangay Maligaya"
                className="w-full rounded-lg object-cover"
                style={{ aspectRatio: '16/10', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.15)' }}
              />
            </div>

            {/* Right — Title text + logos */}
            <div className="flex flex-col items-center text-center flex-1">
              <h1
                style={{ fontFamily: "'Mate SC', serif", fontWeight: 400, color: '#1a1a1a', lineHeight: 1.3 }}
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl"
              >
                LUNGSOD NG MAYNILA
              </h1>
              <p
                style={{ fontFamily: "'Mate SC', serif", fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-1"
              >
                BARANGAY MALIGAYA
              </p>
              <div className="flex items-center justify-center gap-3 sm:gap-5 mt-4 md:mt-6">
                <img
                  src={manilaLogo}
                  alt="Manila Logo"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain"
                />
                <img
                  src={sampleLogo}
                  alt="Barangay Logo"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section id="announcements" className="relative z-10 py-12 md:py-16" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl mb-2"
              style={{ fontFamily: "'Mate SC', serif", fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2 }}
            >
              LATEST ANNOUNCEMENTS
            </h2>
            <p
              className="text-xl text-gray-600"
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: '20px', fontWeight: '400', color: '#000000', lineHeight: 1 }}
            >
              Stay informed with the latest updates from our barangay
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500" style={{ fontFamily: "'Poppins', sans-serif" }}>Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <p className="text-gray-500 text-base" style={{ fontFamily: "'Poppins', sans-serif" }}>No announcements yet.</p>
            </div>
          ) : (
            <div className="relative">
              {renderSideCarouselControls(
                announcements.length,
                announcementIndex,
                () => moveCarousel("prev", announcements.length, announcementIndex, setAnnouncementIndex),
                () => moveCarousel("next", announcements.length, announcementIndex, setAnnouncementIndex),
              )}
              {renderCarouselControls(
                announcements.length,
                announcementIndex,
                () => moveCarousel("prev", announcements.length, announcementIndex, setAnnouncementIndex),
                () => moveCarousel("next", announcements.length, announcementIndex, setAnnouncementIndex),
              )}
              <div className={`grid gap-6 md:gap-8 ${announcements.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                announcements.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' :
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}>
                {announcements.slice(announcementIndex, announcementIndex + CARDS_PER_VIEW).map((announcement) => (
                  <button
                    key={announcement.id}
                    type="button"
                    onClick={() => setSelectedAnnouncement(announcement)}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left"
                  >
                    <div className={`h-2 w-full ${announcement.priority === 'high' ? 'bg-red-500' : announcement.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'}`} />
                    {announcement.imageUrl && (
                      <img
                        src={announcement.imageUrl}
                        alt={announcement.title}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${announcement.category?.toLowerCase() === 'event' ? 'bg-purple-100 text-purple-800' :
                          announcement.category?.toLowerCase() === 'notice' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                          {announcement.category}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                          <Calendar className="w-4 h-4 shrink-0" />
                          {announcement.eventDate ? new Date(announcement.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date(announcement.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{announcement.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{announcement.description}</p>
                      {announcement.author && (
                        <p className="text-xs text-gray-500 mt-3" style={{ fontFamily: "'Poppins', sans-serif" }}>Posted by: {announcement.author}</p>
                      )}
                      <p className="mt-3 text-sm font-semibold text-[#1350A3]" style={{ fontFamily: "'Poppins', sans-serif" }}>Click to view full details</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="relative z-10 py-12 md:py-16" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', marginTop: "30px" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl mb-2"
              style={{ fontFamily: "'Mate SC', serif", fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2 }}
            >
              BARANGAY PROJECTS
            </h2>
            <p
              className="text-xl text-gray-600"
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: '20px', fontWeight: '400', color: '#000000', lineHeight: 1, }}
            >
              Building a better community together
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500" style={{ fontFamily: "'Poppins', sans-serif" }}>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <p className="text-gray-500 text-base" style={{ fontFamily: "'Poppins', sans-serif" }}>No projects yet.</p>
            </div>
          ) : (
            <div className="relative">
              {renderSideCarouselControls(
                projects.length,
                projectIndex,
                () => moveCarousel("prev", projects.length, projectIndex, setProjectIndex),
                () => moveCarousel("next", projects.length, projectIndex, setProjectIndex),
              )}
              {renderCarouselControls(
                projects.length,
                projectIndex,
                () => moveCarousel("prev", projects.length, projectIndex, setProjectIndex),
                () => moveCarousel("next", projects.length, projectIndex, setProjectIndex),
              )}
              <div className={`grid gap-6 md:gap-8 ${projects.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                projects.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' :
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}>
                {projects.slice(projectIndex, projectIndex + CARDS_PER_VIEW).map((project) => (
                  <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100">
                    <img
                      src={project.imageUrl || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop"}
                      alt={project.title}
                      className="w-full h-44 sm:h-48 object-cover"
                    />
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${project.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {project.status === "completed" ? "Completed" : "Ongoing"}
                        </span>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{project.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{project.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="ayuda" className="relative z-10 py-20" style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)', marginTop: 30 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Mate SC', serif", fontSize: '48px', fontWeight: '400', color: '#000000', lineHeight: 1, WebkitTextStroke: '1px #000000' }}>AYUDA PROGRAMS</h2>
            <p className="text-xl text-gray-600" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '20px', fontWeight: '400', color: '#000000', lineHeight: 1, }}>Stay updated on ayuda programs and distributions</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '400', color: '#000000', lineHeight: 1 }}>Loading ayuda programs...</div>
          ) : ayudaPrograms.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <p className="text-gray-500 text-base" style={{ fontFamily: "'Poppins', sans-serif" }}>No ayuda programs yet.</p>
            </div>
          ) : (
            <div className="relative">
              {renderSideCarouselControls(
                ayudaPrograms.length,
                ayudaIndex,
                () => moveCarousel("prev", ayudaPrograms.length, ayudaIndex, setAyudaIndex),
                () => moveCarousel("next", ayudaPrograms.length, ayudaIndex, setAyudaIndex),
              )}
              {renderCarouselControls(
                ayudaPrograms.length,
                ayudaIndex,
                () => moveCarousel("prev", ayudaPrograms.length, ayudaIndex, setAyudaIndex),
                () => moveCarousel("next", ayudaPrograms.length, ayudaIndex, setAyudaIndex),
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ayudaPrograms.slice(ayudaIndex, ayudaIndex + CARDS_PER_VIEW).map((ayuda) => (
                  <button
                    key={ayuda.id}
                    type="button"
                    onClick={() => setSelectedAyuda(ayuda)}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left"
                  >
                    <div className="h-4 w-full" style={{ backgroundColor: ayuda.status === 'active' ? '#16a34a' : ayuda.status === 'upcoming' ? '#2563eb' : '#6b7280' }} />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${ayuda.status === 'active' ? 'bg-green-100 text-green-800' : ayuda.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                          {ayuda.status}
                        </span>
                        <span className="text-lg font-bold text-[#1350A3]">₱{ayuda.amount.toLocaleString()}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{ayuda.title}</h3>
                      <p className="text-gray-600 leading-relaxed line-clamp-2 mb-2">{ayuda.description}</p>
                      <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Distribution:</span> {ayuda.distribution}</p>
                      <p className="text-sm text-gray-700 line-clamp-2"><span className="font-semibold">Eligibility:</span> {ayuda.eligibility}</p>
                      {ayuda.startDate && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 mt-3 font-medium">
                          <Calendar className="w-4 h-4" />
                          {new Date(ayuda.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          {ayuda.endDate && ` — ${new Date(ayuda.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                        </div>
                      )}
                      <p className="mt-3 text-sm font-semibold text-[#1350A3]">Click to view full details</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1350A3]/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedAnnouncement.category?.toLowerCase() === 'event' ? 'bg-purple-100 text-purple-800' :
                    selectedAnnouncement.category?.toLowerCase() === 'notice' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                    {selectedAnnouncement.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedAnnouncement.priority === 'high' ? 'bg-red-100 text-red-800' :
                    selectedAnnouncement.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                    {selectedAnnouncement.priority}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{selectedAnnouncement.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Close
              </button>
            </div>
            {selectedAnnouncement.imageUrl && (
              <img
                src={selectedAnnouncement.imageUrl}
                alt={selectedAnnouncement.title}
                className="mb-5 h-64 w-full rounded-xl object-cover"
              />
            )}
            <p className="mb-4 text-gray-700">{selectedAnnouncement.description}</p>
            <p className="mb-2 text-sm text-gray-700">
              <span className="font-semibold">Date:</span>{" "}
              {selectedAnnouncement.eventDate
                ? new Date(selectedAnnouncement.eventDate).toLocaleDateString()
                : new Date(selectedAnnouncement.createdAt).toLocaleDateString()}
            </p>
            {selectedAnnouncement.author && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Posted by:</span> {selectedAnnouncement.author}
              </p>
            )}
          </div>
        </div>
      )}

      {selectedAyuda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1350A3]/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{selectedAyuda.title}</h3>
                <div className="mt-2 flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedAyuda.status === 'active' ? 'bg-green-100 text-green-800' : selectedAyuda.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                    {selectedAyuda.status}
                  </span>
                  <span className="text-lg font-bold text-[#1350A3]">₱{selectedAyuda.amount.toLocaleString()}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAyuda(null)}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Close
              </button>
            </div>
            <p className="mb-4 text-gray-700">{selectedAyuda.description}</p>
            <p className="mb-2 text-sm text-gray-700"><span className="font-semibold">Distribution:</span> {selectedAyuda.distribution}</p>
            <p className="mb-2 text-sm text-gray-700"><span className="font-semibold">Eligibility:</span> {selectedAyuda.eligibility}</p>
            {selectedAyuda.startDate && (
              <p className="text-sm text-gray-700"><span className="font-semibold">Period:</span> {new Date(selectedAyuda.startDate).toLocaleDateString()} — {selectedAyuda.endDate ? new Date(selectedAyuda.endDate).toLocaleDateString() : 'TBD'}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
