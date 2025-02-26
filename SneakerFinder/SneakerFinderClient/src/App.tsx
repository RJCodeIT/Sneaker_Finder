import { Routes, Route } from "react-router-dom";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Brand from "./routes/Brand";
import Product from "./routes/Product";
import StyleAdvisor from "./routes/StyleAdvisor";
import Cart from "./routes/Cart";
import Orders from "./routes/Orders";
import Settings from "./routes/Settings";
import AllBrands from "./routes/AllBrands";
import AllProducts from "./routes/AllProducts";
import PrivacyPolicy from "./routes/PrivacyPolicy";
import Contact from "./routes/Contact";
import Checkout from "./routes/Checkout";
import OrderConfirmation from "./routes/OrderConfirmation";
import CheckoutSuccess from "./routes/CheckoutSuccess";
import AdminOrders from "./routes/AdminOrders";
import AdminRoute from "./components/AdminRoute";
import AddProduct from "./routes/AddProduct";
import EditProduct from "./routes/EditProduct";
import ManageProducts from "./routes/ManageProducts";
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/sneakerFinder" element={<Home />} />
        <Route path="/sneakerFinder/auth/login" element={<Login />} />
        <Route path="/sneakerFinder/auth/register" element={<Register />} />
        <Route path="/sneakerFinder/privacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/sneakerFinder/brands" element={<AllBrands />} />
        <Route path="/sneakerFinder/:brandName/products" element={<Brand />} />
        <Route path="/sneakerFinder/product/:id" element={<Product />} />
        <Route path="/sneakerFinder/styleAdvisor" element={<StyleAdvisor />} />
        <Route path="/sneakerFinder/cart" element={<Cart />} />
        <Route path="/sneakerFinder/checkout" element={<Checkout />} />
        <Route path="/sneakerFinder/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/sneakerFinder/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/sneakerFinder/orders" element={<Orders />} />
        <Route path="/sneakerFinder/settings" element={<Settings />} />
        <Route path="/sneakerFinder/contact" element={<Contact />} />
        <Route path="/sneakerFinder/products" element={<AllProducts />} />
        
        {/* Admin Routes */}
        <Route path="/sneakerFinder/admin" element={<AdminRoute />}>
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="edit-product/:id" element={<EditProduct />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}
