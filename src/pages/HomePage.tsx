import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <section className="overflow-hidden py-8"> {/* Menambah padding vertikal */}
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        
        {/* Kolom Teks */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <span className="text-xl font-medium text-rose-500 font-sans">
            Hello, I'm
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-rose-800 leading-tight mt-1">
            Amisha Al Azis
          </h1>
          <p className="mt-4 text-slate-600 text-base sm:text-lg max-w-xl mx-auto md:mx-0">
            Welcome to my little world! Here, I share stories about  daily adventures that I want to express.
          </p>
          
          {/* Tombol Aksi */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <Link 
              to="/blog" 
              className="w-full sm:w-auto text-center bg-rose-800 text-white px-8 py-3 rounded-full hover:bg-rose-900 transition-colors font-semibold text-base sm:text-lg"
            >
              My Blog
            </Link>
            <Link 
              to="/contact" 
              className="w-full sm:w-auto text-center bg-rose-200 text-rose-800 px-8 py-3 rounded-full hover:bg-rose-300 transition-colors font-semibold text-base sm:text-lg"
            >
              Contact Me
            </Link>
          </div>

          {/* Tautan Media Sosial */}
          <div className="mt-12 text-center md:text-left">
            <p className="font-medium text-slate-600 mb-3">Find Me at:</p>
            <div className="flex items-center justify-center md:justify-start gap-5">
              <a href="https://instagram.com/amishaalazis" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-rose-500 text-2xl transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              {/* <a href="https://tiktok.com/@akunanda" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-rose-500 text-2xl transition-colors">
                <i className="fab fa-tiktok"></i>
              </a> */}
              <a href="https://linkedin.com/in/amishaalazis" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-rose-500 text-2xl transition-colors">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Kolom Gambar */}
        <div className="w-full md:w-1/2 mt-8 md:mt-0 relative">
          {/* Bentuk dekoratif di belakang gambar */}
          <div className="absolute -top-4 -right-4 w-full h-full bg-rose-200 rounded-xl transform rotate-3 transition-transform duration-500 hover:rotate-0"></div>
          
          <img 
            src="/img/amisha.jpeg" 
            alt="Foto Profil" 
            className="relative rounded-xl shadow-2xl w-full h-auto z-10" 
          />
        </div>

      </div>
    </section>
  );
};

export default HomePage;