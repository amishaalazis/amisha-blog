import { useEffect, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';

// Tipe data untuk komentar
interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

// Tipe data untuk postingan, termasuk objek kategori
interface Post {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  published_at: string | null;
  categories: {
    name: string;
    slug: string;
  } | null;
}

const SinglePostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentData, setCommentData] = useState({ author_name: '', content: '' });
  const [commentStatus, setCommentStatus] = useState('');
  const [session, setSession] = useState<Session | null>(null);

  // Cek sesi login saat komponen dimuat untuk menentukan apakah tombol hapus ditampilkan
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  // Fungsi untuk mengambil data postingan dan komentarnya
  const fetchPostAndComments = async () => {
    if (!slug) return;
    setLoading(true);

    // 1. Ambil data postingan beserta nama kategorinya (join)
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('*, categories (name, slug)')
      .eq('slug', slug)
      .single();

    if (postError) {
      console.error('Error fetching post:', postError);
      setLoading(false);
      return;
    }
    
    setPost(postData as Post);

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
      setCommentStatus('Name and comments cannot be left blank.');
      return;
    }

    setCommentStatus('Sent Comment...');

    const { error } = await supabase
      .from('comments')
      .insert([{ 
        post_id: post.id,
        author_name: commentData.author_name,
        content: commentData.content
      }]);

    if (error) {
      setCommentStatus('Failed to post comment.');
    } else {
      setCommentStatus('Your comment has been successfully submitted!');
      setCommentData({ author_name: '', content: '' });
      fetchPostAndComments();
    }
    setTimeout(() => setCommentStatus(''), 4000);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment.');
      } else {
        fetchPostAndComments();
      }
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (!post) return <p className="text-center">Post Not Found.</p>;

  // Gunakan tanggal publikasi jika ada, jika tidak, gunakan tanggal pembuatan
  const displayDate = post.published_at || post.created_at;

  return (
    <>
      <div className="max-w-3xl mx-auto mb-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-800 font-semibold transition-colors">
          <i className="fas fa-arrow-left"></i>
          Back to All Post
        </Link>
      </div>

      <article className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-lg">
        <header className="text-center mb-8">
          {post.categories && (
            <span className="text-sm font-semibold bg-rose-100 text-rose-600 px-3 py-1 rounded-full">
              {post.categories.name}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-rose-800 leading-tight mt-4">
            {post.title}
          </h1>
          <p className="text-slate-500 mt-4 text-sm">
            Publish at {new Date(displayDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>
        <figure>
          <img src={post.image_url || `https://placehold.co/1200x600/ffe4e6/be123c?text=Image`} alt={post.title} className="w-full h-auto rounded-xl shadow-md mb-8" />
        </figure>
        <div 
          className="prose prose-lg max-w-none prose-rose text-justify"
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      </article>

      <section className="max-w-3xl mx-auto mt-12">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl text-rose-700 mb-6 border-b pb-4">Comment ({comments.length})</h2>
          
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <h3 className="font-semibold text-lg text-slate-800 mb-3">Leave Comment</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="author_name" className="block text-sm font-medium text-slate-600 mb-1">Name</label>
                <input id="author_name" name="author_name" type="text" value={commentData.author_name} onChange={handleCommentChange} required className="w-full p-2 border border-slate-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-600 mb-1">Your Comments</label>
                <textarea id="content" name="content" rows={4} value={commentData.content} onChange={handleCommentChange} required className="w-full p-2 border border-slate-300 rounded-md" />
              </div>
              <div className="flex items-center gap-4">
                <button type="submit" className="bg-rose-500 text-white px-6 py-2 rounded-full hover:bg-rose-600">Sent Comment</button>
                {commentStatus && <p className="text-sm text-slate-600">{commentStatus}</p>}
              </div>
            </div>
          </form>

          <div className="space-y-6">
            {comments.length > 0 ? comments.map(comment => (
              <div key={comment.id} className="p-4 border-t border-rose-100 group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-rose-800">{comment.author_name}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(comment.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  {session && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)} 
                      className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-slate-700 mt-2">{comment.content}</p>
              </div>
            )) : <p className="text-slate-500 text-center py-4">Be the first to comment!</p>}
          </div>
        </div>
      </section>
    </>
  );
};

export default SinglePostPage;
