import { Toaster } from "react-hot-toast";
import Footer from "./Footer";
import Navbar from "./Navbar";
import MobileBottomNav from "./MobileBottomNav";

export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      <Toaster position="top-right" />
    </div>
  );
}
