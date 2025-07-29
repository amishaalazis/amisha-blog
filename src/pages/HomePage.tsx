import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <section>
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-rose-800 leading-tight">Hello, I'm Amisha Al Azis</h1>
          <p className="mt-4 text-slate-600 text-base sm:text-lg">Welcome to my little world! Here, I share stories that I want to express.</p>
          <Link to="/contact" className="inline-block mt-8 bg-rose-800 text-white px-8 py-3 rounded-full hover:bg-rose-900 transition-colors font-semibold text-base sm:text-lg">Contact Me</Link>
        </div>
        <div className="w-full md:w-1/2 mt-8 md:mt-0">
          <img src="/img/amisha.jpeg" alt="Foto Profil" className="rounded-xl shadow-2xl w-full h-auto" />
        </div>
      </div>
    </section>
  );
};
export default HomePage;