import { Outlet, Link, NavLink, useLocation, useNavigate } from "react-router";
import { Menu, X, LogOut, FileText, Megaphone, FolderKanban, HandHelping, ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import sampleLogo from "../../assets/Sample Barangay Logo.png";
import manilaLogo from "../../assets/Manila.png"


export default function Root() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Mate+SC&family=Poppins:wght@400&display=swap');`}</style>
      {isAdminRoute ? (
        <div className="flex h-screen overflow-hidden">
          <aside
            className="flex h-screen shrink-0 flex-col justify-between overflow-hidden bg-white px-8 py-10"
            style={{ width: "412px", borderRight: "10px solid #1350A3", fontFamily: "'Poppins', sans-serif" }}
          >
            <div className="flex flex-1 flex-col">
              <div className="flex flex-col items-center pt-4 text-center">
                <img
                  src={sampleLogo}
                  alt="Sample Barangay Logo"
                  style={{ width: "220px", height: "220px", marginTop: "-40px", marginBottom: "-10px" }}
                  className="object-contain"
                />
                <h2
                  style={{
                    fontFamily: "'Mate SC', serif",
                    fontSize: "32px",
                    fontWeight: "400",
                    color: "#000000",
                    WebkitTextStroke: "1px #000000",
                    lineHeight: 1.1,
                    marginBottom: "-10px",
                  }}
                >
                  BARANGAY MALIGAYA
                </h2>
                <div className="mt-4 w-full max-w-[320px]" style={{ borderTop: "3px solid #000000" }} />
                <p
                  style={{
                    fontFamily: "'Mate SC', serif",
                    fontSize: "32px",
                    fontWeight: "400",
                    color: "#000000",
                    lineHeight: 1.1,
                    marginTop: "5px",
                  }}
                >
                  lungsod ng maynila
                </p>
              </div>

              <div className="flex flex-1 items-center justify-center">
                <nav className="flex w-full flex-col items-center gap-6">
                  <div className="flex w-full max-w-[320px] items-center gap-0">
                    <NavLink
                      to="/admin/reports"
                      className="flex h-14 w-14 shrink-0 items-center justify-center text-black transition hover:opacity-70"
                    >
                      <FileText className="h-10 w-10" />
                    </NavLink>
                    <NavLink
                      to="/admin/reports"
                      className={({ isActive }) =>
                        `flex h-16 w-[266px] items-center justify-start rounded-[15px] px-6 transition ${isActive ? "bg-[#1350A3] text-white" : "text-[#1350A3] hover:bg-gray-200"
                        }`
                      }
                      style={{ fontSize: "32px", fontFamily: "'Poppins', sans-serif" }}
                    >
                      Reports
                    </NavLink>
                  </div>
                  <div className="flex w-full max-w-[320px] items-center gap-0">
                    <NavLink
                      to="/admin/announcements"
                      className="flex h-14 w-14 shrink-0 items-center justify-center text-black transition hover:opacity-70"
                    >
                      <Megaphone className="h-10 w-10" />
                    </NavLink>
                    <NavLink
                      to="/admin/announcements"
                      className={({ isActive }) =>
                        `flex h-16 w-[286px] items-center justify-start rounded-[15px] px-6 transition ${isActive ? "bg-[#1350A3] text-white" : "text-[#1350A3] hover:bg-gray-200"
                        }`
                      }
                      style={{ fontSize: "30px", fontFamily: "'Poppins', sans-serif" }}
                    >
                      Announcements
                    </NavLink>
                  </div>
                  <div className="flex w-full max-w-[320px] items-center gap-2">
                    <NavLink
                      to="/admin/projects"
                      className="flex h-14 w-14 shrink-0 items-center justify-center text-black transition hover:opacity-70"
                    >
                      <FolderKanban className="h-10 w-10" />
                    </NavLink>
                    <NavLink
                      to="/admin/projects"
                      className={({ isActive }) =>
                        `flex h-16 w-[266px] items-center justify-start rounded-[15px] px-6 transition ${isActive ? "bg-[#1350A3] text-white" : "text-[#1350A3] hover:bg-gray-200"
                        }`
                      }
                      style={{ fontSize: "32px", fontFamily: "'Poppins', sans-serif" }}
                    >
                      Projects
                    </NavLink>
                  </div>
                  <div className="flex w-full max-w-[320px] items-center gap-2">
                    <NavLink
                      to="/admin/ayuda"
                      className="flex h-14 w-14 shrink-0 items-center justify-center text-black transition hover:opacity-70"
                    >
                      <HandHelping className="h-10 w-10" />
                    </NavLink>
                    <NavLink
                      to="/admin/ayuda"
                      className={({ isActive }) =>
                        `flex h-16 w-[266px] items-center justify-start rounded-[15px] px-6 transition ${isActive ? "bg-[#1350A3] text-white" : "text-[#1350A3] hover:bg-gray-200"
                        }`
                      }
                      style={{ fontSize: "32px", fontFamily: "'Poppins', sans-serif" }}
                    >
                      Ayuda
                    </NavLink>
                  </div>
                  <div className="flex w-full max-w-[320px] items-center gap-2">
                    <NavLink
                      to="/admin/ayuda-applications"
                      className="flex h-14 w-14 shrink-0 items-center justify-center text-black transition hover:opacity-70"
                    >
                      <ClipboardList className="h-10 w-10" />
                    </NavLink>
                    <NavLink
                      to="/admin/ayuda-applications"
                      className={({ isActive }) =>
                        `flex h-16 w-[286px] items-center justify-start rounded-[15px] px-6 transition ${
                          isActive ? "bg-[#1350A3] text-white" : "text-[#1350A3] hover:bg-gray-200"
                        }`
                      }
                      style={{ fontSize: "27px", fontFamily: "'Poppins', sans-serif" }}
                    >
                      Applications
                    </NavLink>
                  </div>
                </nav>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex h-14 w-14 items-center justify-center text-black transition hover:opacity-70"
              style={{ border: "none", fontFamily: "'Poppins', sans-serif" }}
            >
              <LogOut className="h-10 w-10" />
            </button>
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      ) : (
        <>
          <header style={{ backgroundColor: '#ffffff', borderBottom: '5px solid #1350A3', boxShadow: '0 4px 16px rgba(19,80,163,0.18)' }} className="sticky top-0 z-50">
            <nav className="w-full px-6 lg:px-10">
              <div style={{ height: '131px' }} className="flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3">
                  <img
                    src={sampleLogo}
                    alt="Sample Barangay Logo"
                    className="w-35 h-35 object-contain"
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontFamily: "'Mate SC', serif", fontSize: '24px', fontWeight: '400', color: '#13503', lineHeight: 1.15 }}>Barangay Portal</span>
                    <hr style={{ border: 'none', borderTop: '1px solid #000000', margin: '3px 0' }} />
                    <span style={{ fontFamily: "'Mate SC', serif", fontSize: '20px', fontWeight: '400', color: '#000000' }}>Lungsod ng Maynila</span>
                  </div>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                  <Link to="/" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60 transition">Home</Link>
                  <a href="/#about-us" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60 transition">
                    About Us
                  </a>
                  <a href="/#hotlines" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60 transition">
                    Hotlines
                  </a>
                  {isAdmin ? (
                    <>
                      <Link to="/admin/reports" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60 transition">Reports</Link>
                      <Link to="/admin/announcements" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60 transition">Announcements</Link>
                      <Link to="/admin/projects" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60 transition">Projects</Link>
                      <button
                        onClick={handleLogout}
                        style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400, background: 'none', border: 'none' }}
                        className="flex items-center gap-2 px-2 py-1 hover:opacity-60 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link to="/login" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400, background: 'none' }} className="px-2 py-1 hover:opacity-60 transition">
                      Admin Login
                    </Link>
                  )}
                </div>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  style={{ color: '#13503' }}
                  className="md:hidden p-2"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {mobileMenuOpen && (
                <div style={{ borderTop: '1px solid #1350A3' }} className="md:hidden py-4">
                  <div className="flex flex-col gap-4">
                    <Link to="/" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60" onClick={() => setMobileMenuOpen(false)}>
                      Home
                    </Link>
                    <a href="/#about-us" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60" onClick={() => setMobileMenuOpen(false)}>
                      About Us
                    </a>
                    <a href="/#hotlines" style={{ color: '#000000', fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="hover:opacity-60" onClick={() => setMobileMenuOpen(false)}>
                      Hotlines
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

          <footer
            style={{
              backgroundColor: "rgba(19, 80, 163, 1)",
              boxShadow: "0 16px 24px rgba(13, 13, 14, 0.18)",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "15px",
              fontWeight: 400,
            }}
            className="relative z-10 text-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="mb-10 flex justify-start" style={{ marginLeft: -250 }}>
                <div className="flex items-center gap-4">
                  <img
                    src={sampleLogo}
                    alt="Sample Barangay Logo"
                    style={{ width: "140px", height: "140px" }}
                    className="object-contain"
                  />
                  <img
                    src={manilaLogo}
                    alt="Manila Logo"
                    style={{ width: "90px", height: "90px" }}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div id="about-us">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-regular" style={{ marginLeft: -220, marginTop: -50, letterSpacing: 15, lineHeight: 2 }}>OFFICIAL WEBSITE OF BARANGAY MALIGAYA</h3>
                  </div>
                  <p className="text-white leading-relaxed" style={{ marginLeft: -220, fontSize: '16px' }}>About this website</p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: -220, marginTop: 15, fontSize: '16px' }}>Contact us</p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: -220, marginTop: 15, fontSize: '16px' }}>info.brgymaligaya@gmail.com</p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: -220, marginTop: 15, fontSize: '16px' }}>(049) 567-341</p>
                </div>

                <div id="hotlines">
                  <div className="mb-5">
                    <h3 className="text-2xl font-bold" style={{ marginLeft: 0, marginTop: -50, lineHeight: 2 }}>Emergency Hotline</h3>
                  </div>
                  <p className="text-white leading-relaxed" style={{ marginLeft: 0, fontSize: '16px', lineHeight: 2 }}>BFP</p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: 0, fontSize: '16px', lineHeight: 2 }}>(02) 8426-0219</p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: 0, fontSize: '16px', lineHeight: 2 }}>(02) 8426-0246 </p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: 0, marginTop: 15, fontSize: '16px' }}>NDRRMC</p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: 0, marginTop: 15, fontSize: '16px' }}>(02) 8911-5061 TO 65, loc 100</p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: 0, marginTop: 15, fontSize: '16px' }}>DSWD</p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: 0, marginTop: 15, fontSize: '16px' }}>(02) 8931-8101 to 07</p>
                </div>

                <div>
                  <p className="text-white leading-relaxed" style={{ marginLeft: -100, marginTop: 15, fontSize: '16px', lineHeight: 2 }}>MMDA</p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: -100, fontSize: '16px', lineHeight: 2 }}>(02) 882 4151 to 77</p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: -100, fontSize: '16px', lineHeight: 2 }}>(02) DPWH </p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: -100, marginTop: 15, fontSize: '16px' }}>165-02</p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: -100, marginTop: 15, fontSize: '16px' }}>PAG-ASA</p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: -100, marginTop: 15, fontSize: '16px' }}>(02) 8284-0800</p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: -100, marginTop: 15, fontSize: '16px' }}>PNP</p>
                  <p className="text-white leading-relaxed" style={{ marginLeft: -100, marginTop: 15, fontSize: '16px' }}>(02) 8722-0650 or 117</p>

                  <h3 className="text-xl font-bold mb-1" style={{ marginLeft: 250, marginTop: -360, lineHeight: 2 }}>Quick Links</h3>
                  <div className="flex flex-col gap-3">
                    <a href="/#announcements" className="text-gray-300 hover:text-white transition" style={{ marginLeft: 250 }}>
                      Announcements
                    </a>
                    <a href="/#projects" className="text-gray-300 hover:text-white transition" style={{ marginLeft: 250 }}>
                      Projects
                    </a>
                    <a
                      href="/#ayuda"
                      className="text-left text-gray-300 hover:text-white transition"
                      style={{ marginLeft: 250 }}
                    >
                      Ayuda
                    </a>
                    {isAdmin && (
                      <>
                        <Link to="/admin/reports" className="text-gray-300 hover:text-white transition">Reports Dashboard</Link>
                        <Link to="/admin/announcements" className="text-gray-300 hover:text-white transition">Announcements</Link>
                        <Link to="/admin/projects" className="text-gray-300 hover:text-white transition">Projects</Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-10">
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
