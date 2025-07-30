// import { useEffect, useState } from "react";
// import { createClient } from "@supabase/supabase-js";
// const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
// function App() {
//   const [instruments, setInstruments] = useState<any[]|null>([]);
//   useEffect(() => {
//     getInstruments();
//   }, []);
//   async function getInstruments() {
//     const { data } = await supabase.from("posts").select(); 
    
//     setInstruments(data);
//     console.log({data});
//   }
//   return (
//     <ul>
//       {instruments?.map((instrument) => (
//         <li key={instrument.name}>{instrument.name}</li>
//       ))}
//     </ul>
//   );
// }
// export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import SinglePostPage from './pages/SinglePostPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} /> {/* <-- Tambahkan rute ini */}

          <Route path="/Blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<SinglePostPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;