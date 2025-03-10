import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import ProductCard from "../components/ProductCard";
import SearchProduct from "../components/SearchProduct";
import Pagination from "../components/Pagination";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

interface StockXProduct {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  availableSizes: string[];
  availability: string;
}

export default function AllProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromQuery = searchParams.get("page") || "1";

  const [currentPage, setCurrentPage] = useState(() => {
    const initialPage = parseInt(pageFromQuery, 10) || 1;
    return initialPage;
  });

  const [products, setProducts] = useState<StockXProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const productsPerPage = 20;

  const { t } = useTranslation('allProducts');
  const { userData } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const apiUrl = `${API_BASE_URL}/products`;

        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl, {
          headers
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[AllProducts] Error response:", errorText);
          throw new Error(`Failed to fetch products: ${errorText}`);
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("[AllProducts] Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setIsLoading(false);
        console.log("[AllProducts] useEffect -> end fetchProducts");
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {}, [currentPage]);

  const handlePageChange = (page: number) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);

    setSearchParams({ page: String(page) });
  };

  const handleSearch = (term: string) => {
    if (term === searchTerm) {
      return;
    }

    setSearchTerm(term);

    setCurrentPage(1);

    setSearchParams({ page: "1" });
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    // If user is admin, show all products
    if (userData?.role === 'admin') {
      return products;
    }
    // For regular users, just return all products for now
    // You can add user-specific filtering here in the future
    return products;
  }, [products, userData]);

  const filteredAndSearchedProducts = useMemo(() => {
    return filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredProducts, searchTerm]);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredAndSearchedProducts.slice(startIndex, startIndex + productsPerPage);
  }, [currentPage, filteredAndSearchedProducts]);

  const totalPages = Math.ceil(filteredAndSearchedProducts.length / productsPerPage);

  if (isLoading) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-red-600">
            <h2 className="text-xl font-bold mb-2">{t('error.title')}</h2>
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-center">{t('title')}</h1>

        <SearchProduct onSearch={handleSearch} />

        {currentProducts.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            {searchTerm
              ? t('noProductsFound')
              : t('noProducts')}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 justify-between items-start w-full max-w-[1280px] mx-auto px-2">
            {currentProducts.map((product) => (
              <ProductCard
                key={product._id}
                _id={product._id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                size="normal"
                availableSizes={product.availableSizes}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      <Footer />
    </main>
  );
}
