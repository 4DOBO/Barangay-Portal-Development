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
    <div className="relative h-screen overflow-hidden px-6">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Mate+SC&family=Poppins:wght@400&display=swap');`}</style>
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

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center gap-8 lg:flex-row lg:justify-between">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-6">
            <h1
              className="text-center"
              style={{
                fontFamily: "'Mate SC', serif",
                fontSize: "48px",
                fontWeight: "400",
                color: "#000000",
                marginTop: "30px",
                marginBottom: "-80px",
                marginLeft: "-100px",
                lineHeight: 1.1,
                letterSpacing: "3px",
                WebkitTextStroke: "1px #000000",
              }}
            >
              WELCOME TO BARANGAY MALIGAYA PORTAL
            </h1>
            <div className="flex flex-nowrap items-center justify-center gap-3">
              <img
                src={sampleLogo}
                alt="Barangay Logo"
                className="shrink-0"
                style={{ width: "500px", height: "500px", objectFit: "contain", marginLeft: "-250px" }}
              />
              <img
                src={manilaLogo}
                alt="Manila Logo"
                className="shrink-0"
                style={{ width: "316px", height: "316px", objectFit: "contain", marginLeft: "-80px" }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center lg:justify-end">
          <div className="w-full" style={{ maxWidth: "472px" }}>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-regular text-black" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "32px" }}>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "472px",
                      height: "81px",
                      borderRadius: "45px",
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
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-regular text-black" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "32px" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "472px",
                      height: "81px",
                      borderRadius: "45px",
                      backgroundColor: "rgba(255,255,255,0.85)",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "16px",
                      paddingLeft: "20px",
                      paddingRight: "64px",
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
                    {showPassword ? <EyeOff className="h-10 w-10" /> : <Eye className="h-10 w-10" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "240px",
                  height: "81px",
                  borderRadius: "45px",
                  marginLeft: "130px",
                  backgroundColor: "#1350A3",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "32px",
                  fontWeight: "400",
                  color: "#ffffff",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-black-400" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '18px' }}>
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="font-semibold text-blue-600 hover:text-blue-300"
                  style={{ fontFamily: "'Poppins', sans-serif", background: "none", border: "none", cursor: "pointer", fontSize: '18px' }}
                >
                  Create New Admin
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate("/")}
                style={{ fontFamily: "'Poppins', sans-serif", background: "none", border: "none", cursor: "pointer", fontSize: '18px' }}
                className="text-sm text-black-400 hover:text-blue-300"
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
