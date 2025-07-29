import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

// Definisikan tipe data untuk sebuah post
interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_url: string;
}

// Fungsi untuk membuat potongan teks
const createExcerpt = (htmlContent: string, maxLength: number = 100) => {
  if (!htmlContent) return '';
  const plainText = htmlContent.replace(/<[^>]+>/g, '');
  if (plainText.length <= maxLength) return plainText;
  return plainText.substr(0, plainText.lastIndexOf(' ', maxLength)) + '...';
};

const BlogPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- State Baru untuk Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 6; // Tampilkan 6 postingan per halaman

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      // Hitung rentang data yang akan diambil
      const from = (currentPage - 1) * postsPerPage;
      const to = from + postsPerPage - 1;

      // Ambil data untuk halaman saat ini DAN hitung total postingan
      const { data, error, count } = await supabase
        .from('posts')
        .select('*', { count: 'exact' }) // 'exact' untuk mendapatkan total jumlah
        .order('published_at', { ascending: false })
        .range(from, to); // Ambil data sesuai rentang halaman

      if (error) {
        console.error('Error fetching posts:', error);
        setError('Gagal memuat postingan. Silakan coba lagi nanti.');
      } else {
        setPosts(data);
        setTotalPosts(count || 0); // Simpan total postingan
      }
      setLoading(false);
    };

    fetchPosts();
    window.scrollTo(0, 0); // Scroll ke atas setiap kali ganti halaman
  }, [currentPage]); // Jalankan ulang efek ini setiap kali currentPage berubah

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const renderContent = () => {
    if (loading) return <p className="text-center text-slate-500">Memuat postingan...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (posts.length === 0) return <p className="text-center text-slate-500">Belum ada postingan yang dipublikasikan.</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div key={post.id} className="card bg-white rounded-xl overflow-hidden shadow-lg flex flex-col">
            <Link to={`/blog/${post.slug}`}>
              <img src={post.image_url || `https://placehold.co/600x400/ffe4e6/be123c?text=Image`} alt={post.title} className="w-full h-48 object-cover" />
            </Link>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="font-bold text-xl text-slate-800 mb-2 font-serif">
                <Link to={`/blog/${post.slug}`} className="hover:text-rose-600">{post.title}</Link>
              </h3>
              <p className="text-slate-600 text-sm mb-4 flex-grow">{createExcerpt(post.content)}</p>
              <a href={`/blog/${post.slug}`} className="text-rose-500 hover:text-rose-700 font-semibold mt-auto self-start">
                Read More &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section>
      <h2 className="text-3xl sm:text-4xl font-bold text-center font-serif text-rose-800 mb-12">My Latest Posts</h2>
      {renderContent()}

      {/* --- Komponen Pagination --- */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-4">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white rounded-md shadow disabled:opacity-50"
          >
            previous
          </button>
          <span className="text-slate-600">
            Page {currentPage} From {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white rounded-md shadow disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default BlogPage;