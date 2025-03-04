import Header from "./components/header";
import Nav from "./components/navbar";
import Home from "./pages/home";
import Footer from "./components/footer";
import CreateShop from "./pages/createShop";
import CreateForm from "./pages/createForm";
import ProductDetails from "./pages/productDetails";
import Settings from "./pages/settings";
import Login from "./pages/login";
import { BrowserRouter as Router, Route, Routes } from "react-router";
import SignUp from "./pages/signUp";
import PurchaseAds from "./pages/purchaseAds";
import Step2 from "./components/ads/step2";
import Step3 from "./components/ads/step3";
import Chat from './components/Chat/Chat'

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/createShop" element={<CreateShop />} />
        <Route path="/createForm" element={<CreateForm />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/purchaseAds" element={<PurchaseAds />} />
        <Route path="/step2" element={<Step2 />} />
        <Route path="/step3" element={<Step3 />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
      <Nav />
      <Footer />
    </Router>
  );
}
