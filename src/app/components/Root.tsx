import { Outlet, Link, NavLink, useLocation, useNavigate } from "react-router";
import { Menu, X, LogOut, FileText, Megaphone, FolderKanban, HandHelping, ClipboardList, HandHeart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import sampleLogo from "../../assets/Sample Barangay Logo.png";
import manilaLogo from "../../assets/Manila.png"


export default function Root() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAdmin(!!session?.access_token);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    navigate("/");
  };

  const handleSectionScroll = (sectionId: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const scrollToSection = () => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      const headerOffset = 96;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: Math.max(sectionTop, 0), behavior: "smooth" });
      setMobileMenuOpen(false);
    };

    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(scrollToSection, 150);
      return;
    }

    scrollToSection();
  };

  const handleScrollTop = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Mate+SC&family=Poppins:wght@400&display=swap');`}</style>
      {isAdminRoute ? (
        <div className="flex h-screen overflow-hidden">
          {/* Admin Sidebar — desktop only */}
          <aside
            className="hidden md:flex h-screen shrink-0 flex-col justify-between bg-white px-2 lg:px-4 py-6 lg:py-8 transition-all duration-300 relative"
            style={{ width: isSidebarCollapsed ? "80px" : "clamp(220px, 20vw, 320px)", borderRight: "6px solid #1350A3", fontFamily: "'Poppins', sans-serif" }}
          >
            {/* Collapse Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute top-4 -right-4 bg-white border-2 border-[#1350A3] rounded-full p-1 text-[#1350A3] hover:bg-gray-100 z-50 transition"
              style={{ cursor: "pointer", zIndex: 100 }}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <div className="flex flex-1 flex-col">
              <div className="flex flex-col items-center pt-2 text-center">
                <img
                  src={sampleLogo}
                  alt="Sample Barangay Logo"
                  className={`${isSidebarCollapsed ? 'w-10 h-10' : 'w-20 lg:w-28 h-20 lg:h-28'} object-contain transition-all duration-300`}
                />
                {!isSidebarCollapsed && (
                  <>
                    <h2
                      style={{
                        fontFamily: "'Mate SC', serif",
                        fontWeight: 700,
                        color: "#1a1a1a",
                        lineHeight: 1.1,
                      }}
                      className="text-lg lg:text-xl mt-2 whitespace-nowrap"
                    >
                      BARANGAY MALIGAYA
                    </h2>
                    <div className="mt-2 w-full max-w-[240px]" style={{ borderTop: "2px solid #000000" }} />
                    <p
                      style={{
                        fontFamily: "'Mate SC', serif",
                        fontWeight: "400",
                        color: "#000000",
                        lineHeight: 1.1,
                      }}
                      className="text-base lg:text-lg mt-1 whitespace-nowrap"
                    >
                      lungsod ng maynila
                    </p>
                  </>
                )}
              </div>

              <div className="flex flex-1 items-center justify-center mt-6">
                <nav className="flex w-full flex-col items-center gap-3 lg:gap-4">
                  <div className="flex w-full max-w-[260px] items-center gap-0">
                    <NavLink
                      to="/admin/reports"
                      className={({ isActive }) => `flex h-10 w-10 shrink-0 items-center justify-center transition hover:opacity-70 ${isActive ? "text-[#1350A3]" : "text-black"}`}
                      title="Reports"
                    >
                      <FileText className="h-6 w-6" />
                    </NavLink>
                    {!isSidebarCollapsed && (
                      <NavLink
                        to="/admin/reports"
                        className={({ isActive }) =>
                          `flex h-10 lg:h-12 flex-1 items-center justify-start rounded-[12px] px-3 lg:px-4 transition text-base lg:text-lg ${isActive ? "bg-[#1350A3] text-white" : "text-[#1350A3] hover:bg-gray-200"
                          }`
                        }
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        Reports
                      </NavLink>
                    )}
                  </div>
                  <div className="flex w-full max-w-[260px] items-center gap-0">
                    <NavLink
                      to="/admin/announcements"
                      className={({ isActive }) => `flex h-10 w-10 shrink-0 items-center justify-center transition hover:opacity-70 ${isActive ? "text-[#1350A3]" : "text-black"}`}
                      title="Announcements"
                    >
                      <Megaphone className="h-6 w-6" />
                    </NavLink>
                    {!isSidebarCollapsed && (
                      <NavLink
                        to="/admin/announcements"
                        className={({ isActive }) =>
                          `flex h-10 lg:h-12 flex-1 items-center justify-start rounded-[12px] px-3 lg:px-4 transition text-sm lg:text-base ${isActive ? "bg-[#1350A3] text-white" : "text-[#1350A3] hover:bg-gray-200"
                          }`
                        }
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        Announcements
                      </NavLink>
                    )}
                  </div>
                  <div className="flex w-full max-w-[260px] items-center gap-0">
                    <NavLink
                      to="/admin/projects"
                      className={({ isActive }) => `flex h-10 w-10 shrink-0 items-center justify-center transition hover:opacity-70 ${isActive ? "text-[#1350A3]" : "text-black"}`}
                      title="Projects"
                    >
                      <FolderKanban className="h-6 w-6" />
                    </NavLink>
                    {!isSidebarCollapsed && (
                      <NavLink
                        to="/admin/projects"
                        className={({ isActive }) =>
                          `flex h-10 lg:h-12 flex-1 items-center justify-start rounded-[12px] px-3 lg:px-4 transition text-base lg:text-lg ${isActive ? "bg-[#1350A3] text-white" : "text-[#1350A3] hover:bg-gray-200"
                          }`
                        }
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        Projects
                      </NavLink>
                    )}
                  </div>
                  <div className="flex w-full max-w-[260px] items-center gap-0">
                    <NavLink
                      to="/admin/ayuda"
                      className={({ isActive }) => `flex h-10 w-10 shrink-0 items-center justify-center transition hover:opacity-70 ${isActive ? "text-[#1350A3]" : "text-black"}`}
                      title="Ayuda"
                    >
                      <HandHeart className="h-6 w-6" />
                    </NavLink>
                    {!isSidebarCollapsed && (
                      <NavLink
                        to="/admin/ayuda"
                        className={({ isActive }) =>
                          `flex h-10 lg:h-12 flex-1 items-center justify-start rounded-[12px] px-3 lg:px-4 transition text-base lg:text-lg ${isActive ? "bg-[#1350A3] text-white" : "text-[#1350A3] hover:bg-gray-200"
                          }`
                        }
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        Ayuda
                      </NavLink>
                    )}
                  </div>

                </nav>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center text-black transition hover:opacity-70 mx-auto"
              style={{ border: "none", fontFamily: "'Poppins', sans-serif" }}
              title="Logout"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </aside>

          {/* Mobile admin header */}
          <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-[#1350A3] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={sampleLogo} alt="Logo" className="w-10 h-10 object-contain" />
              <span style={{ fontFamily: "'Mate SC', serif", fontWeight: 400, fontSize: '14px' }}>BARANGAY MALIGAYA</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-black"
              style={{ background: 'none', border: 'none' }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile admin nav dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed top-[60px] left-0 right-0 z-40 bg-white border-b-4 border-[#1350A3] shadow-lg">
              <nav className="flex flex-col p-4 gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <NavLink
                  to="/admin/reports"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? "bg-[#1350A3] text-white" : "text-[#1350A3] hover:bg-gray-100"}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="h-5 w-5" />
                  Reports
                </NavLink>
                <NavLink
                  to="/admin/announcements"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? "bg-[#1350A3] text-white" : "text-[#1350A3] hover:bg-gray-100"}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Megaphone className="h-5 w-5" />
                  Announcements
                </NavLink>
                <NavLink
                  to="/admin/projects"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? "bg-[#1350A3] text-white" : "text-[#1350A3] hover:bg-gray-100"}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FolderKanban className="h-5 w-5" />
                  Projects
                </NavLink>
                <NavLink
                  to="/admin/ayuda"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? "bg-[#1350A3] text-white" : "text-[#1350A3] hover:bg-gray-100"}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HandHeart className="h-5 w-5" />
                  Ayuda
                </NavLink>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
                  style={{ background: 'none', border: 'none' }}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </div>
          )}

          <main className="min-w-0 flex-1 overflow-y-auto md:pt-0 pt-[60px]">
            <Outlet />
          </main>
        </div>
      ) : (
        <>
          {/* Public Header */}
          <header style={{ backgroundColor: '#ffffff', borderBottom: '4px solid #1350A3', boxShadow: '0 4px 16px rgba(19,80,163,0.12)' }} className="sticky top-0 z-50">
            <nav className="w-full px-4 sm:px-6 lg:px-10">
              <div className="h-16 sm:h-20 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-0 sm:gap-2" style={{ textDecoration: 'none' }}>
                  <img
                    src={sampleLogo}
                    alt="Sample Barangay Logo"
                    className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                  />
                  <div className="flex flex-col">
                    <span style={{ fontFamily: "'Mate SC', serif", fontWeight: 700, color: '#000000', lineHeight: 1.15 }} className="text-md sm:text-xl">BARANGAY MALIGAYA</span>
                    <hr style={{ border: 'none', borderTop: '1px solid #000000', margin: '2px 0' }} />
                    <span style={{ fontFamily: "'Mate SC', serif", fontWeight: 400, color: '#000000' }} className="text-sm sm:text-lg">lungsod ng maynila</span>
                  </div>
                </Link>

                <div className="hidden md:flex items-center gap-4 lg:gap-8">
                  <Link to="/" onClick={handleScrollTop} style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60 transition text-sm lg:text-base">Home</Link>
                  <div className="relative group">
                    <button
                      type="button"
                      style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400, background: 'none', border: 'none' }}
                      className="hover:opacity-60 transition text-sm lg:text-base"
                    >
                      Quick Links
                    </button>
                    <div className="invisible absolute left-0 top-full z-50 mt-2 w-44 rounded-xl border border-[#1350A3]/20 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                      <a href="/#announcements" onClick={handleSectionScroll("announcements")} className="block rounded-lg px-3 py-2 text-sm text-[#1350A3] transition hover:bg-gray-100">
                        Announcements
                      </a>
                      <a href="/#projects" onClick={handleSectionScroll("projects")} className="block rounded-lg px-3 py-2 text-sm text-[#1350A3] transition hover:bg-gray-100">
                        Projects
                      </a>
                      <a href="/#ayuda" onClick={handleSectionScroll("ayuda")} className="block rounded-lg px-3 py-2 text-sm text-[#1350A3] transition hover:bg-gray-100">
                        Ayuda
                      </a>
                    </div>
                  </div>
                  <a href="/#about-us" onClick={handleSectionScroll("about-us")} style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60 transition text-sm lg:text-base">
                    About Us
                  </a>
                  {isAdmin ? (
                    <>
                      <Link to="/admin/reports" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60 transition text-sm lg:text-base">Reports</Link>
                      <Link to="/admin/announcements" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60 transition text-sm lg:text-base">Announcements</Link>
                      <Link to="/admin/projects" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60 transition text-sm lg:text-base">Projects</Link>
                      <button
                        onClick={handleLogout}
                        style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400, background: 'none', border: 'none' }}
                        className="flex items-center gap-2 px-2 py-1 hover:opacity-60 transition text-sm lg:text-base"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link to="/login" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400, background: 'none' }} className="px-2 py-1 hover:opacity-60 transition text-sm lg:text-base">
                      Admin Login
                    </Link>
                  )}
                </div>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-[#1350A3]"
                  style={{ background: 'none', border: 'none' }}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {mobileMenuOpen && (
                <div style={{ borderTop: '1px solid #1350A3' }} className="md:hidden py-4">
                  <div className="flex flex-col gap-4">
                    <Link to="/" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60" onClick={handleScrollTop}>
                      Home
                    </Link>
                    <a href="/#announcements" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60" onClick={handleSectionScroll("announcements")}>
                      Announcements
                    </a>
                    <a href="/#projects" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60" onClick={handleSectionScroll("projects")}>
                      Projects
                    </a>
                    <a href="/#ayuda" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60" onClick={handleSectionScroll("ayuda")}>
                      Ayuda
                    </a>
                    <a href="/#about-us" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60" onClick={handleSectionScroll("about-us")}>
                      About Us
                    </a>
                    {isAdmin ? (
                      <>
                        <Link to="/admin/reports" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60" onClick={() => setMobileMenuOpen(false)}>
                          Reports
                        </Link>
                        <Link to="/admin/announcements" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60" onClick={() => setMobileMenuOpen(false)}>
                          Announcements
                        </Link>
                        <Link to="/admin/projects" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60" onClick={() => setMobileMenuOpen(false)}>
                          Projects
                        </Link>
                        <Link to="/admin/ayuda" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60" onClick={() => setMobileMenuOpen(false)}>
                          Ayuda
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400, background: 'none', border: 'none' }}
                          className="flex items-center gap-2 px-2 py-1 hover:opacity-60"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <Link to="/login" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400, background: 'none' }} className="px-2 py-1 hover:opacity-60 text-center" onClick={() => setMobileMenuOpen(false)}>
                        Admin Login
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </nav>
          </header>

          <main>
            <Outlet />
          </main>

          {/* Footer */}
          <footer
            style={{
              backgroundColor: "rgba(19, 80, 163, 1)",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "15px",
              fontWeight: 400,
            }}
            className="relative z-10 text-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                {/* About & Logos */}
                <div id="about-us" className="sm:col-span-2 lg:col-span-1 flex flex-col">
                  {/* Logo row */}
                  <div className="mb-6 flex items-center gap-4">
                    <img
                      src={sampleLogo}
                      alt="Sample Barangay Logo"
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain"
                    />
                    <img
                      src={manilaLogo}
                      alt="Manila Logo"
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium mb-3" style={{ letterSpacing: '1px', lineHeight: 1.4 }}>
                    OFFICIAL WEBSITE OF BARANGAY MALIGAYA
                  </h3>
                  <div className="space-y-1 text-sm text-white/90">
                    <p>About this website</p>
                    <p>Contact us</p>
                    <p>info.brgymaligaya@gmail.com</p>
                    <p>(049) 567-341</p>
                  </div>
                </div>

                {/* Emergency Hotlines Column 1 */}
                <div id="hotlines">
                  <h3 className="text-base sm:text-lg font-bold mb-4">Emergency Hotline</h3>
                  <div className="space-y-4 text-sm text-white/90">
                    <div>
                      <p className="font-semibold text-white">BFP</p>
                      <p>(02) 8426-0219</p>
                      <p>(02) 8426-0246</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">NDRRMC</p>
                      <p>(02) 8911-5061 TO 65, loc 100</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">DSWD</p>
                      <p>(02) 8931-8101 to 07</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Hotlines Column 2 */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-4 invisible hidden sm:block">&nbsp;</h3>
                  <div className="space-y-4 text-sm text-white/90 sm:mt-0 mt-2">
                    <div>
                      <p className="font-semibold text-white">MMDA</p>
                      <p>(02) 882 4151 to 77</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">DPWH</p>
                      <p>165-02</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">PAG-ASA</p>
                      <p>(02) 8284-0800</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">PNP</p>
                      <p>(02) 8722-0650 or 117</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
