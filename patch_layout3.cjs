const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLayout.tsx', 'utf8');

// Make the header z-50
code = code.replace(
  '<div className="flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-40 shadow-sm">',
  '<div className="flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-50 shadow-sm">'
);

// Add top margin to sidebar so it doesn't overlap the header
code = code.replace(
  '"w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out"',
  '"w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 top-[72px] z-40 transition-transform duration-300 ease-in-out"'
);

// We can remove the redundant logo inside the sidebar now, since the top header is always visible
code = code.replace(
  '<div className="p-6 flex items-center gap-3 border-b border-slate-800 mt-12">',
  '<div className="p-6 hidden items-center gap-3 border-b border-slate-800">'
);

// Also remove the mt-16 on the nav since the top margin is on the sidebar container itself
code = code.replace(
  '<nav className="flex-1 p-4 space-y-2 mt-16 md:mt-0">',
  '<nav className="flex-1 p-4 space-y-2">'
);

fs.writeFileSync('src/components/AdminLayout.tsx', code);
