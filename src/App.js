import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import CartographiePage from "./pages/cartographie";
import MeteoSantePage from "./pages/meteosante";

import "leaflet/dist/leaflet.css";


import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="pt-20 flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cartographie" element={<CartographiePage />} />
          <Route path="/meteosante" element={<MeteoSantePage />} />

        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
