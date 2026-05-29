/**
 * ConvertSafely - Audio Converter
 * 音频转换器 - 使用 FFmpeg.wasm 进行音频格式转换
 */

import type { ConversionFile, ConversionResult } from '@/types';
import { CONVERSION_TIMEOUTS, ERROR_MESSAGES } from '@/utils/constants';
import {
  ffmpegManager,
  executeFFmpeg,
  buildAudioConversionArgs,
  validateAudioFile,
  generateOutputFilename,
  getRecommendedAudioBitrate,
  type AudioFormat,
  type AudioConversionOptions,
  SUPPORTED_FORMATS,
} from './ffmpegWrapper';

/**
 * 音频转换器选项
 */
export interface AudioConverterOptions extends AudioConversionOptions {
  /** 质量预设 */
  quality?: 'low' | 'medium' | 'high';
  /** 是否标准化音量 */
  normalize?: boolean;
  /** 是否去除静音 */
  removeSilence?: boolean;
  /** 淡入时长（秒） */
  fadeIn?: number;
  /** 淡出时长（秒） */
  fadeOut?: number;
}

/**
 * 支持的音频格式列表
 */
export const SUPPORTED_AUDIO_FORMATS: { value: AudioFormat; label: string; extension: string }[] = [
  { value: 'mp3', label: 'MP3', extension: 'mp3' },
  { value: 'wav', label: 'WAV', extension: 'wav' },
  { value: 'ogg', label: 'OGG', extension: 'ogg' },
  { value: 'aac', label: 'AAC', extension: 'aac' },
  { value: 'flac', label: 'FLAC', extension: 'flac' },
  { value: 'm4a', label: 'M4A', extension: 'm4a' },
  { value: 'webm', label: 'WebM Audio', extension: 'webm' },
];

/**
 * 默认转换选项
 */
const DEFAULT_OPTIONS: Partial<AudioConverterOptions> = {
  quality: 'medium',
  sampleRate: 44100,
  channels: 2,
};

/**
 * 验证音频转换
 */
export function validateAudioConversion(
  file: ConversionFile,
  targetFormat: AudioFormat
): { valid: boolean; error?: string } {
  // 验证文件类型
  const typeValidation = validateAudioFile(file.file);
  if (!typeValidation.valid) {
    return typeValidation;
  }
  
  // 检查 FFmpeg 是否支持该格式
  if (!SUPPORTED_FORMATS.audio[targetFormat]) {
    return { valid: false, error: `不支持的输出格式: ${targetFormat}` };
  }
  
  return { valid: true };
}

/**
 * 构建音频滤镜
 */
function buildAudioFilter(options: AudioConverterOptions): string | null {
  const filters: string[] = [];
  
  // 音量标准化
  if (options.normalize) {
    filters.push('loudnorm');
  }
  
  // 淡入
  if (options.fadeIn && options.fadeIn > 0) {
    filters.push(`afade=t=in:ss=0:d=${options.fadeIn}`);
  }
  
  // 淡出
  if (options.fadeOut && options.fadeOut > 0) {
    // 注意：淡出需要在知道总时长后才能正确设置，这里简化处理
    filters.push(`afade=t=out:st=0:d=${options.fadeOut}`);
  }
  
  // 去除静音
  if (options.removeSilence) {
    filters.push('silenceremove=1:0:-50dB');
  }
  
  return filters.length > 0 ? filters.join(',') : null;
}

/**
 * 转换单个音频文件
 */
export async function convertSingleAudio(
  file: ConversionFile,
  options: AudioConverterOptions,
  signal?: AbortSignal,
  onProgress?: (progress: number) => void
): Promise<ConversionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // 验证
  const validation = validateAudioConversion(file, opts.outputFormat);
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
  
  const conversionOptions: AudioConversionOptions = {
    outputFormat: opts.outputFormat,
    bitrate: opts.bitrate ?? getRecommendedAudioBitrate(opts.quality || 'medium'),
    sampleRate: opts.sampleRate,
    channels: opts.channels,
  };
  
  // 构建 FFmpeg 参数
  const args = buildAudioConversionArgs(
    file.name,
    outputFilename,
    conversionOptions
  );
  
  // 添加音频滤镜
  const filter = buildAudioFilter(opts);
  if (filter) {
    // 在输出文件之前插入滤镜
    const outputIndex = args.indexOf('-y');
    if (outputIndex > 0) {
      args.splice(outputIndex, 0, '-af', filter);
    }
  }
  
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
 * 批量转换音频
 */
export async function batchConvertAudio(
  files: ConversionFile[],
  options: AudioConverterOptions,
  signal?: AbortSignal,
  onProgress?: (currentFile: number, totalFiles: number, fileProgress: number) => void
): Promise<ConversionResult[]> {
  const results: ConversionResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) {
      throw new Error('Conversion aborted');
    }
    
    const result = await convertSingleAudio(
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
 * 带超时的音频转换
 */
export async function convertAudioWithTimeout(
  file: ConversionFile,
  options: AudioConverterOptions,
  timeoutMs = CONVERSION_TIMEOUTS.audio
): Promise<ConversionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const result = await convertSingleAudio(file, options, controller.signal);
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
 * 从视频提取音频
 */
export async function extractAudioFromVideo(
  file: ConversionFile,
  options: AudioConverterOptions,
  signal?: AbortSignal,
  onProgress?: (progress: number) => void
): Promise<ConversionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  await ffmpegManager.load();
  
  const outputFilename = generateOutputFilename(file.name, opts.outputFormat);
  
  const { fetchFile } = await import('@ffmpeg/util');
  const ffmpeg = ffmpegManager.getInstance();
  
  try {
    // 写入输入文件
    const inputData = await fetchFile(file.file);
    await ffmpeg.writeFile(file.name, inputData);
    
    if (signal?.aborted) {
      throw new Error('Conversion aborted');
    }
    
    // 构建参数
    const args: string[] = [
      '-i', file.name,
      '-vn', // 禁用视频
      '-c:a', SUPPORTED_FORMATS.audio[opts.outputFormat]?.codec || 'libmp3lame',
    ];
    
    if (opts.bitrate) {
      args.push('-b:a', opts.bitrate);
    }
    
    if (opts.sampleRate) {
      args.push('-ar', opts.sampleRate.toString());
    }
    
    if (opts.channels) {
      args.push('-ac', opts.channels.toString());
    }
    
    // 添加音频滤镜
    const filter = buildAudioFilter(opts);
    if (filter) {
      args.push('-af', filter);
    }
    
    args.push('-y', outputFilename);
    
    // 设置进度回调
    ffmpegManager.setProgressCallback((progress) => {
      onProgress?.(progress);
    });
    
    // 执行转换
    await ffmpeg.exec(args);
    
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
    const blob = new Blob([(outputBytes.buffer as any)], {
      type: SUPPORTED_FORMATS.audio[opts.outputFormat]?.mime || 'audio/mpeg',
    });
    
    return {
      id: file.id,
      originalFile: file,
      convertedBlob: blob,
      outputFormat: opts.outputFormat,
      outputName: outputFilename,
      convertedAt: new Date(),
    };
  } catch (error) {
    // 清理
    try {
      await ffmpeg.deleteFile(file.name);
      await ffmpeg.deleteFile(outputFilename);
    } catch {
      // 忽略清理错误
    }
    throw error;
  } finally {
    ffmpegManager.setProgressCallback(null);
  }
}

/**
 * 压缩音频
 */
export async function compressAudio(
  file: ConversionFile,
  targetBitrate?: string,
  signal?: AbortSignal,
  onProgress?: (progress: number) => void
): Promise<ConversionResult> {
  const outputFormat: AudioFormat = 'mp3';
  const bitrate = targetBitrate || '128k';
  
  return convertSingleAudio(
    file,
    {
      outputFormat,
      bitrate,
      quality: 'medium',
    },
    signal,
    onProgress
  );
}

/**
 * 合并音频文件（简单拼接）
 */
export async function mergeAudioFiles(
  files: ConversionFile[],
  outputFormat: AudioFormat = 'mp3',
  signal?: AbortSignal,
  onProgress?: (progress: number) => void
): Promise<ConversionResult> {
  if (files.length < 2) {
    throw new Error('至少需要两个音频文件才能合并');
  }
  
  await ffmpegManager.load();
  
  const { fetchFile } = await import('@ffmpeg/util');
  const ffmpeg = ffmpegManager.getInstance();
  
  const outputFilename = `merged_audio.${SUPPORTED_FORMATS.audio[outputFormat]?.ext || 'mp3'}`;
  
  try {
    // 写入所有输入文件
    for (const file of files) {
      const inputData = await fetchFile(file.file);
      await ffmpeg.writeFile(file.name, inputData);
    }
    
    if (signal?.aborted) {
      throw new Error('Conversion aborted');
    }
    
    // 创建 concat 列表文件
    const concatList = files.map(f => `file '${f.name}'`).join('\n');
    await ffmpeg.writeFile('concat_list.txt', concatList);
    
    // 设置进度回调
    ffmpegManager.setProgressCallback((progress) => {
      onProgress?.(progress);
    });
    
    // 执行合并
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat_list.txt',
      '-c:a', SUPPORTED_FORMATS.audio[outputFormat]?.codec || 'libmp3lame',
      '-y',
      outputFilename,
    ]);
    
    if (signal?.aborted) {
      throw new Error('Conversion aborted');
    }
    
    // 读取输出
    const outputData = await ffmpeg.readFile(outputFilename);
    
    // 清理
    for (const file of files) {
      await ffmpeg.deleteFile(file.name);
    }
    await ffmpeg.deleteFile('concat_list.txt');
    await ffmpeg.deleteFile(outputFilename);
    
    const outputBytes = outputData as Uint8Array;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = new Blob([(outputBytes.buffer as any)], {
      type: SUPPORTED_FORMATS.audio[outputFormat]?.mime || 'audio/mpeg',
    });
    
    return {
      id: files[0].id,
      originalFile: files[0],
      convertedBlob: blob,
      outputFormat,
      outputName: outputFilename,
      convertedAt: new Date(),
    };
  } catch (error) {
    // 清理
    try {
      for (const file of files) {
        await ffmpeg.deleteFile(file.name);
      }
      await ffmpeg.deleteFile('concat_list.txt');
      await ffmpeg.deleteFile(outputFilename);
    } catch {
      // 忽略清理错误
    }
    throw error;
  } finally {
    ffmpegManager.setProgressCallback(null);
  }
}

/**
 * 修剪音频
 */
export async function trimAudio(
  file: ConversionFile,
  startTime: number, // 秒
  duration: number, // 秒
  options: AudioConverterOptions,
  signal?: AbortSignal,
  onProgress?: (progress: number) => void
): Promise<ConversionResult> {
  return convertSingleAudio(
    file,
    {
      ...options,
      startTime: startTime.toString(),
      duration: duration.toString(),
    },
    signal,
    onProgress
  );
}

// 导出 FFmpeg 包装器
export * from './ffmpegWrapper';
