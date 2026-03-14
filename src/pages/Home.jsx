import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFeaturedProducts,
  fetchCategories,
} from "../redux/slices/productSlice";
import ProductCard from "../components/ProductCard";
import { FiTruck, FiShield, FiRefreshCw, FiHeadphones } from "react-icons/fi";

const Home = () => {
  const dispatch = useDispatch();
  const { featuredProducts, categories } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-800 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Premium Textiles
              <br />
              <span className="text-indigo-300">Delivered to Your Door</span>
            </h1>
            <p className="text-lg text-indigo-200 mb-8 leading-relaxed">
              Discover our curated collection of finest fabrics — from luxurious
              silks to breathable cottons. Quality textiles for every occasion.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="bg-white text-indigo-800 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-100 transition"
              >
                Shop Now
              </Link>
              <Link
                to="/products?isFeatured=true"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Featured Collection
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Features Strip */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FiTruck, text: "Free Shipping", sub: "On orders above ₹999" },
              { icon: FiShield, text: "Secure Payment", sub: "100% secure checkout" },
              { icon: FiRefreshCw, text: "Easy Returns", sub: "7-day return policy" },
              { icon: FiHeadphones, text: "24/7 Support", sub: "Dedicated help center" },
            ].map((feat, i) => (
              <div key={i} className="flex items-center space-x-3">
                <feat.icon className="text-indigo-600 flex-shrink-0" size={28} />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{feat.text}</p>
                  <p className="text-xs text-gray-500">{feat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Shop by Category</h2>
          <p className="text-gray-500 mt-2">Browse our wide range of textile categories</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat._id}`}
              className="group bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition border border-gray-100"
            >
              <div className="w-16 h-16 mx-auto mb-3 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition">
                <span className="text-2xl font-bold text-indigo-600">
                  {cat.name.charAt(0)}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">{cat.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Featured Products</h2>
              <p className="text-gray-500 mt-1">Handpicked selections just for you</p>
            </div>
            <Link
              to="/products"
              className="text-indigo-600 font-medium hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Bulk Orders?</h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto">
            We offer special pricing for wholesale and bulk orders.
            Contact us for custom fabric requirements and competitive rates.
          </p>
          <Link
            to="/products"
            className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-100 transition"
          >
            Request a Quote
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
