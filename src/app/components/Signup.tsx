import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, Mail, User } from "lucide-react";
import { supabase } from "../../lib/supabase";
import barangayBg from "../../assets/Barangay.png";
import sampleLogo from "../../assets/Sample Barangay Logo.png";

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
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: 'admin',
          },
        },
      });

      if (error) {
        throw error;
      }

      // Create a profile row for the new user
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{
            id: data.user.id,
            email: formData.email,
            full_name: formData.name,
            role: "admin",
          }]);

        if (profileError) {
          console.warn("Profile creation note:", profileError.message);
        }
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

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <img
                src={sampleLogo}
                alt="Barangay Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 object-contain"
              />
              <h2
                className="text-2xl sm:text-3xl font-bold text-gray-900"
                style={{ fontFamily: "'Mate SC', serif" }}
              >
                Create Admin Account
              </h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Sign up to manage the barangay portal
              </p>
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

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Juan Dela Cruz"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@barangay.com"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password (min 6 characters)"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-[#1350A3] text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-black-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}
                >
                  Sign in
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-black-600 hover:text-blue-700"
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}
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
