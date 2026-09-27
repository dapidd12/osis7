const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLayout.tsx', 'utf8');

const target = `        <nav className="flex-1 p-4 space-y-2 mt-16 md:mt-0">
          <Link
            to="/pengurus/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              location.pathname.includes('/pengurus/dashboard') 
                ? "bg-sky-600 text-white shadow-sm" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Ke Papan Publik</span>
          </Link>
        </nav>`;

const replacement = `        <nav className="flex-1 p-4 space-y-2 mt-16 md:mt-0">
          <Link
            to="/pengurus/dashboard?tab=aspirasi"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              location.pathname.includes('/pengurus/dashboard') && (!location.search || location.search.includes('tab=aspirasi'))
                ? "bg-sky-600 text-white shadow-sm" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Aspirasi Masuk</span>
          </Link>
          <Link
            to="/pengurus/dashboard?tab=mading"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              location.search.includes('tab=mading')
                ? "bg-sky-600 text-white shadow-sm" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Kelola Mading</span>
          </Link>
          <Link
            to="/pengurus/dashboard?tab=ai"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              location.search.includes('tab=ai')
                ? "bg-sky-600 text-white shadow-sm" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Pengaturan AI</span>
          </Link>
          <div className="h-4"></div>
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Ke Papan Publik</span>
          </Link>
        </nav>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminLayout.tsx', code);
