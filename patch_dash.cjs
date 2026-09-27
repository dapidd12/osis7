const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const target = `      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl max-w-lg">
        <button
          onClick={() => setActiveTab('aspirasi')}
          className={cn(
            "w-full py-2.5 text-sm font-bold rounded-lg transition-all",
            activeTab === 'aspirasi' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Aspirasi Masuk
        </button>
        <button
          onClick={() => setActiveTab('mading')}
          className={cn(
            "w-full py-2.5 text-sm font-bold rounded-lg transition-all",
            activeTab === 'mading' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Kelola Mading
        </button>
        <button
          onClick={() => {
            setActiveTab('ai');
            setAiPersonality(aiConfig.personality);
            setAiKnowledge(aiConfig.knowledge);
            setAiProviders(aiConfig.providers || []);
          }}
          className={cn(
            "w-full py-2.5 text-sm font-bold rounded-lg transition-all",
            activeTab === 'ai' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Pengaturan AI
        </button>
      </div>`;

code = code.replace(target, '');
fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
