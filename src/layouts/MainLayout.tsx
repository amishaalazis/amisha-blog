import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const MainLayout = () => {
  return (
    <div className="bg-rose-50 min-h-screen font-sans">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-12">
        <Outlet />
      </main>
      <footer className="text-center py-8 text-slate-500 text-sm border-t mt-12">
        <p>&copy; {new Date().getFullYear()} Amishaalazis. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;