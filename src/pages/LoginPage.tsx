import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cek jika sudah ada sesi aktif, langsung arahkan ke admin
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/admin");
      }
    });
  }, [navigate]);

  // Fungsi untuk menangani proses login saat form disubmit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Mencoba login ke Supabase dengan email dan password
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError("Incorrect email or password. Please try again..");
      console.error("Login error:", error.message);
    } else {
      // Jika berhasil, arahkan ke halaman admin
      navigate("/admin");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-rose-50 flex justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold font-serif text-rose-800 text-center mb-2">
          Admin Login
        </h1>
        <p className="text-center text-slate-500 mb-8">
        Please log in to manage your blog.
        </p>

        <form onSubmit={handleLogin}>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-slate-700 font-medium mb-2">Email</label>
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-rose-50 focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-slate-700 font-medium mb-2">Password</label>
              <input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-rose-50 focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-rose-500 text-white py-3 rounded-full hover:bg-rose-600 transition-colors font-semibold text-lg disabled:bg-slate-400"
              >
                {loading ? 'Processing...' : 'Login'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;