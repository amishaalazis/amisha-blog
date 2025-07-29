import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Post {
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

const SinglePostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
      } else {
        setPost(data);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) return <p className="text-center">Memuat...</p>;
  if (!post) return <p className="text-center">Postingan tidak ditemukan.</p>;

  return (
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
  );
};

export default SinglePostPage;