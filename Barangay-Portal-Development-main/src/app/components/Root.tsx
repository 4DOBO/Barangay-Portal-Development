import { Outlet, Link, useNavigate } from "react-router";
import { Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import sampleLogo from "../../assets/Sample Barangay Logo.png";

export default function Root() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

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
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Mate+SC&family=Poppins:wght@400&display=swap');`}</style>

      {/* ── LOGOUT MODAL ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogoutModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Logout</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '5px solid #1350A3', boxShadow: '0 4px 16px rgba(19,80,163,0.18)' }} className="sticky top-0 z-50">
        <nav className="w-full px-6 lg:px-10">
          <div style={{ height: '131px' }} className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src={sampleLogo} alt="Barangay Logo" className="w-35 h-35 object-contain" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: "'Mate SC', serif", fontSize: '24px', fontWeight: '400', color: '#13503', lineHeight: 1.15 }}>Barangay Portal</span>
                <hr style={{ border: 'none', borderTop: '1px solid #000000', margin: '3px 0' }} />
                <span style={{ fontFamily: "'Mate SC', serif", fontSize: '20px', fontWeight: '400', color: '#000000' }}>Lungsod ng Maynila</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="text-black transition hover:text-blue-600">Home</Link>
              {isAdmin ? (
                <>
                  <Link to="/admin/reports" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="text-black transition hover:text-blue-600">Reports</Link>
                  <Link to="/admin/announcements" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="text-black transition hover:text-blue-600">Announcements</Link>
                  <Link to="/admin/projects" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="text-black transition hover:text-blue-600">Projects</Link>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, background: 'none', border: 'none' }}
                    className="flex items-center gap-2 px-2 py-1 text-black transition hover:text-red-600 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="text-black px-2 py-1 hover:text-blue-600 transition">
                  Admin Login
                </Link>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ color: '#13503' }} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div style={{ borderTop: '1px solid #1350A3' }} className="md:hidden py-4">
              <div className="flex flex-col gap-4">
                <Link to="/" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="text-black hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                {isAdmin ? (
                  <>
                    <Link to="/admin/reports" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="text-black hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Reports</Link>
                    <Link to="/admin/announcements" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="text-black hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Announcements</Link>
                    <Link to="/admin/projects" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="text-black hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Projects</Link>
                    <button
                      onClick={() => { setMobileMenuOpen(false); setShowLogoutModal(true); }}
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, background: 'none', border: 'none' }}
                      className="flex items-center gap-2 px-2 py-1 text-black hover:text-red-600 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }} className="text-black px-2 py-1 hover:text-blue-600 text-center" onClick={() => setMobileMenuOpen(false)}>
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

      {/* ── FOOTER ── */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={sampleLogo} alt="Barangay Maligaya Logo" className="w-12 h-12 object-contain rounded-full" />
                <h3 className="text-2xl font-bold">Barangay Portal</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">Connecting the community through technology and transparency.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <div className="flex flex-col gap-3">
                <Link to="/" className="text-gray-300 hover:text-white transition">Home</Link>
                <Link to="/submit-report" className="text-gray-300 hover:text-white transition">Submit Report</Link>
                {isAdmin && (
                  <>
                    <Link to="/admin/reports" className="text-gray-300 hover:text-white transition">Reports Dashboard</Link>
                    <Link to="/admin/announcements" className="text-gray-300 hover:text-white transition">Announcements</Link>
                    <Link to="/admin/projects" className="text-gray-300 hover:text-white transition">Projects</Link>
                  </>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <div className="space-y-2 text-gray-300">
                <p>Email: barangay@example.com</p>
                <p>Phone: (123) 456-7890</p>
                <p>Address: Barangay Hall, City</p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; 2026 Barangay Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
