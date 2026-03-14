import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, fetchCategories } from "../redux/slices/productSlice";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { FiFilter, FiX } from "react-icons/fi";

const fabricTypes = [
  "Cotton", "Silk", "Polyester", "Linen", "Wool", "Denim",
  "Chiffon", "Satin", "Velvet", "Georgette", "Crepe",
];

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, totalProducts, resultPerPage, loading, categories } =
    useSelector((state) => state.products);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    category: searchParams.get("category") || "",
    fabricType: searchParams.get("fabricType") || "",
    sort: searchParams.get("sort") || "-createdAt",
    "price[gte]": searchParams.get("price[gte]") || "",
    "price[lte]": searchParams.get("price[lte]") || "",
    page: searchParams.get("page") || 1,
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = Object.entries(filters)
      .filter(([_, v]) => v !== "" && v !== null)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    dispatch(fetchProducts(params));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      category: "",
      fabricType: "",
      sort: "-createdAt",
      "price[gte]": "",
      "price[lte]": "",
      page: 1,
    });
    setSearchParams({});
  };

  const totalPages = Math.ceil(totalProducts / resultPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Products</h1>
          <p className="text-sm text-gray-500">{totalProducts} products found</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          <FiFilter /> <span>Filters</span>
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside
          className={`${
            showFilters ? "fixed inset-0 z-50 bg-white p-6 overflow-auto" : "hidden"
          } md:block md:static md:w-64 flex-shrink-0`}
        >
          <div className="flex items-center justify-between mb-4 md:hidden">
            <h3 className="text-lg font-bold">Filters</h3>
            <button onClick={() => setShowFilters(false)}>
              <FiX size={24} />
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fabric Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fabric Type
            </label>
            <select
              value={filters.fabricType}
              onChange={(e) => handleFilterChange("fabricType", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Types</option>
              {fabricTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price Range
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters["price[gte]"]}
                onChange={(e) => handleFilterChange("price[gte]", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters["price[lte]"]}
                onChange={(e) => handleFilterChange("price[lte]", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="-createdAt">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-ratings">Top Rated</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="w-full py-2 text-sm text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
          >
            Clear All Filters
          </button>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-indigo-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-10 space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handleFilterChange("page", page)}
                        className={`w-10 h-10 rounded-lg font-medium transition ${
                          Number(filters.page) === page
                            ? "bg-indigo-600 text-white"
                            : "bg-white border text-gray-600 hover:bg-indigo-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
