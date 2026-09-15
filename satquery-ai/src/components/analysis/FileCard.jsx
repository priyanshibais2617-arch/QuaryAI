import React from 'react';
import { Eye, Trash2, CheckCircle2, FileCode, Calendar, RefreshCw, AlertTriangle, AlertCircle } from 'lucide-react';
import { formatFileSize } from '../../utils/helpers';

export default function FileCard({
  file,
  index,
  onRemove,
  onPreview,
  onReplace,
  onUpdateModality,
  onUpdateBenchmarkSource,
  label,
}) {
  const fileName = (file.name || '').toLowerCase();
  const ext = fileName.substring(fileName.lastIndexOf('.'));
  const extUpper = ext ? ext.replace('.', '').toUpperCase() : 'TIFF';
  const isTiff = ext === '.tif' || ext === '.tiff' || ext === '.geotiff';
  const isPngJpg = ext === '.png' || ext === '.jpg' || ext === '.jpeg';
  const currentBenchmark = file.benchmarkSource || file.benchmark_source || '';
  const hasValidBenchmark = ['BigEarthNet', 'VRSBench', 'RSVQA', 'CDVQA'].includes(currentBenchmark);

  return (
    <div className="relative group p-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm hover:border-teal-500/40 dark:hover:border-[#4FD1C5]/30 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
      {/* Thumbnail or GeoTIFF badge */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 dark:border-white/10 flex-shrink-0 flex items-center justify-center">
        {file.preview ? (
          <img
            src={file.preview}
            alt={file.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <FileCode className="w-8 h-8 text-teal-400" />
        )}
        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-[#080B10]/90 text-teal-400 border border-teal-500/40">
          {extUpper || 'TIFF'}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {label && (
            <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] font-semibold">
              {label}
            </span>
          )}
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
            {extUpper}
          </span>
          {isPngJpg && hasValidBenchmark && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-[#39D98A] font-bold border border-emerald-500/20">
              Benchmark: {currentBenchmark}
            </span>
          )}
        </div>

        <h5 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate" title={file.name}>
          {file.name}
        </h5>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
          <span>{formatFileSize(file.size)}</span>
          <span>•</span>

          {/* Modality selector dropdown */}
          {onUpdateModality ? (
            <div className="inline-flex items-center gap-1">
              <span className="text-[10px] text-gray-400">Modality:</span>
              <select
                value={file.modality || 'Optical'}
                onChange={(e) => onUpdateModality(index, e.target.value)}
                className="bg-gray-100 dark:bg-white/10 text-teal-600 dark:text-[#4FD1C5] border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="Optical">Optical (RGB/MSI)</option>
                <option value="SAR">SAR (Microwave Radar)</option>
                <option value="Multispectral">Multispectral (NIR)</option>
              </select>
            </div>
          ) : (
            <span className="text-teal-600 dark:text-[#4FD1C5]">{file.modality || 'Optical Multi-band'}</span>
          )}

          {file.date && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                {file.date}
              </span>
            </>
          )}
        </div>

        {/* Benchmark source selector for PNG/JPEG files */}
        {isPngJpg && (
          <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Benchmark Dataset:</span>
              </div>
              <select
                value={currentBenchmark}
                onChange={(e) => onUpdateBenchmarkSource && onUpdateBenchmarkSource(index, e.target.value)}
                className="bg-white dark:bg-[#080B10] text-gray-900 dark:text-gray-100 border border-amber-500/40 rounded-lg px-2 py-1 text-[11px] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="">-- Select Benchmark Dataset --</option>
                <option value="BigEarthNet">BigEarthNet</option>
                <option value="VRSBench">VRSBench</option>
                <option value="RSVQA">RSVQA</option>
                <option value="CDVQA">CDVQA</option>
              </select>
            </div>
            {!hasValidBenchmark && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                PNG and JPEG files are only accepted from BigEarthNet, VRSBench, RSVQA, or CDVQA. GeoTIFF is the default for raw geospatial imagery.
              </p>
            )}
          </div>
        )}

        {/* Status Line */}
        {isTiff && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-[#39D98A] font-semibold font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>✓ Ready for Analysis • GeoTIFF Verified</span>
          </div>
        )}
        {isPngJpg && hasValidBenchmark && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-[#39D98A] font-semibold font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>✓ Ready for Analysis • Benchmark: {currentBenchmark}</span>
          </div>
        )}
        {isPngJpg && !hasValidBenchmark && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-rose-500 font-semibold font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Missing Benchmark Tag • Select dataset above to proceed</span>
          </div>
        )}
        {!isTiff && !isPngJpg && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-rose-500 font-semibold font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Unsupported Format • GeoTIFF (.tif/.tiff) required</span>
          </div>
        )}
      </div>


      {/* Actions */}
      <div className="flex sm:flex-col items-center gap-1.5 self-end sm:self-center">
        {onPreview && (
          <button
            type="button"
            onClick={() => onPreview(file)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-[#4FD1C5] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            title="Preview Raster"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        {onReplace && (
          <button
            type="button"
            onClick={() => onReplace(index)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-[#4FD1C5] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            title="Replace Image"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            title="Remove File"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
