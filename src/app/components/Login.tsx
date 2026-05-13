import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase";
import barangayBg from "../../assets/Barangay.png";
import manilaLogo from "../../assets/Manila.png";
import sampleLogo from "../../assets/Sample Barangay Logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.session) {
        navigate("/admin/reports");
        window.location.reload();
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Mate+SC&family=Poppins:wght@400&display=swap');`}</style>

      {/* Background */}
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

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center gap-8 px-4 sm:px-6 lg:flex-row lg:justify-between lg:gap-12 py-8">
        {/* Left side — Branding */}
        <div className="flex flex-col items-center justify-center lg:flex-1">
          <h1
            className="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4"
            style={{
              fontFamily: "'Mate SC', serif",
              fontWeight: 700,
              color: "#1a1a1a",
              lineHeight: 1.1,
              letterSpacing: "2px",
            }}
          >
            WELCOME TO BARANGAY MALIGAYA PORTAL
          </h1>
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <img
              src={sampleLogo}
              alt="Barangay Logo"
              className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain"
            />
            <img
              src={manilaLogo}
              alt="Manila Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 object-contain"
            />
          </div>
        </div>

        {/* Right side — Login form */}
        <div className="flex w-full max-w-md items-center justify-center lg:flex-1">
          <div className="w-full">
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block font-regular text-black text-xl sm:text-2xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  style={{
                    height: "52px",
                    borderRadius: "26px",
                    backgroundColor: "rgba(255,255,255,0.85)",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "16px",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                    border: "none",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block font-regular text-black text-xl sm:text-2xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    style={{
                      height: "52px",
                      borderRadius: "26px",
                      backgroundColor: "rgba(255,255,255,0.85)",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "16px",
                      paddingLeft: "20px",
                      paddingRight: "52px",
                      border: "none",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 sm:px-16 py-3 rounded-full text-white text-lg sm:text-xl transition"
                  style={{
                    backgroundColor: "#1350A3",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: "400",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm sm:text-base text-black" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="font-semibold text-blue-600 hover:text-blue-300"
                  style={{ fontFamily: "'Poppins', sans-serif", background: "none", border: "none", cursor: "pointer", fontSize: 'inherit' }}
                >
                  Create New Admin
                </button>
              </p>
            </div>

            <div className="mt-3 text-center">
              <button
                onClick={() => navigate("/")}
                style={{ fontFamily: "'Poppins', sans-serif", background: "none", border: "none", cursor: "pointer" }}
                className="text-sm sm:text-base text-black hover:text-blue-300"
              >
                Back to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
