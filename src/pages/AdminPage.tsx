import { useEffect, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


// --- Tipe Data ---
interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  image_url: string | null;
  published_at: string;
  category_id: number;
  categories: { name: string } | null;
}
interface Category { id: number; name: string; slug: string; }
interface Message { id: number; name: string; email: string; message: string; created_at: string; is_read: boolean; }

// --- Komponen Notifikasi Toast ---
const Toast = ({ message, onEnd }: { message: string, onEnd: () => void }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onEnd(), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onEnd]);

  if (!message) return null;
  
  return (
    <div className="fixed bottom-5 right-5 bg-rose-800 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce">
      <i className="fas fa-check-circle mr-2"></i>
      {message}
    </div>
  );
};

// --- Komponen Modal Konfirmasi Hapus ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
        <h2 className="text-2xl font-serif text-slate-800 mb-2">{title}</h2>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button onClick={onClose} className="bg-slate-200 px-8 py-2 rounded-full font-semibold">Cancel</button>
          <button onClick={onConfirm} className="bg-red-500 text-white px-8 py-2 rounded-full font-semibold">Yes, Delete</button>
        </div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  // --- State untuk Modal & Form ---
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', published_at: '', category_id: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  
  // --- State untuk Fitur Lainnya ---
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'post' | 'category' | 'message', id: any } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | number>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 10;

  // --- Efek & Pengambilan Data ---
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  useEffect(() => {
    const getSessionAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login');
      else {
        setSession(session);
        fetchAdminData();
      }
    };
    getSessionAndData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login'); else setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => { if (session) fetchPosts(); }, [currentPage, debouncedSearchTerm, filterCategory, session]);

  const showToast = (message: string) => setStatusMessage(message);

  const fetchPosts = async () => {
    setLoading(true);
    const from = (currentPage - 1) * postsPerPage;
    const to = from + postsPerPage - 1;

    let query = supabase.from('posts').select('*, categories(name)', { count: 'exact' });
    if (debouncedSearchTerm) query = query.ilike('title', `%${debouncedSearchTerm}%`);
    if (filterCategory !== 'all') query = query.eq('category_id', filterCategory);
    
    const { data, error, count } = await query.order('published_at', { ascending: false }).range(from, to);

    if (error) console.error('Error fetching posts:', error);
    else {
      setPosts(data as Post[] || []);
      setTotalPosts(count || 0);
    }
    setLoading(false);
  };
  
  const fetchAdminData = async () => {
    setLoading(true);
    const postsPromise = supabase.from('posts').select('*, categories(name)', { count: 'exact' }).order('published_at', { ascending: false }).range(0, postsPerPage - 1);
    const categoriesPromise = supabase.from('categories').select('*').order('name');
    const messagesPromise = supabase.from('messages').select('*').order('created_at', { ascending: false });

    const [postsResult, categoriesResult, messagesResult] = await Promise.all([postsPromise, categoriesPromise, messagesPromise]);

    if (postsResult.error) console.error('Error fetching posts:', postsResult.error);
    else {
      setPosts(postsResult.data as Post[] || []);
      setTotalPosts(postsResult.count || 0);
    }

    if (categoriesResult.error) console.error('Error fetching categories:', categoriesResult.error);
    else setCategories(categoriesResult.data || []);
      
    if (messagesResult.error) console.error('Error fetching messages:', messagesResult.error);
    else setMessages(messagesResult.data || []);

    setLoading(false);
  };
  
  const createSlug = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleContentChange = (content: string) => setFormData(prev => ({ ...prev, content }));

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const openPostModal = (post: Partial<Post> | null = null) => {
    setEditingPost(post);
    if (post && post.id) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        published_at: post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : '',
        category_id: post.category_id ? post.category_id.toString() : '',
      });
      setImagePreview(post.image_url || null);
    } else {
      setFormData({ title: '', content: '', published_at: '', category_id: '' });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsPostModalOpen(true);
  };
  
  const handleSubmitPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!session || !formData.category_id) {
      alert('Please select a category first.');
      return;
    }
    setIsSubmitting(true);
    let imageUrl = editingPost?.image_url || null;

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage.from('post-images').upload(fileName, imageFile);
      if (uploadError) {
        showToast('Failed to upload image.');
        console.error('Error uploading image:', uploadError);
        setIsSubmitting(false);
        return;
      }
      const { data } = supabase.storage.from('post-images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const postData = {
      title: formData.title,
      content: formData.content,
      slug: createSlug(formData.title),
      image_url: imageUrl,
      category_id: parseInt(formData.category_id),
      published_at: formData.published_at ? new Date(formData.published_at).toISOString() : new Date().toISOString(),
    };

    const { error } = editingPost?.id
      ? await supabase.from('posts').update(postData).eq('id', editingPost.id)
      : await supabase.from('posts').insert([postData]);

    if (error) {
        showToast('Failed to save post.');
        console.error('Error saving post:', error);
    } else {
        showToast(editingPost?.id ? 'Post successfully updated!' : 'Post successfully created!');
        setIsPostModalOpen(false);
        fetchPosts();
    }
    setIsSubmitting(false);
  };

  const handleDeletePost = (post: Post) => setDeleteTarget({ type: 'post', id: post });

  const openCategoryModal = (category: Category | null = null) => {
      setEditingCategory(category);
      setCategoryName(category ? category.name : '');
      setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;

    const slug = createSlug(categoryName);
    const { error } = editingCategory
      ? await supabase.from('categories').update({ name: categoryName, slug }).eq('id', editingCategory.id)
      : await supabase.from('categories').insert([{ name: categoryName, slug }]);
    
    if (error) showToast('Failed to save category.');
    else showToast(editingCategory ? 'Category successfully updated!' : 'Category successfully created!');
    
    setIsCategoryModalOpen(false);
    fetchAdminData();
  };
  
  const handleDeleteCategory = (id: number) => setDeleteTarget({ type: 'category', id });

  const handleToggleRead = async (message: Message) => {
    await supabase.from('messages').update({ is_read: !message.is_read }).eq('id', message.id);
    fetchAdminData();
  };

  const handleDeleteMessage = (id: number) => setDeleteTarget({ type: 'message', id });
  
  const executeDelete = async () => {
    if (!deleteTarget) return;

    let error = null;
    let type = deleteTarget.type;

    if (type === 'post') {
      const postToDelete = deleteTarget.id as Post;
      if (postToDelete.image_url) {
        const fileName = postToDelete.image_url.split('/').pop();
        if (fileName) await supabase.storage.from('post-images').remove([fileName]);
      }
      ({ error } = await supabase.from('posts').delete().eq('id', postToDelete.id));
    } else if (type === 'category') {
      ({ error } = await supabase.from('categories').delete().eq('id', deleteTarget.id));
    } else if (type === 'message') {
      ({ error } = await supabase.from('messages').delete().eq('id', deleteTarget.id));
    }
    
    if (error) {
      showToast(`Failed Delete ${type}.`);
      console.error(`Error deleting ${type}:`, error);
    } else {
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} Succesefully Deleted.`);
    }

    fetchAdminData();
    setDeleteTarget(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    navigate('/');
  };

  if (!session) return null;

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return (
    <div className="bg-slate-100 min-h-screen font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold font-serif text-rose-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-sm text-slate-600 hover:text-rose-500">Back to Site</Link>
            <button onClick={handleLogout} className="bg-rose-500 text-white px-5 py-2 rounded-full text-sm font-medium">Logout</button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-serif text-rose-700">Post Management</h2>
            <button onClick={() => openPostModal()} className="bg-rose-500 text-white px-5 py-2 rounded-full font-semibold text-sm w-full md:w-auto flex items-center justify-center gap-2"><i className="fas fa-plus"></i>Create New Post</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Search by title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-md" />
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="w-full p-2 border rounded-md">
              <option value="all">All Category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Title</th>
                  <th scope="col" className="px-6 py-3">Category</th>
                  <th scope="col" className="px-6 py-3">Publication Date</th>
                  <th scope="col" className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr><td colSpan={4} className="text-center p-4">Loading...</td></tr>
                ) : posts.map(post => (
                  <tr key={post.id} className="bg-white border-b hover:bg-slate-50">
                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{post.title}</th>
                    <td className="px-6 py-4">{post.categories?.name || '-'}</td>
                    <td className="px-6 py-4">{new Date(post.published_at).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => openPostModal(post)} className="font-medium text-blue-600"><i className="fas fa-pencil-alt"></i></button>
                      <button onClick={() => handleDeletePost(post)} className="font-medium text-red-600"><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-slate-600">Total {totalPosts} post</span>
              <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50">‹</button>
                  <span className="px-3 py-1 text-sm">Page {currentPage}</span>
                  <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50">›</button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-serif text-rose-700 flex items-center gap-3"><i className="fas fa-tags"></i>Management Category</h2>
                <button onClick={() => openCategoryModal()} className="bg-rose-100 text-rose-800 px-4 py-2 rounded-full text-xs font-semibold">Add</button>
              </div>
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {categories.map(cat => (
                  <li key={cat.id} className="flex justify-between items-center p-2 hover:bg-rose-50 rounded-md">
                    <span className="text-slate-700 text-sm">{cat.name}</span>
                    <div className="space-x-2">
                        <button onClick={() => openCategoryModal(cat)} className="text-xs text-blue-500"><i className="fas fa-pencil-alt"></i></button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-xs text-red-500"><i className="fas fa-trash"></i></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-serif text-rose-700 mb-6 border-b pb-4 flex items-center gap-3"><i className="fas fa-envelope"></i>Message</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {messages.length > 0 ? messages.map(msg => (
                  <div key={msg.id} className={`p-4 rounded-lg border ${msg.is_read ? '' : 'bg-rose-50'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-slate-800 text-sm">{msg.name}</p>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button onClick={() => handleToggleRead(msg)} className="text-xs font-semibold text-green-600" title={msg.is_read ? 'Mark as Unread' : 'Mark as Read'}><i className={`fas ${msg.is_read ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                        <button onClick={() => handleDeleteMessage(msg.id)} className="text-xs font-semibold text-red-600" title="Hapus Pesan"><i className="fas fa-trash"></i></button>
                      </div>
                    </div>
                     <p className="text-xs text-slate-500 mb-2">{new Date(msg.created_at).toLocaleString('id-ID')}</p>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                )) : <p className="text-center text-slate-500">No messages received.</p>}
              </div>
            </div>
        </div>
      </main>

      {isPostModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
              <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b">
                      <h2 className="text-2xl font-serif text-rose-700">{editingPost?.id ? 'Edit Post' : 'Create New Post'}</h2>
                      <button onClick={() => setIsPostModalOpen(false)} className="text-2xl text-slate-500 hover:text-slate-800">&times;</button>
                  </div>
                  <form onSubmit={handleSubmitPost} className="space-y-4">
                      <div>
                        <label htmlFor="modal-title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input id="modal-title" name="title" value={formData.title} onChange={handleInputChange} required className="w-full p-3 border rounded-lg" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label htmlFor="modal-category_id" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                              <select id="modal-category_id" name="category_id" value={formData.category_id} onChange={handleInputChange} required className="w-full p-3 border rounded-lg">
                              <option value="" disabled>Choose Category</option>
                              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                              </select>
                          </div>
                          <div>
                              <label htmlFor="modal-published_at" className="block text-sm font-medium text-slate-700 mb-1">Publish Date</label>
                              <input id="modal-published_at" name="published_at" type="date" value={formData.published_at} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                          </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                        {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-2" />}
                        <input type="file" onChange={handleImageChange} accept="image/*" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                          <ReactQuill theme="snow" value={formData.content} onChange={handleContentChange} className="bg-white" />
                      </div>
                      <div className="flex justify-end gap-4 pt-4 border-t">
                          <button type="button" onClick={() => setIsPostModalOpen(false)} className="bg-slate-200 px-6 py-2 rounded-full font-semibold">Cancel</button>
                          <button type="submit" disabled={isSubmitting} className="bg-rose-500 text-white px-6 py-2 rounded-full font-semibold">{isSubmitting ? 'Saving....' : 'Save'}</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
      
      {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
              <h2 className="text-2xl font-serif mb-4">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <form onSubmit={handleCategorySubmit}>
                <label htmlFor="categoryName" className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                <input id="categoryName" type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} className="w-full p-2 border rounded-md mb-4" required />
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="bg-slate-200 px-6 py-2 rounded-full font-semibold">Cancel</button>
                  <button type="submit" className="bg-rose-500 text-white px-6 py-2 rounded-full font-semibold">Save</button>
                </div>
              </form>
            </div>
          </div>
      )}
      
      <ConfirmModal 
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        title="Konfirmasi Penghapusan"
        message={`Are you sure ${deleteTarget?.type} this? This action cannot be canceled..`}
      />
      
    <Toast message={statusMessage} onEnd={() => setStatusMessage('')} />
  </div>
  );
};

export default AdminPage;

