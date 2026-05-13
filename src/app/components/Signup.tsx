import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, Mail, User } from "lucide-react";
import { API_URL, publicAnonKey } from "../../lib/supabase";
import barangayBg from "../../assets/Barangay.png";
import sampleLogo from "../../assets/Sample Barangay Logo.png";
import manilaLogo from "../../assets/Manila.png";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Signup response:", data);

      if (!response.ok) {
        throw new Error(data.error || `Failed to create account (${response.status})`);
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden px-4 sm:px-6 lg:px-8">
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
      <div className="relative z-10 mx-auto flex h-full max-w-md items-center justify-center">
        <div className="w-full p-8" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
          <div className="mb-10 text-center">
            <h2
              className="text-black"
              style={{ fontFamily: "'Mate SC', serif", fontSize: "32px", fontWeight: 400, lineHeight: 1.1, marginTop: '-30px' }}
            >
              BARANGAY MALIGAYA
            </h2>
            <div className="mx-auto mt-4 w-full max-w-[280px]" style={{ borderTop: "3px solid #000000", marginTop: '10px' }} />
            <p
              className="mt-4 text-black"
              style={{ fontFamily: "'Mate SC', serif", fontSize: "32px", fontWeight: 400, lineHeight: 1.1, marginTop: '5px' }}
            >
              lungsod ng maynila
            </p>
            <div className="mt-6 flex items-center justify-center gap-0">
              <img
                src={sampleLogo}
                alt="Sample Barangay Logo"
                className="object-contain"
                style={{ width: "140px", height: "140px", marginTop: '-30px', marginRight: '10px' }}
              />
              <img
                src={manilaLogo}
                alt="Manila Logo"
                className="object-contain"
                style={{ width: "90px", height: "90px", marginTop: '-30px', marginRight: '25px' }}
              />
            </div>
            <h3
              className="text-black"
              style={{ fontFamily: "'Mate SC', serif", fontSize: "32px", fontWeight: 400, lineHeight: 1.1, marginTop: '10px' }}
            >
              Create New Admin
            </h3>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-black mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-[45px] bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Juan Dela Cruz"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-[45px] bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@barangay.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-[45px] bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password (min 6 characters)"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-[45px] font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-black-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign in
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-black-600 hover:text-blue-700"
            >
              Back to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
