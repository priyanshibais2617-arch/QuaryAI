import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileUp,
  Sparkles,
  AlertCircle,
  Layers,
  Image as ImageIcon,
  Radio,
  CheckCircle2,
  Trash2,
  Plus
} from 'lucide-react';
import FileCard from './FileCard';
import { getSatelliteSvgUrl } from '../../utils/satelliteGenerators';
import { useToast } from '../../hooks/useToast';

export default function UploadZone({
  analysisType = 'bitemporal',
  stagedFiles = [],
  onAddFile,
  onSetSlotFile,
  onRemoveFile,
  onPreviewFile,
  onUpdateModality,
  onUpdateBenchmarkSource,
  onClearAll,
}) {
  const { toast } = useToast();

  // Drag-over states per slot or general
  const [dragSlot, setDragSlot] = useState(null); // 'single', 'before', 'after', 'optical', 'sar', 'general'

  // Dedicated file input refs for slot-specific browsing
  const generalInputRef = useRef(null);
  const slot0InputRef = useRef(null);
  const slot1InputRef = useRef(null);

  // Helper to create valid file object with preview and modality detection
  const processUploadedFile = (file, explicitModality = null, targetSlot = null) => {
    const validExts = ['.tif', '.tiff', '.png', '.jpg', '.jpeg', '.geotiff'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExts.includes(ext)) {
      toast.error(
        `"${file.name}" has an unsupported format. Supported: GeoTIFF, TIFF, or benchmark PNG/JPEG.`,
        'Invalid Format'
      );
      return null;
    }

    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      toast.info(
        `PNG/JPEG format detected. Please select the benchmark dataset tag (BigEarthNet, VRSBench, RSVQA, CDVQA) to validate.`,
        'Benchmark Tag Required'
      );
    }

    // Modal inference heuristic
    let inferredModality = explicitModality;
    if (!inferredModality) {
      const lowerName = file.name.toLowerCase();
      if (lowerName.includes('sar') || lowerName.includes('radar') || lowerName.includes('sentinel-1') || lowerName.includes('s1')) {
        inferredModality = 'SAR';
      } else if (lowerName.includes('landsat') || lowerName.includes('multispectral') || lowerName.includes('nir')) {
        inferredModality = 'Multispectral';
      } else {
        inferredModality = targetSlot === 1 && analysisType === 'optical_sar' ? 'SAR' : 'Optical';
      }
    }

    // Generate local preview URL or SVG placeholder
    let previewUrl = '';
    if (file.type?.startsWith('image/') || ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      try {
        previewUrl = URL.createObjectURL(file);
      } catch (e) {
        previewUrl = inferredModality === 'SAR' ? getSatelliteSvgUrl('sar-radar') : getSatelliteSvgUrl('optical-target');
      }
    } else {
      previewUrl = inferredModality === 'SAR' ? getSatelliteSvgUrl('sar-radar') : getSatelliteSvgUrl('optical-target');
    }

    return {
      id: `upl-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
      name: file.name,
      size: file.size,
      type: file.type || 'image/tiff',
      preview: previewUrl,
      modality: inferredModality,
      benchmarkSource: null,
      benchmark_source: null,
      date: new Date().toISOString().slice(0, 10),
      status: 'Valid',
      rawFile: file,
    };
  };


  // Helper to reset all file input values
  const resetFileInputs = () => {
    if (generalInputRef.current) generalInputRef.current.value = '';
    if (slot0InputRef.current) slot0InputRef.current.value = '';
    if (slot1InputRef.current) slot1InputRef.current.value = '';
  };

  // Handle uploading directly into a specific slot (0 or 1)
  const handleSlotUpload = (fileList, slotIndex, explicitModality) => {
    try {
      if (!fileList || fileList.length === 0) return;
      const file = fileList[0];
      const fileObj = processUploadedFile(file, explicitModality, slotIndex);

      if (fileObj) {
        if (onSetSlotFile) {
          onSetSlotFile(slotIndex, fileObj);
        } else if (onAddFile) {
          onAddFile(fileObj);
        }
        toast.success(`Staged "${file.name}" successfully.`, 'Image Staged');
      }
    } finally {
      if (slotIndex === 0 && slot0InputRef.current) slot0InputRef.current.value = '';
      if (slotIndex === 1 && slot1InputRef.current) slot1InputRef.current.value = '';
    }
  };

  // General upload handler (supports drag & drop or general file picker)
  const handleGeneralFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;

    try {
      const maxAllowed = analysisType === 'single' ? 1 : 2;
      const currentCount = stagedFiles.length;
      const availableSlots = maxAllowed - currentCount;

      if (availableSlots <= 0) {
        if (analysisType === 'single') {
          toast.error('Single Image mode accepts only one image.', 'Maximum Images Reached');
        } else if (analysisType === 'bitemporal') {
          toast.error('Bi-Temporal analysis accepts a maximum of two images.', 'Maximum Images Reached');
        } else {
          toast.error('Optical + SAR analysis accepts one optical image and one SAR image.', 'Maximum Images Reached');
        }
        return;
      }

      const filesArray = Array.from(fileList);
      const filesToAdd = filesArray.slice(0, availableSlots);
      const rejectedFiles = filesArray.slice(availableSlots);

      filesToAdd.forEach((file, idx) => {
        const targetSlot = currentCount + idx;
        let explicitModality = null;
        if (analysisType === 'optical_sar') {
          const lowerName = file.name.toLowerCase();
          if (lowerName.includes('sar') || lowerName.includes('radar')) {
            explicitModality = 'SAR';
          } else {
            explicitModality = targetSlot === 1 || (stagedFiles[0] && stagedFiles[0].modality === 'Optical') ? 'SAR' : 'Optical';
          }
        }

        const fileObj = processUploadedFile(file, explicitModality, targetSlot);
        if (fileObj) {
          if (onAddFile) {
            onAddFile(fileObj);
          }
          toast.success(`Staged "${file.name}" for analysis.`, 'Image Staged');
        }
      });

      if (rejectedFiles.length > 0) {
        if (analysisType === 'single') {
          toast.error('Single Image mode accepts only one image.', 'Maximum Images Reached');
        } else if (analysisType === 'bitemporal') {
          toast.error('Bi-Temporal analysis accepts a maximum of two images.', 'Maximum Images Reached');
        } else {
          toast.error('Optical + SAR analysis accepts one optical image and one SAR image.', 'Maximum Images Reached');
        }
      }
    } finally {
      resetFileInputs();
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e, slotId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragSlot(slotId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragSlot(null);
  };

  const handleDrop = (e, slotIndex, explicitModality) => {
    e.preventDefault();
    e.stopPropagation();
    setDragSlot(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (slotIndex !== undefined && slotIndex !== null) {
        handleSlotUpload(e.dataTransfer.files, slotIndex, explicitModality);
      } else {
        handleGeneralFiles(e.dataTransfer.files);
      }
    }
  };

  // Status message computation
  const getStatusSummary = () => {
    if (analysisType === 'single') {
      if (stagedFiles.length === 0) return { text: '0 of 1 image uploaded • Waiting for imagery', ready: false };
      return { text: '✓ 1 of 1 image ready for validation', ready: true };
    }
    if (analysisType === 'bitemporal') {
      if (stagedFiles.length === 0) return { text: '0 of 2 images uploaded • Stage Before & After images', ready: false };
      if (stagedFiles.length === 1) return { text: '1 of 2 images uploaded • Waiting for After image', ready: false };
      return { text: '✓ 2 of 2 images uploaded • Ready for validation', ready: true };
    }
    if (analysisType === 'optical_sar') {
      if (stagedFiles.length === 0) return { text: '0 of 2 images uploaded • Stage Optical & SAR scenes', ready: false };
      if (stagedFiles.length === 1) return { text: '1 of 2 images uploaded • Waiting for complementary sensor', ready: false };
      return { text: '✓ 2 of 2 images uploaded • Ready for validation', ready: true };
    }
    return { text: `${stagedFiles.length} image(s) staged`, ready: stagedFiles.length > 0 };
  };

  const status = getStatusSummary();
  const file0 = stagedFiles[0] || null;
  const file1 = stagedFiles[1] || null;

  return (
    <div className="space-y-4">
      {/* Hidden inputs for programmatic triggering */}
      <input
        ref={generalInputRef}
        type="file"
        multiple={analysisType !== 'single'}
        accept=".tif,.tiff,.png,.jpg,.jpeg,.geotiff"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleGeneralFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <input
        ref={slot0InputRef}
        type="file"
        accept=".tif,.tiff,.png,.jpg,.jpeg,.geotiff"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleSlotUpload(e.target.files, 0, analysisType === 'optical_sar' ? 'Optical' : null);
          e.target.value = '';
        }}
      />

      <input
        ref={slot1InputRef}
        type="file"
        accept=".tif,.tiff,.png,.jpg,.jpeg,.geotiff"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleSlotUpload(e.target.files, 1, analysisType === 'optical_sar' ? 'SAR' : null);
          e.target.value = '';
        }}
      />

      {/* Top Staging Status Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className={`w-2.5 h-2.5 rounded-full ${status.ready ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <span className={`font-bold ${status.ready ? 'text-emerald-700 dark:text-[#39D98A]' : 'text-gray-700 dark:text-gray-300'}`}>
            {status.text}
          </span>
        </div>

        {stagedFiles.length > 0 && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 text-[11px] font-mono text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:underline transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Staged Imagery</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: SINGLE IMAGE FLOW (1 Slot) */}
      {/* ========================================================================= */}
      {analysisType === 'single' && (
        <div className="space-y-3">
          {file0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-gray-400">
                <span>Primary Satellite Scene</span>
                <span className="text-emerald-500">Slot Filled</span>
              </div>
              <FileCard
                file={file0}
                index={0}
                label="Primary Scene"
                onRemove={onRemoveFile}
                onPreview={onPreviewFile}
                onReplace={() => slot0InputRef.current?.click()}
                onUpdateModality={onUpdateModality}
                onUpdateBenchmarkSource={onUpdateBenchmarkSource}
              />
            </div>
          ) : (
            <div
              onDrop={(e) => handleDrop(e, 0)}
              onDragOver={(e) => handleDragOver(e, 'single')}
              onDragLeave={handleDragLeave}
              onClick={() => slot0InputRef.current?.click()}
              className={`p-8 rounded-2xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center cursor-pointer ${
                dragSlot === 'single'
                  ? 'border-teal-500 bg-teal-500/10 dark:bg-[#4FD1C5]/10 scale-[0.99]'
                  : 'border-gray-200 dark:border-white/10 hover:border-teal-500/50 bg-gray-50/50 dark:bg-[#111820]/40'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                {dragSlot === 'single' ? 'Drop Image Here' : 'Upload Primary Satellite Scene'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-3 leading-relaxed">
                Drag &amp; drop 1 optical, multispectral, or SAR image (GeoTIFF, TIFF, or benchmark PNG/JPEG) or click to browse.
              </p>
              <span className="px-3 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] text-xs font-mono font-bold">
                Single Image Slot (1 Required)
              </span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: BI-TEMPORAL FLOW (2 Dedicated Slots: BEFORE and AFTER) */}
      {/* ========================================================================= */}
      {analysisType === 'bitemporal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SLOT 0: BEFORE IMAGE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-gray-400">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                1. BEFORE IMAGE (Baseline T1)
              </span>
              <span>{file0 ? '✓ Ready' : 'Waiting...'}</span>
            </div>

            {file0 ? (
              <FileCard
                file={file0}
                index={0}
                label="Baseline (Before T1)"
                onRemove={onRemoveFile}
                onPreview={onPreviewFile}
                onReplace={() => slot0InputRef.current?.click()}
                onUpdateModality={onUpdateModality}
                onUpdateBenchmarkSource={onUpdateBenchmarkSource}
              />
            ) : (
              <div
                onDrop={(e) => handleDrop(e, 0)}
                onDragOver={(e) => handleDragOver(e, 'before')}
                onDragLeave={handleDragLeave}
                onClick={() => slot0InputRef.current?.click()}
                className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center cursor-pointer min-h-[170px] ${
                  dragSlot === 'before'
                    ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                    : 'border-blue-500/30 hover:border-blue-500/60 bg-blue-50/20 dark:bg-blue-950/10'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                  {dragSlot === 'before' ? 'Drop Before Image Here' : 'Upload BEFORE Image'}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mb-2 leading-relaxed">
                  Earlier baseline satellite acquisition prior to changes.
                </p>
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  Click to Browse Baseline
                </span>
              </div>
            )}
          </div>

          {/* SLOT 1: AFTER IMAGE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-gray-400">
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                2. AFTER IMAGE (Target T2)
              </span>
              <span>{file1 ? '✓ Ready' : 'Waiting...'}</span>
            </div>

            {file1 ? (
              <FileCard
                file={file1}
                index={1}
                label="Target (After T2)"
                onRemove={onRemoveFile}
                onPreview={onPreviewFile}
                onReplace={() => slot1InputRef.current?.click()}
                onUpdateModality={onUpdateModality}
                onUpdateBenchmarkSource={onUpdateBenchmarkSource}
              />
            ) : (
              <div
                onDrop={(e) => handleDrop(e, 1)}
                onDragOver={(e) => handleDragOver(e, 'after')}
                onDragLeave={handleDragLeave}
                onClick={() => slot1InputRef.current?.click()}
                className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center cursor-pointer min-h-[170px] ${
                  dragSlot === 'after'
                    ? 'border-rose-500 bg-rose-500/10 scale-[0.99]'
                    : 'border-rose-500/30 hover:border-rose-500/60 bg-rose-50/20 dark:bg-rose-950/10'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                  {dragSlot === 'after' ? 'Drop After Image Here' : 'Upload AFTER Image'}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mb-2 leading-relaxed">
                  Recent target acquisition demonstrating structural change.
                </p>
                <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-semibold">
                  Click to Browse Target
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: OPTICAL + SAR FLOW (2 Dedicated Slots: OPTICAL and SAR) */}
      {/* ========================================================================= */}
      {analysisType === 'optical_sar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SLOT 0: OPTICAL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-gray-400">
              <span className="flex items-center gap-1.5 text-teal-600 dark:text-[#4FD1C5]">
                <ImageIcon className="w-3.5 h-3.5" />
                1. OPTICAL / MULTISPECTRAL
              </span>
              <span>{file0 ? '✓ Ready' : 'Waiting...'}</span>
            </div>

            {file0 ? (
              <FileCard
                file={file0}
                index={0}
                label="Optical Multi-Band"
                onRemove={onRemoveFile}
                onPreview={onPreviewFile}
                onReplace={() => slot0InputRef.current?.click()}
                onUpdateModality={onUpdateModality}
                onUpdateBenchmarkSource={onUpdateBenchmarkSource}
              />
            ) : (
              <div
                onDrop={(e) => handleDrop(e, 0, 'Optical')}
                onDragOver={(e) => handleDragOver(e, 'optical')}
                onDragLeave={handleDragLeave}
                onClick={() => slot0InputRef.current?.click()}
                className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center cursor-pointer min-h-[170px] ${
                  dragSlot === 'optical'
                    ? 'border-teal-500 bg-teal-500/10 scale-[0.99]'
                    : 'border-teal-500/30 hover:border-teal-500/60 bg-teal-50/20 dark:bg-teal-950/10'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5] flex items-center justify-center mb-2">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                  {dragSlot === 'optical' ? 'Drop Optical Image Here' : 'Upload OPTICAL Image'}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mb-2 leading-relaxed">
                  Sentinel-2, Landsat, or True-Color RGB imagery.
                </p>
                <span className="text-[10px] font-mono text-teal-600 dark:text-[#4FD1C5] font-semibold">
                  Click to Browse Optical
                </span>
              </div>
            )}
          </div>

          {/* SLOT 1: SAR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-gray-400">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <Radio className="w-3.5 h-3.5" />
                2. SAR MICROWAVE RADAR
              </span>
              <span>{file1 ? '✓ Ready' : 'Waiting...'}</span>
            </div>

            {file1 ? (
              <FileCard
                file={file1}
                index={1}
                label="SAR Radar (VV+VH)"
                onRemove={onRemoveFile}
                onPreview={onPreviewFile}
                onReplace={() => slot1InputRef.current?.click()}
                onUpdateModality={onUpdateModality}
                onUpdateBenchmarkSource={onUpdateBenchmarkSource}
              />
            ) : (
              <div
                onDrop={(e) => handleDrop(e, 1, 'SAR')}
                onDragOver={(e) => handleDragOver(e, 'sar')}
                onDragLeave={handleDragLeave}
                onClick={() => slot1InputRef.current?.click()}
                className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center cursor-pointer min-h-[170px] ${
                  dragSlot === 'sar'
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                    : 'border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-50/20 dark:bg-indigo-950/10'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                  <Radio className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                  {dragSlot === 'sar' ? 'Drop SAR Image Here' : 'Upload SAR Image'}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mb-2 leading-relaxed">
                  Sentinel-1 C-band or microwave radar backscatter scene.
                </p>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  Click to Browse SAR
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Format details pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono text-gray-400">
        <div className="flex items-center gap-1.5">
          <FileUp className="w-3.5 h-3.5 text-teal-500" />
          <span>Supported: GeoTIFF (.tif/.tiff) or Benchmark-Tagged PNG/JPEG (BigEarthNet, VRSBench, RSVQA, CDVQA)</span>
        </div>
        <button
          type="button"
          onClick={() => generalInputRef.current?.click()}
          className="text-teal-600 dark:text-[#4FD1C5] hover:underline"
        >
          + Add via General Browser
        </button>
      </div>
    </div>
  );
}

