import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Tipe data baru untuk komentar
interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

interface Post {
  id: number; // Kita butuh ID post untuk menghubungkan komentar
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

const SinglePostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentData, setCommentData] = useState({ author_name: '', content: '' });
  const [commentStatus, setCommentStatus] = useState('');

  const fetchPostAndComments = async () => {
    if (!slug) return;
    setLoading(true);

    // 1. Ambil data postingan
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (postError) {
      console.error('Error fetching post:', postError);
      setLoading(false);
      return;
    }
    
    setPost(postData);

    // 2. Ambil komentar yang terhubung dengan post ini
    if (postData) {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postData.id)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
      } else {
        setComments(commentsData);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPostAndComments();
  }, [slug]);

  const handleCommentChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCommentData(prev => ({ ...prev, [name]: value }));
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!post || !commentData.author_name || !commentData.content) {
      setCommentStatus('Nama dan komentar tidak boleh kosong.');
      return;
    }

    setCommentStatus('Mengirim komentar...');

    const { error } = await supabase
      .from('comments')
      .insert([
        { 
          post_id: post.id,
          author_name: commentData.author_name,
          content: commentData.content
        }
      ]);

    if (error) {
      setCommentStatus('Gagal mengirim komentar.');
      console.error('Error submitting comment:', error);
    } else {
      setCommentStatus('Komentar berhasil dikirim!');
      setCommentData({ author_name: '', content: '' }); // Kosongkan form
      fetchPostAndComments(); // Muat ulang komentar
    }
    setTimeout(() => setCommentStatus(''), 4000);
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (!post) return <p className="text-center">Postingan tidak ditemukan.</p>;

  return (
    <>
      <article className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-lg">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-rose-800 leading-tight mt-4">
            {post.title}
          </h1>
          <p className="text-slate-500 mt-4 text-sm">
            Dipublikasikan pada {new Date(post.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>
        <figure>
          <img src={post.image_url || `https://placehold.co/1200x600/ffe4e6/be123c?text=Image`} alt={post.title} className="w-full h-auto rounded-xl shadow-md mb-8" />
        </figure>
        <div className="prose prose-lg max-w-none prose-rose whitespace-pre-wrap">
          {post.content}
        </div>
      </article>

      {/* --- BAGIAN BARU: KOMENTAR --- */}
      <section className="max-w-3xl mx-auto mt-12">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-serif text-rose-700 mb-6 border-b pb-4">Komentar ({comments.length})</h2>
          
          {/* Form Komentar */}
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <h3 className="font-semibold text-lg text-slate-800 mb-3">Tinggalkan Komentar</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="author_name" className="block text-sm font-medium text-slate-600 mb-1">Nama</label>
                <input id="author_name" name="author_name" type="text" value={commentData.author_name} onChange={handleCommentChange} required className="w-full p-2 border border-slate-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-600 mb-1">Komentar Anda</label>
                <textarea id="content" name="content" rows={4} value={commentData.content} onChange={handleCommentChange} required className="w-full p-2 border border-slate-300 rounded-md" />
              </div>
              <div className="flex items-center gap-4">
                <button type="submit" className="bg-rose-500 text-white px-6 py-2 rounded-full hover:bg-rose-600">Kirim Komentar</button>
                {commentStatus && <p className="text-sm text-slate-600">{commentStatus}</p>}
              </div>
            </div>
          </form>

          {/* Daftar Komentar */}
          <div className="space-y-6">
            {comments.length > 0 ? comments.map(comment => (
              <div key={comment.id} className="p-4 border-t border-rose-100">
                <div className="flex items-center mb-1">
                  <p className="font-semibold text-rose-800">{comment.author_name}</p>
                  <p className="text-xs text-slate-400 ml-3">{new Date(comment.created_at).toLocaleString('id-ID')}</p>
                </div>
                <p className="text-slate-700">{comment.content}</p>
              </div>
            )) : <p className="text-slate-500 text-center py-4">Jadilah yang pertama berkomentar!</p>}
          </div>
        </div>
      </section>
    </>
  );
};

export default SinglePostPage;