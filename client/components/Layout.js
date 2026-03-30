import { Toaster } from "react-hot-toast";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="relative overflow-hidden">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}
