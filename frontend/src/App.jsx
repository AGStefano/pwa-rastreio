import { Routes, Route } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import InstallPwaBanner from "./components/InstallPwaBanner";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/pedido/:query" element={<OrderDetailPage />} />
      </Routes>
      <InstallPwaBanner />
    </>
  );
}
