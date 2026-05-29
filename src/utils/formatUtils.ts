/**
 * ConvertSafely - 格式工具函数
 * 提供格式转换、格式化显示等功能
 */

import { SUPPORTED_FORMATS, MIME_TYPE_MAP, QUALITY_OPTIONS } from './constants';

/**
 * 格式类别类型
 */
export type FormatCategory = 'image' | 'video' | 'audio' | 'pdf' | 'document';

/**
 * 获取格式类别的显示名称
 */
export const getCategoryDisplayName = (category: FormatCategory): string => {
  const names: Record<FormatCategory, string> = {
    image: '图片',
    video: '视频',
    audio: '音频',
    pdf: 'PDF',
    document: '文档',
  };
  return names[category] || category;
};

/**
 * 获取文件格式的显示名称
 */
export const getFormatDisplayName = (format: string): string => {
  const names: Record<string, string> = {
    // Images
    jpg: 'JPEG',
    jpeg: 'JPEG',
    png: 'PNG',
    webp: 'WebP',
    gif: 'GIF',
    bmp: 'BMP',
    tiff: 'TIFF',
    svg: 'SVG',
    // Videos
    mp4: 'MP4',
    webm: 'WebM',
    ogg: 'OGG',
    ogv: 'OGG Video',
    mov: 'QuickTime',
    avi: 'AVI',
    mkv: 'Matroska',
    // Audio
    mp3: 'MP3',
    wav: 'WAV',
    aac: 'AAC',
    flac: 'FLAC',
    m4a: 'M4A',
    weba: 'WebM Audio',
    // Documents
    pdf: 'PDF',
    docx: 'Word Document',
    doc: 'Word 97-2003',
    xlsx: 'Excel Spreadsheet',
    xls: 'Excel 97-2003',
    txt: 'Plain Text',
    md: 'Markdown',
    rtf: 'Rich Text',
  };
  return names[format.toLowerCase()] || format.toUpperCase();
};

/**
 * 获取格式图标 (返回 emoji 或图标名称)
 */
export const getFormatIcon = (format: string): string => {
  const icons: Record<string, string> = {
    // Images
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    webp: '🖼️',
    gif: '🎞️',
    svg: '🎨',
    // Videos
    mp4: '🎬',
    webm: '🎬',
    mov: '🎬',
    avi: '🎬',
    mkv: '🎬',
    // Audio
    mp3: '🎵',
    wav: '🎵',
    flac: '🎵',
    aac: '🎵',
    // Documents
    pdf: '📄',
    docx: '📝',
    doc: '📝',
    xlsx: '📊',
    xls: '📊',
    txt: '📃',
    md: '📑',
  };
  return icons[format.toLowerCase()] || '📎';
};

/**
 * 获取格式的 MIME 类型
 */
export const getFormatMimeType = (format: string): string => {
  return MIME_TYPE_MAP[format.toLowerCase()] || 'application/octet-stream';
};

/**
 * 获取类别支持的所有输入格式
 */
export const getCategoryInputFormats = (category: FormatCategory): string[] => {
  const formats = SUPPORTED_FORMATS[category];
  if (!formats) return [];
  
  return formats.input.map((mimeType) => {
    const ext = formats.extensions[mimeType as keyof typeof formats.extensions];
    return ext || mimeType.split('/')[1];
  });
};

/**
 * 获取类别支持的所有输出格式
 */
export const getCategoryOutputFormats = (category: FormatCategory): readonly string[] => {
  return SUPPORTED_FORMATS[category]?.output || [];
};

/**
 * 获取质量滑块的配置
 */
export const getQualityConfig = (category: FormatCategory) => {
  switch (category) {
    case 'image':
      return QUALITY_OPTIONS.image;
    case 'video':
      return QUALITY_OPTIONS.video;
    case 'audio':
      return QUALITY_OPTIONS.audio;
    default:
      return null;
  }
};

/**
 * 将质量值转换为显示标签
 */
export const getQualityLabel = (category: FormatCategory, value: number): string => {
  const config = getQualityConfig(category);
  if (!config) return `${value}`;

  const { min, max, labels } = config;
  const percentage = (value - min) / (max - min);

  if (percentage <= 0.25) return labels.low;
  if (percentage <= 0.5) return labels.medium;
  if (percentage <= 0.75) return labels.high;
  return labels.maximum;
};

/**
 * 格式化转换选项为 FFmpeg 参数
 */
export const buildFFmpegArgs = (
  _inputFormat: string,
  outputFormat: string,
  quality: number,
  options: {
    videoCodec?: string;
    audioCodec?: string;
    preserveAspectRatio?: boolean;
  } = {}
): string[] => {
  const args: string[] = [];

  // 视频格式
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(outputFormat)) {
    // 使用 CRF 质量控制 (0-51, 越低质量越好)
    args.push('-crf', String(quality));
    
    if (options.videoCodec) {
      args.push('-c:v', options.videoCodec);
    }
    if (options.audioCodec) {
      args.push('-c:a', options.audioCodec);
    }
    
    // 快速编码预设
    args.push('-preset', 'fast');
  }

  // 音频格式
  if (['mp3', 'aac', 'ogg'].includes(outputFormat)) {
    // 使用比特率控制质量
    args.push('-b:a', `${quality}k`);
  }

  // 图片格式
  if (['jpg', 'jpeg', 'webp'].includes(outputFormat)) {
    // 使用质量参数 (1-100)
    const q = Math.round(quality * 100);
    args.push('-q:v', String(q));
  }

  return args;
};

/**
 * 检查两种格式之间是否支持转换
 */
export const isConversionSupported = (
  _sourceFormat: string,
  targetFormat: string,
  category: FormatCategory
): boolean => {
  const outputFormats = getCategoryOutputFormats(category);
  return outputFormats.includes(targetFormat.toLowerCase());
};

/**
 * 获取推荐的输出格式
 */
export const getRecommendedOutputFormat = (
  _sourceFormat: string,
  category: FormatCategory
): string | null => {
  const outputFormats = getCategoryOutputFormats(category);
  
  if (outputFormats.length === 0) return null;
  
  // 对于图片，推荐 WebP (更好的压缩)
  if (category === 'image' && outputFormats.includes('webp')) {
    return 'webp';
  }
  
  // 对于视频，推荐 MP4 (兼容性最好)
  if (category === 'video' && outputFormats.includes('mp4')) {
    return 'mp4';
  }
  
  // 对于音频，推荐 MP3 (兼容性最好)
  if (category === 'audio' && outputFormats.includes('mp3')) {
    return 'mp3';
  }
  
  // 默认返回第一个可用格式
  return outputFormats[0];
};

/**
 * 生成输出文件名
 */
export const generateOutputFileName = (
  originalName: string,
  outputFormat: string
): string => {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return `${baseName}-converted.${outputFormat}`;
};

/**
 * 解析文件格式从 MIME 类型
 */
export const parseFormatFromMimeType = (mimeType: string): string | null => {
  const entry = Object.entries(MIME_TYPE_MAP).find(([, type]) => type === mimeType);
  return entry ? entry[0] : null;
};

/**
 * 获取格式描述信息
 */
export const getFormatDescription = (format: string): string => {
  const descriptions: Record<string, string> = {
    // Images
    jpg: '广泛兼容的有损压缩格式，适合照片',
    png: '无损压缩格式，支持透明背景',
    webp: '现代格式，更好的压缩率',
    gif: '支持动画，256色限制',
    // Videos
    mp4: '最广泛支持的视频格式',
    webm: '开源格式，适合网页',
    mov: 'Apple QuickTime 格式',
    // Audio
    mp3: '最广泛支持的音频格式',
    wav: '无损音频格式，文件较大',
    flac: '无损压缩音频格式',
    // Documents
    pdf: '便携式文档格式',
    docx: 'Microsoft Word 文档',
    txt: '纯文本格式',
  };
  return descriptions[format.toLowerCase()] || `${format.toUpperCase()} 格式`;
};
