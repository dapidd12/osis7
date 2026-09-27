const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const target = `            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSavingAi(true);
              await updateAiConfig({
                personality: aiPersonality,
                knowledge: aiKnowledge
              });
              setIsSavingAi(false);
              alert("Pengaturan AI berhasil disimpan!");
            }} className="space-y-6 max-w-2xl">`;

const replacement = `            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSavingAi(true);
              await updateAiConfig({
                personality: aiPersonality,
                knowledge: aiKnowledge,
                providers: aiProviders
              });
              setIsSavingAi(false);
              alert("Pengaturan AI berhasil disimpan!");
            }} className="space-y-6 max-w-2xl">`;

code = code.replace(target, replacement);

const target2 = `              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingAi}
                  className="px-6 py-2.5 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-50"
                >
                  {isSavingAi ? "Menyimpan..." : "Simpan Pengaturan AI"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}`;

const replacement2 = `              <hr className="my-6 border-slate-200" />
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-bold text-slate-900">Konfigurasi API AI</label>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingProvider(!isAddingProvider)}
                    className="text-sm font-bold text-sky-600 hover:text-sky-700"
                  >
                    {isAddingProvider ? 'Batal Tambah' : '+ Tambah API Baru'}
                  </button>
                </div>
                
                {isAddingProvider && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 space-y-4">
                    <input type="text" placeholder="Nama Layanan (misal: Groq, OpenAI)" value={newProvider.name} onChange={e => setNewProvider({...newProvider, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                    <input type="text" placeholder="Base URL" value={newProvider.baseUrl} onChange={e => setNewProvider({...newProvider, baseUrl: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                    <input type="text" placeholder="API Key" value={newProvider.apiKey} onChange={e => setNewProvider({...newProvider, apiKey: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                    <input type="text" placeholder="Model (misal: openai/gpt-oss-20b)" value={newProvider.model} onChange={e => setNewProvider({...newProvider, model: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                    <button type="button" onClick={() => {
                      if (!newProvider.name || !newProvider.baseUrl || !newProvider.apiKey || !newProvider.model) {
                         alert('Harap isi semua kolom');
                         return;
                      }
                      setAiProviders([...aiProviders, { ...newProvider, id: Date.now().toString(), isActive: aiProviders.length === 0 }]);
                      setNewProvider({ name: '', baseUrl: '', apiKey: '', model: '' });
                      setIsAddingProvider(false);
                    }} className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800">
                      Simpan API
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {aiProviders.map(provider => (
                    <div key={provider.id} className={cn("p-4 rounded-xl border transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", provider.isActive ? "bg-sky-50 border-sky-200" : "bg-white border-slate-200")}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900">{provider.name}</h4>
                          {provider.isActive && <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-md font-bold">Aktif</span>}
                        </div>
                        <p className="text-xs text-slate-500 font-mono break-all">{provider.baseUrl}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">Model: {provider.model}</p>
                      </div>
                      <div className="flex gap-2">
                        {!provider.isActive && (
                          <button type="button" onClick={() => {
                            setAiProviders(aiProviders.map(p => ({ ...p, isActive: p.id === provider.id })));
                          }} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700">
                            Jadikan Aktif
                          </button>
                        )}
                        <button type="button" onClick={() => {
                          if (window.confirm('Hapus konfigurasi API ini?')) {
                            setAiProviders(aiProviders.filter(p => p.id !== provider.id));
                          }
                        }} className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                  {aiProviders.length === 0 && (
                     <p className="text-sm text-slate-500 text-center py-4">Belum ada konfigurasi API AI. Aplikasi akan menggunakan bawaan (default).</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingAi}
                  className="px-6 py-2.5 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-50"
                >
                  {isSavingAi ? "Menyimpan..." : "Simpan Pengaturan AI"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}`;

code = code.replace(target2, replacement2);
fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
