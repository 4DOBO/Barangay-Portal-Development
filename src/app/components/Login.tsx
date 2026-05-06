import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, Mail } from "lucide-react";
import { supabase } from "../../lib/supabase";
import barangayBg from "../../assets/Barangay.png";
import manilaLogo from "../../assets/Manila.png";
import sampleLogo from "../../assets/Sample Barangay Logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${barangayBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Background overlay at 30% opacity */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.70)' }} />

      {/* Logos on the right side */}
      <div className="absolute right-16 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-10">
        <img src={manilaLogo} alt="Manila Logo" style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
        <img src={sampleLogo} alt="Barangay Logo" style={{ width: '260px', height: '260px', objectFit: 'contain' }} />
      </div>

      {/* Login form — no background card */}
      <div className="w-full relative z-10" style={{ maxWidth: '472px' }}>

        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '32px' }}>Admin Login</h2>
          <p className="text-gray-300 mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Sign in to manage the barangay portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white z-10" />
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@barangay.com"
                style={{
                  width: '472px',
                  height: '81px',
                  borderRadius: '45px',
                  backgroundColor: 'rgba(255,255,255,0.85)',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '16px',
                  paddingLeft: '48px',
                  paddingRight: '20px',
                  border: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-white mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white z-10" />
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '472px',
                  height: '81px',
                  borderRadius: '45px',
                  backgroundColor: 'rgba(255,255,255,0.85)',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '16px',
                  paddingLeft: '48px',
                  paddingRight: '20px',
                  border: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '472px',
              height: '81px',
              borderRadius: '45px',
              backgroundColor: '#13503',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '32px',
              fontWeight: '400',
              color: '#ffffff',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-400 hover:text-blue-300 font-semibold"
              style={{ fontFamily: "'Poppins', sans-serif", background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Sign up
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/")}
            style={{ fontFamily: "'Poppins', sans-serif", background: 'none', border: 'none', cursor: 'pointer' }}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}