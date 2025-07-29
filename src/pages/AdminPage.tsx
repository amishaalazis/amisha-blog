import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';

// Definisikan tipe data
interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  image_url: string | null;
  published_at: string;
}

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const AdminPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); // State baru untuk pesan
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', published_at: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  // Fungsi untuk mengambil semua data admin (post dan pesan)
  const fetchAdminData = async () => {
    setLoading(true);
    
    const postsPromise = supabase.from('posts').select('*').order('published_at', { ascending: false });
    const messagesPromise = supabase.from('messages').select('*').order('created_at', { ascending: false });

    const [postsResult, messagesResult] = await Promise.all([postsPromise, messagesPromise]);

    if (postsResult.error) {
      console.error('Error fetching posts:', postsResult.error);
      setStatusMessage('Gagal memuat postingan.');
    } else {
      setPosts(postsResult.data || []);
    }

    if (messagesResult.error) {
      console.error('Error fetching messages:', messagesResult.error);
      setStatusMessage('Gagal memuat pesan.');
    } else {
      setMessages(messagesResult.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        setSession(session);
        fetchAdminData(); // Panggil fungsi data gabungan
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
      else setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  
  // ... (Fungsi-fungsi lain seperti handleInputChange, handleSubmit, dll. tetap sama)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const createSlug = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', published_at: '' });
    setImageFile(null);
    setImagePreview(null);
    setEditingPost(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setIsSubmitting(true);
    setStatusMessage('Menyimpan...');

    let imageUrl = editingPost?.image_url || null;

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage.from('post-images').upload(fileName, imageFile);
      if (uploadError) {
        setStatusMessage('Gagal mengupload gambar.');
        setIsSubmitting(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(fileName);
      imageUrl = publicUrl;
    }

    const slug = createSlug(formData.title);
    const postData = {
      title: formData.title,
      content: formData.content,
      slug: slug,
      image_url: imageUrl,
      published_at: formData.published_at ? new Date(formData.published_at).toISOString() : new Date().toISOString(),
    };

    let error = null;
    if (editingPost) {
      const { error: updateError } = await supabase.from('posts').update(postData).eq('id', editingPost.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('posts').insert([postData]);
      error = insertError;
    }

    if (error) {
      setStatusMessage('Gagal menyimpan postingan.');
      console.error('Error saving post:', error);
    } else {
      setStatusMessage(editingPost ? 'Postingan berhasil diperbarui!' : 'Postingan berhasil dibuat!');
      resetForm();
      fetchAdminData();
    }
    setIsSubmitting(false);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({ 
      title: post.title, 
      content: post.content,
      published_at: post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : ''
    });
    setImagePreview(post.image_url);
    setImageFile(null);
    window.scrollTo(0, 0);
  };

  const handleDeletePost = async (postToDelete: Post) => {
    if (window.confirm('Anda yakin ingin menghapus postingan ini?')) {
      setStatusMessage('Menghapus...');
      if (postToDelete.image_url) {
        const fileName = postToDelete.image_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('post-images').remove([fileName]);
        }
      }
      const { error: dbError } = await supabase.from('posts').delete().eq('id', postToDelete.id);
      if (dbError) {
        setStatusMessage('Gagal menghapus postingan.');
      } else {
        setStatusMessage('Postingan berhasil dihapus.');
        fetchAdminData();
      }
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // --- FUNGSI BARU UNTUK PESAN ---
  const handleToggleRead = async (message: Message) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: !message.is_read })
      .eq('id', message.id);
    if (error) console.error('Error updating message status:', error);
    else fetchAdminData(); // Muat ulang data untuk update UI
  };

  const handleDeleteMessage = async (id: number) => {
    if (window.confirm('Anda yakin ingin menghapus pesan ini?')) {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) console.error('Error deleting message:', error);
      else fetchAdminData();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!session) return null;

  return (
    <div className="bg-rose-50 min-h-screen font-sans">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold font-serif text-rose-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-sm text-slate-600 hover:text-rose-500 transition-colors">Lihat Situs</Link>
            <button onClick={handleLogout} className="bg-rose-500 text-white px-5 py-2 rounded-full hover:bg-rose-600 text-sm font-medium">Logout</button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Kolom Form */}
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
            {/* ... Kode form tetap sama ... */}
             <h2 className="text-2xl font-serif text-rose-700 mb-6 border-b pb-4">{editingPost ? 'Edit Postingan' : 'Buat Postingan Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Judul</label>
                <input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Judul yang menarik..." className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-400 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload Gambar</label>
                {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-2 border" />}
                <input type="file" onChange={handleImageChange} accept="image/*" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200" />
              </div>
              <div>
                <label htmlFor="published_at" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Publikasi (Opsional)</label>
                <input id="published_at" name="published_at" type="date" value={formData.published_at} onChange={handleInputChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-400 outline-none" />
                <p className="text-xs text-slate-500 mt-1">Jika dikosongkan, akan menggunakan tanggal hari ini.</p>
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">Konten</label>
                <textarea id="content" name="content" value={formData.content} onChange={handleInputChange} placeholder="Tuliskan ceritamu di sini..." className="w-full p-3 border border-slate-300 rounded-lg" rows={12} required />
              </div>
              <div className="flex gap-4 items-center pt-4 border-t">
                <button type="submit" disabled={isSubmitting} className="bg-rose-500 text-white px-8 py-3 rounded-full hover:bg-rose-600 disabled:bg-slate-400 font-semibold">{isSubmitting ? 'Menyimpan...' : (editingPost ? 'Perbarui Postingan' : 'Publikasikan')}</button>
                {editingPost && <button type="button" onClick={resetForm} className="bg-slate-200 text-slate-800 px-6 py-3 rounded-full font-semibold">Batal</button>}
              </div>
              {statusMessage && <p className="text-sm text-slate-600 mt-2">{statusMessage}</p>}
            </form>
          </div>

          {/* Kolom Daftar Postingan */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-serif text-rose-700 mb-6 border-b pb-4">Daftar Postingan</h2>
            {loading ? <p>Memuat...</p> : (
              <ul className="space-y-3">
                {posts.map(post => (
                  <li key={post.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg hover:bg-rose-50 transition-colors">
                    <div>
                      <span className="font-medium text-slate-800">{post.title}</span>
                      <p className="text-xs text-slate-500">Dipublikasikan: {new Date(post.published_at).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div className="space-x-3 mt-2 sm:mt-0 flex-shrink-0">
                      <button onClick={() => handleEdit(post)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                      <button onClick={() => handleDeletePost(post)} className="text-sm font-semibold text-red-600 hover:text-red-800">Hapus</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* --- BAGIAN BARU: DAFTAR PESAN --- */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-serif text-rose-700 mb-6 border-b pb-4">Pesan Masuk</h2>
          {loading ? <p>Memuat pesan...</p> : (
            <div className="space-y-4">
              {messages.length > 0 ? messages.map(msg => (
                <div key={msg.id} className={`p-4 rounded-lg border ${msg.is_read ? 'bg-white' : 'bg-rose-50 border-rose-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-semibold text-slate-800">{msg.name} <span className="font-normal text-slate-500">&lt;{msg.email}&gt;</span></p>
                      <p className="text-xs text-slate-500">Diterima: {new Date(msg.created_at).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button onClick={() => handleToggleRead(msg)} className="text-sm font-semibold text-green-600 hover:text-green-800">
                        {msg.is_read ? 'Tandai Belum Dibaca' : 'Tandai Sudah Dibaca'}
                      </button>
                      <button onClick={() => handleDeleteMessage(msg.id)} className="text-sm font-semibold text-red-600 hover:text-red-800">Hapus</button>
                    </div>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{msg.message}</p>
                </div>
              )) : <p className="text-slate-500 text-center">Tidak ada pesan masuk.</p>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;