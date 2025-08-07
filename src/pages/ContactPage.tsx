import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Pastikan Anda mengimpor supabase client

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState(''); // Untuk menampilkan pesan sukses atau error

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Mengirim...');

    // Kirim data ke tabel 'messages' di Supabase
    const { error } = await supabase
      .from('messages')
      .insert([
        { 
          name: formData.name, 
          email: formData.email, 
          message: formData.message 
        }
      ]);

    if (error) {
      console.error('Error sending message:', error);
      setStatus('Gagal mengirim pesan. Silakan coba lagi.');
    } else {
      setStatus('Pesan Anda berhasil terkirim! Terima kasih.');
      setFormData({ name: '', email: '', message: '' }); // Kosongkan form
    }
  };

  return (
    <section>
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-rose-800">Get In Touch</h2>
        <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
        Have questions or ideas for collaboration? I would love to hear from you!
        </p>
      </div>
      
      <div className="mt-12 max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-slate-700 font-medium mb-2">Name</label>
              <input 
                type="text" 
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-rose-50 focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-slate-700 font-medium mb-2">Email</label>
              <input 
                type="email" 
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-rose-50 focus:ring-2 focus:ring-rose-400 outline-none"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-slate-700 font-medium mb-2">Your Message</label>
              <textarea 
                id="message" 
                name="message"
                rows={7}
                value={formData.message}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-rose-50 focus:ring-2 focus:ring-rose-400 outline-none"
              ></textarea>
            </div>
            <div className="text-right">
              <button 
                type="submit"
                className="bg-rose-500 text-white px-8 py-3 rounded-full hover:bg-rose-600 transition-colors font-semibold text-lg"
              >
                Sent Message
              </button>
            </div>
          </div>
        </form>
        {/* Tampilkan status pengiriman pesan */}
        {status && <p className="text-center mt-4 text-slate-600">{status}</p>}
      </div>

      <div className="mt-16 text-center">
        <p className="font-medium text-slate-600 mb-4">Or find me on social media:</p>
        <div className="flex items-center justify-center gap-6">
          <a href="https://instagram.com/amishaalazis" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-rose-500 text-3xl transition-colors">
            <i className="fab fa-instagram"></i>
          </a>
          {/* <a href="https://tiktok.com/@akunanda" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-rose-500 text-3xl transition-colors">
            <i className="fab fa-tiktok"></i>
          </a> */}
          <a href="https://linkedin.com/in/amishaalazis" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-rose-500 text-3xl transition-colors">
            <i className="fab fa-linkedin"></i>
          </a>
          <a href="https://open.spotify.com/user/31jorvbbqruydgszqi7egkkd4yca?si=7e3ab93124054227" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-rose-500 text-2xl transition-colors">
                <i className="fab fa-spotify"></i>
              </a>
        </div>
      </div>

    </section>
  );
};

export default ContactPage;