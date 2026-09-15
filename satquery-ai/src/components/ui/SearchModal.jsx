import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Image as ImageIcon, Sparkles, ArrowRight } from 'lucide-react';
import { RECENT_ANALYSES, MOCK_IMAGES_GALLERY, MOCK_REPORTS } from '../../data/mockData';

export default function SearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredAnalyses = q ? RECENT_ANALYSES.filter(a => 
    a.query.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)
  ) : RECENT_ANALYSES.slice(0, 3);

  const filteredImages = q ? MOCK_IMAGES_GALLERY.filter(img =>
    img.filename.toLowerCase().includes(q) || img.modality.toLowerCase().includes(q)
  ) : MOCK_IMAGES_GALLERY.slice(0, 3);

  const filteredReports = q ? MOCK_REPORTS.filter(r =>
    r.name.toLowerCase().includes(q) || r.analysisType.toLowerCase().includes(q)
  ) : MOCK_REPORTS.slice(0, 2);

  const totalResults = filteredAnalyses.length + filteredImages.length + filteredReports.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-100 dark:border-white/10 gap-3">
          <Search className="w-5 h-5 text-gray-400 dark:text-teal-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search analyses, satellite scenes, reports, or queries..."
            className="flex-1 bg-transparent border-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-white/5 rounded border border-gray-200 dark:border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {totalResults === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs mt-1">Try searching for &lsquo;bitemporal&rsquo;, &lsquo;water&rsquo;, &lsquo;optical&rsquo; or &lsquo;SAR&rsquo;.</p>
            </div>
          ) : (
            <>
              {/* Analyses Category */}
              {filteredAnalyses.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                    Analyses & Queries
                  </div>
                  <div className="space-y-1">
                    {filteredAnalyses.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          onClose();
                          onNavigate('results');
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#151C25] text-left transition-colors group"
                      >
                        <div className="flex-1 pr-3">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 group-hover:text-teal-600 dark:group-hover:text-[#4FD1C5] transition-colors truncate">
                            {a.query}
                          </p>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {a.type} • {a.date} • {a.confidence}% Confidence
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Images Category */}
              {filteredImages.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    Satellite Rasters
                  </div>
                  <div className="space-y-1">
                    {filteredImages.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => {
                          onClose();
                          onNavigate('images');
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#151C25] text-left transition-colors group"
                      >
                        <div className="flex-1 pr-3">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 group-hover:text-teal-600 dark:group-hover:text-[#4FD1C5] truncate">
                            {img.filename}
                          </p>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {img.modality} • {img.sensor} • {img.size}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reports Category */}
              {filteredReports.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    Generated Reports
                  </div>
                  <div className="space-y-1">
                    {filteredReports.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          onClose();
                          onNavigate('reports');
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#151C25] text-left transition-colors group"
                      >
                        <div className="flex-1 pr-3">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 group-hover:text-teal-600 dark:group-hover:text-[#4FD1C5] truncate">
                            {r.name}
                          </p>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {r.analysisType} • {r.date}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#151C25]/50 flex items-center justify-between text-[11px] text-gray-400">
          <span>Tip: Use query keywords like &quot;urban&quot;, &quot;SAR&quot;, or &quot;Sentinel&quot;</span>
          <span>SatQuery v1.0 Prototype</span>
        </div>
      </div>
    </div>
  );
}
