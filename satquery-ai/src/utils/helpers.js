// Utility helpers for SatQuery AI

export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getConfidenceBadgeColor(confidence) {
  if (confidence >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  if (confidence >= 75) return 'text-teal-500 bg-teal-500/10 border-teal-500/20';
  if (confidence >= 50) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
}

export function getModalityColor(modality) {
  switch (modality?.toLowerCase()) {
    case 'optical':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'multispectral':
      return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    case 'sar':
      return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    default:
      return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
  }
}
