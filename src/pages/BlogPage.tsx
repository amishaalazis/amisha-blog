import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

// Definisikan tipe data baru
interface Category {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  categories: { name: string } | null; // Kategori sekarang adalah objek
}

const createExcerpt = (htmlContent: string, maxLength: number = 100) => {
  if (!htmlContent) return "";
  const plainText = htmlContent.replace(/<[^>]+>/g, "");
  if (plainText.length <= maxLength) return plainText;
  return plainText.substr(0, plainText.lastIndexOf(" ", maxLength)) + "...";
};

const BlogPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">(
    "all"
  ); // State untuk filter kategori
  const postsPerPage = 6;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    // Fungsi untuk mengambil kategori
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name");
      if (error) console.error("Error fetching categories:", error);
      else setCategories(data || []);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      const from = (currentPage - 1) * postsPerPage;
      const to = from + postsPerPage - 1;

      // PERUBAHAN PENTING: Ambil data post sekaligus nama kategorinya (join)
      let query = supabase
        .from("posts")
        .select("*, categories (name)", { count: "exact" });

      if (debouncedSearchTerm) {
        query = query.or(
          `title.ilike.%${debouncedSearchTerm}%,content.ilike.%${debouncedSearchTerm}%`
        );
      }

      // Tambahkan filter berdasarkan kategori yang dipilih
      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      query = query.order("published_at", { ascending: sortOrder === "asc" });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching posts:", error);
        setError("Failed to load post.");
      } else {
        setPosts(data as Post[]);
        setTotalPosts(count || 0);
      }
      setLoading(false);
    };

    fetchPosts();
    window.scrollTo(0, 0);
  }, [currentPage, sortOrder, debouncedSearchTerm, selectedCategory]); // Tambahkan selectedCategory sebagai dependensi

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const renderContent = () => {
    if (loading)
      return <p className="text-center text-slate-500">Loading for Post...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (posts.length === 0)
      return <p className="text-center text-slate-500">No posts found.</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div
            key={post.id}
            className="card bg-white rounded-xl overflow-hidden shadow-lg flex flex-col"
          >
            <Link to={`/blog/${post.slug}`}>
              <img
                src={
                  post.image_url ||
                  `https://placehold.co/600x400/ffe4e6/be123c?text=Image`
                }
                alt={post.title}
                className="w-full h-48 object-cover"
              />
            </Link>
            <div className="p-6 flex flex-col flex-grow">
              {/* Tampilkan nama kategori di sini */}
              {post.categories && (
                <span className="text-xs font-semibold bg-rose-100 text-rose-600 px-3 py-1 rounded-full self-start mb-3">
                  {post.categories.name}
                </span>
              )}
              <h3 className="font-bold text-xl text-slate-800 mb-2 font-serif">
                <Link to={`/blog/${post.slug}`} className="hover:text-rose-600">
                  {post.title}
                </Link>
              </h3>
              <p className="text-slate-600 text-sm mb-4 flex-grow">
                {createExcerpt(post.content)}
              </p>
              <a
                href={`/blog/${post.slug}`}
                className="text-rose-500 hover:text-rose-700 font-semibold mt-auto self-start"
              >
                Read More &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section>
      <h2 className="text-3xl sm:text-4xl font-bold text-center font-serif text-rose-800 mb-6">
        My Latest Posts
      </h2>

      {/* --- BAGIAN BARU: FILTER KATEGORI --- */}
      <div className="mb-8 flex justify-center flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            selectedCategory === "all"
              ? "bg-rose-500 text-white"
              : "bg-white text-slate-700 hover:bg-rose-100"
          }`}
        >
          All Post
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              selectedCategory === cat.id
                ? "bg-rose-500 text-white"
                : "bg-white text-slate-700 hover:bg-rose-100"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="mb-12 p-4 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search for titles or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-2/3 p-2 border border-slate-300 rounded-md"
        />

        <div className="flex items-center gap-2 w-full sm:w-1/3 justify-end">
          <label
            htmlFor="sortOrder"
            className="text-sm font-medium text-slate-600 whitespace-nowrap"
          >
            Sort:
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
            className="w-full p-2 border border-slate-300 rounded-md"
          >
            <option value="desc">Latest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>
      </div>

      {renderContent()}

      {/* Komponen Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white rounded-md shadow disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-slate-600">
            Page {currentPage} From {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white rounded-md shadow disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default BlogPage;
