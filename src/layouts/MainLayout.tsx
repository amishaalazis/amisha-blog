import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';

const MainLayout = () => {
  return (
    <div className="bg-rose-50 dark:bg-dark-bg text-slate-700 dark:text-dark-text min-h-screen font-sans">
      <Header />
      
      <div className="h-5" /> 
      
      <main className="container mx-auto px-4 sm:px-6 pb-12">
        <Outlet />
      </main>
      
      <footer className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm border-t dark:border-slate-800 mt-12">
        <p>&copy; {new Date().getFullYear()} Amishaalazis. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;