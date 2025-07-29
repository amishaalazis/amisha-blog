const ContactPage = () => {
  return (
    <section>
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold font-serif text-rose-800">Get In Touch</h2>
        <p className="mt-2 text-slate-600 max-w-2xl mx-auto">Punya pertanyaan atau ide kolaborasi? Jangan ragu untuk menghubungiku!</p>
      </div>
      <div className="mt-12 max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <form>
          {/* ... Isi form kontak di sini ... */}
          <p className="text-center">Formulir kontak akan segera hadir.</p>
        </form>
      </div>
    </section>
  );
};
export default ContactPage;