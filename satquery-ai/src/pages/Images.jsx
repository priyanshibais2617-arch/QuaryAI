import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Calendar,
  Layers,
  FileCode,
  CheckCircle2,
  Maximize2,
  UploadCloud,
} from 'lucide-react';
import { MOCK_IMAGES_GALLERY } from '../data/mockData';
import { getSatelliteSvgUrl } from '../utils/satelliteGenerators';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../hooks/useToast';

export default function Images({ onNavigate }) {
  const [images, setImages] = useState(MOCK_IMAGES_GALLERY);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeImageModal, setActiveImageModal] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { toast } = useToast();

  const filters = ['All', 'Optical', 'Multispectral', 'SAR'];

  const filteredImages = images.filter((img) => {
    const matchesFilter = selectedFilter === 'All' || img.modality.toLowerCase() === selectedFilter.toLowerCase();
    const matchesSearch = img.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          img.sensor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPreviewForImage = (key) => {
    if (key === 'sar-radar' || key === 'optical_sar') return getSatelliteSvgUrl('sar-radar');
    if (key === 'grounding') return getSatelliteSvgUrl('grounding-target');
    if (key === 'bitemporal') return getSatelliteSvgUrl('optical-target');
    return getSatelliteSvgUrl('optical-baseline');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-[#F5F7FA]">
            Satellite Imagery Catalog
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage calibrated GeoTIFF, Sentinel-1/2, and Landsat raster acquisitions.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] dark:hover:bg-[#4FD1C5]/90 text-xs font-bold shadow-md shadow-teal-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Raster</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Modality Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-[#151C25] border border-gray-200 dark:border-white/5 w-full sm:w-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedFilter === f
                  ? 'bg-white dark:bg-[#111820] text-teal-600 dark:text-[#4FD1C5] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by filename, sensor..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
          />
        </div>
      </div>

      {/* Image Cards Gallery */}
      {filteredImages.length === 0 ? (
        <EmptyState
          title="No satellite scenes match your filter"
          description="Try selecting a different modality filter or clearing your search term."
          actionLabel="Reset Filters"
          onAction={() => {
            setSelectedFilter('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredImages.map((img) => {
            const previewUrl = getPreviewForImage(img.scenarioKey);

            return (
              <div
                key={img.id}
                className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm hover:border-teal-500/40 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className="relative h-44 w-full bg-black overflow-hidden flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt={img.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#080B10]/80 backdrop-blur-md text-teal-400 border border-teal-500/30">
                      {img.fileType}
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[#080B10]/80 backdrop-blur-md text-gray-300 border border-white/10">
                      {img.size}
                    </div>

                    <button
                      onClick={() => setActiveImageModal(img)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Inspect Metadata</span>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-teal-600 dark:text-[#4FD1C5] font-semibold">{img.modality}</span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {img.date}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate" title={img.filename}>
                      {img.filename}
                    </h3>

                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono space-y-0.5 pt-1">
                      <div>SENSOR: {img.sensor}</div>
                      <div>BANDS: {img.bands}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-[#39D98A] text-[10px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {img.status}
                    </span>
                    <button
                      onClick={() => {
                        onNavigate('analysis');
                        toast.info(`Pre-staged ${img.filename} for new query.`, 'Raster Staged');
                      }}
                      className="text-teal-600 dark:text-[#4FD1C5] font-semibold hover:underline text-[11px]"
                    >
                      Analyze Scene →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Preview Modal */}
      <Modal
        isOpen={!!activeImageModal}
        onClose={() => setActiveImageModal(null)}
        title={activeImageModal?.filename || 'Raster Telemetry'}
        subtitle={`${activeImageModal?.sensor} • ${activeImageModal?.modality}`}
        maxWidth="max-w-2xl"
      >
        {activeImageModal && (
          <div className="space-y-4">
            <div className="h-72 w-full bg-black rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-white/10">
              <img
                src={getPreviewForImage(activeImageModal.scenarioKey)}
                alt={activeImageModal.filename}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5">
                <span className="text-gray-400 block text-[10px]">FILE TYPE</span>
                <span className="font-bold text-gray-900 dark:text-gray-100 mt-0.5 block">{activeImageModal.fileType}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5">
                <span className="text-gray-400 block text-[10px]">DIMENSIONS</span>
                <span className="font-bold text-gray-900 dark:text-gray-100 mt-0.5 block">{activeImageModal.dimensions}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5">
                <span className="text-gray-400 block text-[10px]">FILE SIZE</span>
                <span className="font-bold text-gray-900 dark:text-gray-100 mt-0.5 block">{activeImageModal.size}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5">
                <span className="text-gray-400 block text-[10px]">SPECTRAL BANDS</span>
                <span className="font-bold text-teal-600 dark:text-[#4FD1C5] mt-0.5 block truncate">{activeImageModal.bands}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5">
                <span className="text-gray-400 block text-[10px]">ACQUISITION DATE</span>
                <span className="font-bold text-gray-900 dark:text-gray-100 mt-0.5 block">{activeImageModal.date}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#151C25] border border-gray-100 dark:border-white/5">
                <span className="text-gray-400 block text-[10px]">PROJECTION</span>
                <span className="font-bold text-emerald-500 mt-0.5 block">EPSG:32643 UTM</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveImageModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setActiveImageModal(null);
                  onNavigate('analysis');
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] text-xs font-bold"
              >
                Stage for Analysis →
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload New Raster Dialog */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Ingest Satellite Raster"
        subtitle="Parse client-side GeoTIFF or Sentinel file"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="p-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-center space-y-3">
            <UploadCloud className="w-10 h-10 mx-auto text-teal-600 dark:text-[#4FD1C5]" />
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Drag and drop local satellite image file
            </p>
            <p className="text-[11px] text-gray-400">
              Supports .tif, .tiff, .geotiff, .png, .jpg (Max 500 MB)
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsUploadModalOpen(false);
                toast.success('Simulated raster ingested into local catalog.', 'Raster Added');
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white dark:bg-[#4FD1C5] dark:text-[#080B10]"
            >
              Confirm Upload
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
