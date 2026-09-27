const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLayout.tsx', 'utf8');

// Replace "md:hidden" on the top header with "flex"
code = code.replace(
  '<div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-40">',
  '<div className="flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-40 shadow-sm">'
);

// Make the backdrop appear on desktop too if menu is open
code = code.replace(
  'className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"',
  'className="fixed inset-0 bg-slate-900/50 z-40 transition-opacity"'
);

// Remove md:translate-x-0 from the sidebar so it stays hidden on desktop unless opened
code = code.replace(
  'isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"',
  'isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"'
).replace(
  '"w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:translate-x-0"',
  '"w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out"'
);

// Remove md:ml-64 from main content
code = code.replace(
  '<div className="flex-1 md:ml-64 w-full min-h-screen p-4 sm:p-8">',
  '<div className="flex-1 w-full min-h-screen p-4 sm:p-8 pt-6">'
);

// Hide the static logo inside the sidebar since it's already in the top bar now
code = code.replace(
  '<div className="p-6 hidden md:flex items-center gap-3 border-b border-slate-800">',
  '<div className="p-6 flex items-center gap-3 border-b border-slate-800 mt-12">'
);

fs.writeFileSync('src/components/AdminLayout.tsx', code);
