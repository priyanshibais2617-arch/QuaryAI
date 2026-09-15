import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { getConfidenceBadgeColor } from '../utils/helpers';
import EmptyState from '../components/ui/EmptyState';

export default function History({ onNavigate }) {
  const { history, loadScenario } = useAnalysis();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPageNum, setCurrentPageNum] = useState(1);

  const filters = ['All', 'VQA', 'Grounding', 'Change', 'Cross-modal'];

  const filteredHistory = history.filter((item) => {
    const matchesFilter =
      selectedFilter === 'All' ||
      (selectedFilter === 'VQA' && item.type.toLowerCase().includes('vqa')) ||
      (selectedFilter === 'Grounding' && item.type.toLowerCase().includes('grounding')) ||
      (selectedFilter === 'Change' && (item.type.toLowerCase().includes('temporal') || item.type.toLowerCase().includes('change'))) ||
      (selectedFilter === 'Cross-modal' && (item.type.toLowerCase().includes('optical + sar') || item.type.toLowerCase().includes('cross')));

    const matchesSearch =
      item.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sensor.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pageSize = 5;
  const totalPages = Math.ceil(filteredHistory.length / pageSize) || 1;
  const paginatedItems = filteredHistory.slice((currentPageNum - 1) * pageSize, currentPageNum * pageSize);

  const handleViewResult = (scenarioKey) => {
    loadScenario(scenarioKey || 'bitemporal');
    onNavigate('results');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-[#F5F7FA]">
            Analysis History Archive
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Audit trail of natural language questions and model orchestrations.
          </p>
        </div>

        <button
          onClick={() => onNavigate('analysis')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] text-xs font-bold shadow-md shadow-teal-500/20 transition-all self-start sm:self-auto"
        >
          <span>New Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-[#151C25] border border-gray-200 dark:border-white/5 w-full sm:w-auto overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => {
                setSelectedFilter(f);
                setCurrentPageNum(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedFilter === f
                  ? 'bg-white dark:bg-[#111820] text-teal-600 dark:text-[#4FD1C5] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPageNum(1);
            }}
            placeholder="Search queries, sensors, types..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
          />
        </div>
      </div>

      {/* Table Container */}
      {filteredHistory.length === 0 ? (
        <EmptyState
          title="No analysis records found"
          description="No previous missions match your selected filters. Run a new analysis to populate your archive."
          actionLabel="Start New Analysis"
          onAction={() => onNavigate('analysis')}
        />
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 dark:bg-[#151C25]/70 border-b border-gray-100 dark:border-white/5 font-mono text-[11px] text-gray-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Natural Language Query</th>
                  <th className="py-3 px-4">Analysis Type</th>
                  <th className="py-3 px-4">Images</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {paginatedItems.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={() => handleViewResult(row.scenarioKey)}
                  >
                    <td className="py-3.5 px-4 font-mono text-gray-400 whitespace-nowrap text-[11px]">
                      {row.date}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {row.query}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5]">
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500 dark:text-gray-400">
                      {row.imagesCount} scene(s)
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-[#39D98A] font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded border text-[11px] ${getConfidenceBadgeColor(row.confidence)}`}>
                        {row.confidence}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewResult(row.scenarioKey);
                        }}
                        className="text-teal-600 dark:text-[#4FD1C5] font-semibold hover:underline text-xs"
                      >
                        View Result →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {(currentPageNum - 1) * pageSize + 1} to{' '}
              {Math.min(currentPageNum * pageSize, filteredHistory.length)} of {filteredHistory.length} analyses
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPageNum === 1}
                onClick={() => setCurrentPageNum(p => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px]">
                {currentPageNum} / {totalPages}
              </span>
              <button
                disabled={currentPageNum === totalPages}
                onClick={() => setCurrentPageNum(p => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
