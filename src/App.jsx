import Header from "./components/header";
import Nav from "./components/navbar";
import Home from "./pages/home";
import CreateShop from "./pages/createShop";
import { BrowserRouter as Router, Route, Routes } from "react-router";


export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/createShop" element={<CreateShop />} />
      </Routes>
      <Nav />
    </Router>
  );
}
