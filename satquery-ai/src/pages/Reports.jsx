import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { MOCK_REPORTS } from '../data/mockData';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../hooks/useToast';
import confetti from 'canvas-confetti';

export default function Reports({ onNavigate }) {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReportModal, setActiveReportModal] = useState(null);
  const { toast } = useToast();

  const filteredReports = reports.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.analysisType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (report) => {
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    } catch (e) {}

    // Simulated download trigger
    toast.success(`Exporting "${report.name}". Saved to your downloads folder.`, 'Download Started');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-[#F5F7FA]">
            Generated Executive Reports
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Cryptographically signed remote sensing summaries and analytical dossiers.
          </p>
        </div>

        <button
          onClick={() => {
            toast.info('Run any analysis from the dashboard to generate new signed reports.', 'Report Generation');
            onNavigate('analysis');
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] text-xs font-bold shadow-md shadow-teal-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Report</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report titles or types..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
          />
        </div>
      </div>

      {/* Reports Table */}
      {filteredReports.length === 0 ? (
        <EmptyState
          title="No reports match your criteria"
          description="There are no generated documents matching your search term."
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 dark:bg-[#151C25]/70 border-b border-gray-100 dark:border-white/5 font-mono text-[11px] text-gray-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Report Name</th>
                  <th className="py-3 px-4">Analysis Modality</th>
                  <th className="py-3 px-4">Generated Date</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredReports.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="truncate max-w-xs">{r.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5]">
                        {r.analysisType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-400 text-[11px]">
                      {r.date}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">
                      {r.size}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-[#39D98A] font-medium text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Signed ({r.confidence})</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveReportModal(r)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-[#4FD1C5] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                          title="Preview Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(r)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-teal-500/10 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-[#4FD1C5] font-semibold text-xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      <Modal
        isOpen={!!activeReportModal}
        onClose={() => setActiveReportModal(null)}
        title={activeReportModal?.name || 'Executive Report'}
        subtitle={`Type: ${activeReportModal?.analysisType} • Date: ${activeReportModal?.date}`}
        maxWidth="max-w-xl"
      >
        {activeReportModal && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-gray-400">DOCUMENT DIGEST:</span>
                <span className="text-teal-600 dark:text-[#4FD1C5] font-bold">SHA-256: e8f9...4a2b</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-gray-400">CALIBRATED CONFIDENCE:</span>
                <span className="text-emerald-500 font-bold">{activeReportModal.confidence}</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-gray-400">STATUS:</span>
                <span className="text-emerald-500 font-bold">{activeReportModal.status}</span>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              This executive remote sensing dossier aggregates multi-spectral and radar observation metrics, sub-pixel registration matrices, and statistical change envelopes.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={() => setActiveReportModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(activeReportModal);
                  setActiveReportModal(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report ({activeReportModal.size})</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
