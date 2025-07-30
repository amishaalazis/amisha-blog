import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <section className="text-center py-20">
      <h1 className="text-4xl sm:text-5xl font-bold font-serif text-rose-800 leading-tight">
        🚧 About Me 🚧
      </h1>
      <p className="mt-4 text-slate-600 text-lg max-w-xl mx-auto">
      This page is currently under construction. I am preparing an interesting story about myself. Please come back later!
      </p>
      <Link 
        to="/" 
        className="inline-block mt-8 bg-rose-500 text-white px-8 py-3 rounded-full hover:bg-rose-600 transition-colors font-semibold text-base sm:text-lg"
      >
       Back to Home
      </Link>
    </section>
  );
};

export default AboutPage;