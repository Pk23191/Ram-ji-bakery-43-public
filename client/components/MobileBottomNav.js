import Link from "next/link";
import { Home, Grid, ShoppingCart, User } from "lucide-react";

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-lg border-t border-caramel/10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-50">
      <div className="flex items-center justify-around py-2 px-2">
        <Link href="/" className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-mocha/70 active:text-cocoa">
          <Home size={20} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/menu" className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-mocha/70 active:text-cocoa">
          <Grid size={20} />
          <span className="text-[10px] font-medium">Menu</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-mocha/70 active:text-cocoa">
          <ShoppingCart size={20} />
          <span className="text-[10px] font-medium">Cart</span>
        </Link>
        <Link href="/account" className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-mocha/70 active:text-cocoa">
          <User size={20} />
          <span className="text-[10px] font-medium">Account</span>
        </Link>
      </div>
    </nav>
  );
}
