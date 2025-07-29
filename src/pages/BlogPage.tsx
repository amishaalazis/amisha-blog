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
// Ganti fungsi createExcerpt yang lama dengan ini:
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

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        setError('Gagal memuat postingan. Silakan coba lagi nanti.');
      } else {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-slate-500">Loading posts...</p>;
    }

    if (error) {
      return <p className="text-center text-red-500">{error}</p>;
    }

    if (posts.length === 0) {
      return <p className="text-center text-slate-500">No posts have been published yet.</p>;
    }

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
    </section>
  );
};

export default BlogPage;