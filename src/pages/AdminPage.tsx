import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
}

const AdminPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        setSession(session);
        fetchPosts();
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
      else setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching posts:', error);
    else setPosts(data || []);
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const slug = createSlug(formData.title);

    if (editingPost) {
      // Update post
      const { error } = await supabase.from('posts').update({ ...formData, slug }).eq('id', editingPost.id);
      if (error) console.error('Error updating post:', error);
    } else {
      // Create post
      const { error } = await supabase.from('posts').insert([{ ...formData, slug}]);
      if (error) console.error('Error creating post:', error);
    }
    
    setFormData({ title: '', content: '' });
    setEditingPost(null);
    fetchPosts();
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({ title: post.title, content: post.content });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Anda yakin ingin menghapus postingan ini?')) {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) console.error('Error deleting post:', error);
      else fetchPosts();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!session) return null;

  return (
    <div className="bg-rose-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-serif text-rose-800">Admin Dashboard</h1>
          <button onClick={handleLogout} className="bg-rose-500 text-white px-5 py-2 rounded-full">Logout</button>
        </div>

        {/* Form Tambah/Edit Postingan */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-12">
          <h2 className="text-2xl font-serif text-rose-700 mb-4">{editingPost ? 'Edit Postingan' : 'Buat Postingan Baru'}</h2>
          <form onSubmit={handleSubmit}>
            <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Judul Postingan" className="w-full p-2 mb-4 border rounded" required />
            <textarea name="content" value={formData.content} onChange={handleInputChange} placeholder="Isi konten di sini..." className="w-full p-2 mb-4 border rounded" rows={8} required />
            <div className="flex gap-4">
              <button type="submit" className="bg-rose-500 text-white px-6 py-2 rounded-full">{editingPost ? 'Perbarui' : 'Publikasikan'}</button>
              {editingPost && <button type="button" onClick={() => { setEditingPost(null); setFormData({ title: '', content: '' }); }} className="bg-slate-200 px-6 py-2 rounded-full">Batal</button>}
            </div>
          </form>
        </div>

        {/* Daftar Postingan */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-serif text-rose-700 mb-4">Daftar Postingan</h2>
          {loading ? <p>Memuat...</p> : (
            <ul className="space-y-4">
              {posts.map(post => (
                <li key={post.id} className="flex justify-between items-center p-2 border-b">
                  <span>{post.title}</span>
                  <div className="space-x-2">
                    <button onClick={() => handleEdit(post)} className="text-blue-500">Edit</button>
                    <button onClick={() => handleDelete(post.id)} className="text-red-500">Hapus</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;