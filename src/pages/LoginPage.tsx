import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LoginPage = () => {
  const navigate = useNavigate();

  // Efek ini akan memantau status autentikasi.
  // Jika pengguna berhasil login, ia akan langsung diarahkan ke halaman /admin.
  useEffect(() => {
    supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        navigate("/admin");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-rose-50 flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold font-serif text-rose-800 text-center mb-2">
          Welcome Back!
        </h1>
        <p className="text-center text-slate-500 mb-8">
          Login to manage your blog.
        </p>

        {/* Komponen Auth dari Supabase */}
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google"]}
        />
      </div>
    </div>
  );
};

export default LoginPage;
