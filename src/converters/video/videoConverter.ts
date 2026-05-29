/**
 * ConvertSafely - Video Converter
 * 视频转换器 - 使用 FFmpeg.wasm 进行视频格式转换
 */

import type { ConversionFile, ConversionResult } from '@/types';
import { CONVERSION_TIMEOUTS, ERROR_MESSAGES } from '@/utils/constants';
import {
  ffmpegManager,
  executeFFmpeg,
  buildVideoConversionArgs,
  validateVideoFile,
  generateOutputFilename,
  getRecommendedCRF,
  type VideoFormat,
  type VideoConversionOptions,
  SUPPORTED_FORMATS,
} from './ffmpegWrapper';

/**
 * 视频转换器选项
 */
export interface VideoConverterOptions extends VideoConversionOptions {
  /** 质量预设 */
  quality?: 'low' | 'medium' | 'high';
  /** 是否保留原始分辨率 */
  preserveResolution?: boolean;
  /** 目标宽度 */
  targetWidth?: number;
  /** 目标高度 */
  targetHeight?: number;
}

/**
 * 支持的视频格式列表
 */
export const SUPPORTED_VIDEO_FORMATS: { value: VideoFormat; label: string; extension: string }[] = [
  { value: 'mp4', label: 'MP4', extension: 'mp4' },
  { value: 'webm', label: 'WebM', extension: 'webm' },
  { value: 'ogg', label: 'OGG', extension: 'ogv' },
  { value: 'mov', label: 'MOV', extension: 'mov' },
  { value: 'avi', label: 'AVI', extension: 'avi' },
  { value: 'mkv', label: 'MKV', extension: 'mkv' },
  { value: 'gif', label: 'GIF', extension: 'gif' },
];

/**
 * 默认转换选项
 */
const DEFAULT_OPTIONS: Partial<VideoConverterOptions> = {
  quality: 'medium',
  preserveResolution: true,
  preserveAudio: true,
};

/**
 * 验证视频转换
 */
export function validateVideoConversion(
  file: ConversionFile,
  targetFormat: VideoFormat
): { valid: boolean; error?: string } {
  // 验证文件类型
  const typeValidation = validateVideoFile(file.file);
  if (!typeValidation.valid) {
    return typeValidation;
  }
  
  // 检查 FFmpeg 是否支持该格式
  if (!SUPPORTED_FORMATS.video[targetFormat]) {
    return { valid: false, error: `不支持的输出格式: ${targetFormat}` };
  }
  
  return { valid: true };
}

/**
 * 转换单个视频文件
 */
export async function convertSingleVideo(
  file: ConversionFile,
  options: VideoConverterOptions,
  signal?: AbortSignal,
  onProgress?: (progress: number) => void
): Promise<ConversionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // 验证
  const validation = validateVideoConversion(file, opts.outputFormat);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  if (signal?.aborted) {
    throw new Error('Conversion aborted');
  }
  
  // 确保 FFmpeg 已加载
  await ffmpegManager.load();
  
  if (signal?.aborted) {
    throw new Error('Conversion aborted');
  }
  
  // 构建转换选项
  const outputFilename = generateOutputFilename(file.name, opts.outputFormat);
  
  const conversionOptions: VideoConversionOptions = {
    outputFormat: opts.outputFormat,
    crf: opts.crf ?? getRecommendedCRF(opts.quality || 'medium'),
    preserveAudio: opts.preserveAudio,
  };
  
  // 设置分辨率
  if (!opts.preserveResolution && (opts.targetWidth || opts.targetHeight)) {
    conversionOptions.resolution = {
      width: opts.targetWidth || 1920,
      height: opts.targetHeight || 1080,
    };
  }
  
  // 构建 FFmpeg 参数
  const args = buildVideoConversionArgs(
    file.name,
    outputFilename,
    conversionOptions
  );
  
  // 执行转换
  const blob = await executeFFmpeg(
    args,
    file.file,
    outputFilename,
    onProgress,
    signal
  );
  
  return {
    id: file.id,
    originalFile: file,
    convertedBlob: blob,
    outputFormat: opts.outputFormat,
    outputName: outputFilename,
    convertedAt: new Date(),
  };
}

/**
 * 批量转换视频
 */
export async function batchConvertVideos(
  files: ConversionFile[],
  options: VideoConverterOptions,
  signal?: AbortSignal,
  onProgress?: (currentFile: number, totalFiles: number, fileProgress: number) => void
): Promise<ConversionResult[]> {
  const results: ConversionResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) {
      throw new Error('Conversion aborted');
    }
    
    const result = await convertSingleVideo(
      files[i],
      options,
      signal,
      (progress) => onProgress?.(i + 1, files.length, progress)
    );
    
    results.push(result);
  }
  
  return results;
}

/**
 * 带超时的视频转换
 */
export async function convertVideoWithTimeout(
  file: ConversionFile,
  options: VideoConverterOptions,
  timeoutMs = CONVERSION_TIMEOUTS.video
): Promise<ConversionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const result = await convertSingleVideo(file, options, controller.signal);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(ERROR_MESSAGES.CONVERSION_TIMEOUT);
    }
    throw error;
  }
}

/**
 * 提取视频帧为图片
 */
export async function extractVideoFrame(
  file: ConversionFile,
  timeSeconds: number = 0,
  signal?: AbortSignal
): Promise<Blob> {
  await ffmpegManager.load();
  
  const ffmpeg = ffmpegManager.getInstance();
  const outputFilename = 'frame.jpg';
  
  try {
    // 写入输入文件
    const { fetchFile } = await import('@ffmpeg/util');
    const inputData = await fetchFile(file.file);
    await ffmpeg.writeFile(file.name, inputData);
    
    if (signal?.aborted) {
      throw new Error('Conversion aborted');
    }
    
    // 提取帧
    await ffmpeg.exec([
      '-i', file.name,
      '-ss', timeSeconds.toString(),
      '-vframes', '1',
      '-q:v', '2',
      '-y',
      outputFilename,
    ]);
    
    if (signal?.aborted) {
      throw new Error('Conversion aborted');
    }
    
    // 读取输出
    const outputData = await ffmpeg.readFile(outputFilename);
    
    // 清理
    await ffmpeg.deleteFile(file.name);
    await ffmpeg.deleteFile(outputFilename);
    
    const outputBytes = outputData as Uint8Array;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Blob([(outputBytes.buffer as any)], { type: 'image/jpeg' });
  } catch (error) {
    try {
      await ffmpeg.deleteFile(file.name);
      await ffmpeg.deleteFile(outputFilename);
    } catch {
      // 忽略清理错误
    }
    throw error;
  }
}

/**
 * 视频转 GIF
 */
export async function convertVideoToGIF(
  file: ConversionFile,
  options: {
    fps?: number;
    width?: number;
    startTime?: number;
    duration?: number;
  } = {},
  signal?: AbortSignal,
  onProgress?: (progress: number) => void
): Promise<ConversionResult> {
  await ffmpegManager.load();
  
  const outputFilename = generateOutputFilename(file.name, 'gif');
  
  const args: string[] = ['-i', file.name];
  
  // 时间范围
  if (options.startTime !== undefined) {
    args.push('-ss', options.startTime.toString());
  }
  if (options.duration !== undefined) {
    args.push('-t', options.duration.toString());
  }
  
  // GIF 滤镜
  const fps = options.fps || 10;
  const width = options.width || 480;
  args.push(
    '-vf',
    `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse`,
    '-loop', '0',
    '-y',
    outputFilename
  );
  
  const blob = await executeFFmpeg(args, file.file, outputFilename, onProgress, signal);
  
  return {
    id: file.id,
    originalFile: file,
    convertedBlob: blob,
    outputFormat: 'gif',
    outputName: outputFilename,
    convertedAt: new Date(),
  };
}

/**
 * 压缩视频
 */
export async function compressVideo(
  file: ConversionFile,
  targetSizeMB?: number,
  signal?: AbortSignal,
  onProgress?: (progress: number) => void
): Promise<ConversionResult> {
  const outputFormat: VideoFormat = 'mp4';
  const outputFilename = generateOutputFilename(file.name, outputFormat);
  
  // 估算需要的 CRF 值
  let crf = 23; // 默认值
  if (targetSizeMB) {
    const currentSizeMB = file.size / (1024 * 1024);
    const ratio = targetSizeMB / currentSizeMB;
    
    if (ratio < 0.3) crf = 35;
    else if (ratio < 0.5) crf = 28;
    else if (ratio < 0.7) crf = 23;
    else crf = 18;
  }
  
  const options: VideoConversionOptions = {
    outputFormat,
    crf,
    videoCodec: 'libx264',
  };
  
  const args = buildVideoConversionArgs(file.name, outputFilename, options);
  const blob = await executeFFmpeg(args, file.file, outputFilename, onProgress, signal);
  
  return {
    id: file.id,
    originalFile: file,
    convertedBlob: blob,
    outputFormat,
    outputName: outputFilename,
    convertedAt: new Date(),
  };
}

/**
 * 获取视频缩略图
 */
export async function getVideoThumbnail(
  file: ConversionFile,
  timePercent: number = 25 // 默认在 25% 处截取
): Promise<string> {
  const { fetchFile } = await import('@ffmpeg/util');
  await ffmpegManager.load();
  
  const ffmpeg = ffmpegManager.getInstance();
  const outputFilename = 'thumbnail.jpg';
  
  try {
    // 写入输入文件
    const inputData = await fetchFile(file.file);
    await ffmpeg.writeFile(file.name, inputData);
    
    // 提取缩略图（在指定百分比位置）
    await ffmpeg.exec([
      '-i', file.name,
      '-ss', `${timePercent}%`,
      '-vframes', '1',
      '-q:v', '2',
      '-y',
      outputFilename,
    ]);
    
    // 读取输出
    const outputData = await ffmpeg.readFile(outputFilename);
    
    // 清理
    await ffmpeg.deleteFile(file.name);
    await ffmpeg.deleteFile(outputFilename);
    
    // 转换为 Data URL
    const outputBytes = outputData as Uint8Array;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = new Blob([(outputBytes.buffer as any)], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  } catch (error) {
    try {
      await ffmpeg.deleteFile(file.name);
      await ffmpeg.deleteFile(outputFilename);
    } catch {
      // 忽略清理错误
    }
    throw error;
  }
}

// 导出 FFmpeg 包装器
export * from './ffmpegWrapper';
