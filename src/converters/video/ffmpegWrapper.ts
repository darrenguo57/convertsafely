/**
 * ConvertSafely - FFmpeg Wrapper
 * FFmpeg.wasm 封装 - 音视频处理核心
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { CONVERSION_TIMEOUTS, ERROR_MESSAGES } from '@/utils/constants';

/**
 * FFmpeg 加载状态
 */
export type FFmpegLoadingState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * FFmpeg 实例管理器
 */
class FFmpegManager {
  private ffmpeg: FFmpeg | null = null;
  private loadingState: FFmpegLoadingState = 'idle';
  private loadPromise: Promise<void> | null = null;
  private progressCallback: ((progress: number) => void) | null = null;

  /**
   * 获取 FFmpeg 实例
   */
  getInstance(): FFmpeg {
    if (!this.ffmpeg) {
      this.ffmpeg = new FFmpeg();
      this.setupProgressHandler();
    }
    return this.ffmpeg;
  }

  /**
   * 设置进度处理器
   */
  private setupProgressHandler(): void {
    if (!this.ffmpeg) return;
    
    this.ffmpeg.on('progress', ({ progress }) => {
      const percent = Math.round(progress * 100);
      this.progressCallback?.(percent);
    });
  }

  /**
   * 设置进度回调
   */
  setProgressCallback(callback: ((progress: number) => void) | null): void {
    this.progressCallback = callback;
  }

  /**
   * 加载 FFmpeg
   */
  async load(): Promise<void> {
    if (this.loadingState === 'ready') {
      return;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.doLoad();
    return this.loadPromise;
  }

  /**
   * 执行加载
   */
  private async doLoad(): Promise<void> {
    try {
      this.loadingState = 'loading';
      const ffmpeg = this.getInstance();

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.loadingState = 'ready';
    } catch (error) {
      this.loadingState = 'error';
      this.loadPromise = null;
      throw new Error('Failed to load FFmpeg: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * 获取加载状态
   */
  getLoadingState(): FFmpegLoadingState {
    return this.loadingState;
  }

  /**
   * 是否已准备好
   */
  isReady(): boolean {
    return this.loadingState === 'ready';
  }

  /**
   * 终止 FFmpeg
   */
  terminate(): void {
    if (this.ffmpeg) {
      this.ffmpeg.terminate();
      this.ffmpeg = null;
      this.loadingState = 'idle';
      this.loadPromise = null;
    }
  }
}

// 全局 FFmpeg 管理器实例
export const ffmpegManager = new FFmpegManager();

/**
 * 视频格式
 */
export type VideoFormat = 'mp4' | 'webm' | 'ogg' | 'mov' | 'avi' | 'mkv' | 'gif';

/**
 * 音频格式
 */
export type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'aac' | 'flac' | 'm4a' | 'webm';

/**
 * 视频转换选项
 */
export interface VideoConversionOptions {
  outputFormat: VideoFormat;
  videoCodec?: string;
  audioCodec?: string;
  resolution?: { width: number; height: number };
  fps?: number;
  videoBitrate?: string;
  audioBitrate?: string;
  crf?: number; // Constant Rate Factor (0-51, lower is better quality)
  preserveAudio?: boolean;
  startTime?: string; // HH:MM:SS or seconds
  duration?: string; // HH:MM:SS or seconds
}

/**
 * 音频转换选项
 */
export interface AudioConversionOptions {
  outputFormat: AudioFormat;
  audioCodec?: string;
  sampleRate?: number;
  channels?: number;
  bitrate?: string;
  volume?: number;
  startTime?: string;
  duration?: string;
}

/**
 * 支持的格式配置
 */
export const SUPPORTED_FORMATS = {
  video: {
    mp4: { codec: 'libx264', ext: 'mp4', mime: 'video/mp4' },
    webm: { codec: 'libvpx-vp9', ext: 'webm', mime: 'video/webm' },
    ogg: { codec: 'libtheora', ext: 'ogv', mime: 'video/ogg' },
    mov: { codec: 'libx264', ext: 'mov', mime: 'video/quicktime' },
    avi: { codec: 'libx264', ext: 'avi', mime: 'video/x-msvideo' },
    mkv: { codec: 'libx264', ext: 'mkv', mime: 'video/x-matroska' },
    gif: { codec: 'gif', ext: 'gif', mime: 'image/gif' },
  } as const,
  audio: {
    mp3: { codec: 'libmp3lame', ext: 'mp3', mime: 'audio/mpeg' },
    wav: { codec: 'pcm_s16le', ext: 'wav', mime: 'audio/wav' },
    ogg: { codec: 'libvorbis', ext: 'ogg', mime: 'audio/ogg' },
    aac: { codec: 'aac', ext: 'aac', mime: 'audio/aac' },
    flac: { codec: 'flac', ext: 'flac', mime: 'audio/flac' },
    m4a: { codec: 'aac', ext: 'm4a', mime: 'audio/mp4' },
    webm: { codec: 'libopus', ext: 'webm', mime: 'audio/webm' },
  } as const,
};

/**
 * 构建 FFmpeg 视频转换参数
 */
export function buildVideoConversionArgs(
  inputFile: string,
  outputFile: string,
  options: VideoConversionOptions
): string[] {
  const args: string[] = ['-i', inputFile];

  // 时间范围
  if (options.startTime) {
    args.push('-ss', options.startTime);
  }
  if (options.duration) {
    args.push('-t', options.duration);
  }

  // 视频编解码器
  const formatConfig = SUPPORTED_FORMATS.video[options.outputFormat];
  if (formatConfig && formatConfig.codec !== 'gif') {
    args.push('-c:v', options.videoCodec || formatConfig.codec);
  }

  // CRF (质量)
  if (options.crf !== undefined && options.outputFormat !== 'gif') {
    args.push('-crf', options.crf.toString());
  }

  // 分辨率
  if (options.resolution) {
    args.push('-s', `${options.resolution.width}x${options.resolution.height}`);
  }

  // 帧率
  if (options.fps) {
    args.push('-r', options.fps.toString());
  }

  // 视频比特率
  if (options.videoBitrate) {
    args.push('-b:v', options.videoBitrate);
  }

  // 音频处理
  if (options.preserveAudio === false) {
    args.push('-an'); // 禁用音频
  } else {
    if (options.audioCodec) {
      args.push('-c:a', options.audioCodec);
    }
    if (options.audioBitrate) {
      args.push('-b:a', options.audioBitrate);
    }
  }

  // GIF 特殊处理
  if (options.outputFormat === 'gif') {
    args.push('-vf', 'fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse');
  }

  // 覆盖输出文件
  args.push('-y', outputFile);

  return args;
}

/**
 * 构建 FFmpeg 音频转换参数
 */
export function buildAudioConversionArgs(
  inputFile: string,
  outputFile: string,
  options: AudioConversionOptions
): string[] {
  const args: string[] = ['-i', inputFile];

  // 时间范围
  if (options.startTime) {
    args.push('-ss', options.startTime);
  }
  if (options.duration) {
    args.push('-t', options.duration);
  }

  // 音频编解码器
  const formatConfig = SUPPORTED_FORMATS.audio[options.outputFormat];
  if (formatConfig) {
    args.push('-c:a', options.audioCodec || formatConfig.codec);
  }

  // 采样率
  if (options.sampleRate) {
    args.push('-ar', options.sampleRate.toString());
  }

  // 声道
  if (options.channels) {
    args.push('-ac', options.channels.toString());
  }

  // 比特率
  if (options.bitrate) {
    args.push('-b:a', options.bitrate);
  }

  // 音量
  if (options.volume !== undefined) {
    args.push('-af', `volume=${options.volume}`);
  }

  // 覆盖输出文件
  args.push('-y', outputFile);

  return args;
}

/**
 * 执行 FFmpeg 命令
 */
export async function executeFFmpeg(
  args: string[],
  inputFile: File,
  outputFileName: string,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<Blob> {
  // 确保 FFmpeg 已加载
  await ffmpegManager.load();
  
  const ffmpeg = ffmpegManager.getInstance();
  
  // 设置进度回调
  ffmpegManager.setProgressCallback((progress) => {
    onProgress?.(progress);
  });

  try {
    // 写入输入文件
    const inputData = await fetchFile(inputFile);
    await ffmpeg.writeFile(inputFile.name, inputData);

    if (signal?.aborted) {
      throw new Error('Conversion aborted');
    }

    // 执行转换
    await ffmpeg.exec(args);

    if (signal?.aborted) {
      throw new Error('Conversion aborted');
    }

    // 读取输出文件
    const outputData = await ffmpeg.readFile(outputFileName);
    
    // 清理文件
    try {
      await ffmpeg.deleteFile(inputFile.name);
      await ffmpeg.deleteFile(outputFileName);
    } catch {
      // 忽略清理错误
    }

    // 转换为 Blob
    const outputBytes = outputData as Uint8Array;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = new Blob([(outputBytes.buffer as any)], { 
      type: getMimeTypeFromExtension(outputFileName) 
    });

    return blob;
  } catch (error) {
    // 清理文件
    try {
      await ffmpeg.deleteFile(inputFile.name);
      await ffmpeg.deleteFile(outputFileName);
    } catch {
      // 忽略清理错误
    }
    
    throw error;
  } finally {
    ffmpegManager.setProgressCallback(null);
  }
}

/**
 * 从扩展名获取 MIME 类型
 */
function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    ogv: 'video/ogg',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    gif: 'image/gif',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    aac: 'audio/aac',
    flac: 'audio/flac',
    m4a: 'audio/mp4',
    weba: 'audio/webm',
  };
  
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

/**
 * 获取视频信息（使用 ffprobe 需要额外加载，这里简化处理）
 */
export async function getVideoInfo(_file: File): Promise<{
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  bitrate?: number;
  codec?: string;
}> {
  // 简化实现：返回基本信息
  // 实际实现需要使用 ffprobe 或浏览器 API
  return {
    duration: undefined,
    width: undefined,
    height: undefined,
  };
}

/**
 * 验证视频文件
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const validTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
  ];
  
  if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv)$/i)) {
    return { valid: false, error: '不支持的视频格式' };
  }
  
  return { valid: true };
}

/**
 * 验证音频文件
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const validTypes = [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/flac',
    'audio/mp4',
    'audio/webm',
  ];
  
  if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|aac|flac|m4a|wma|weba)$/i)) {
    return { valid: false, error: '不支持的音频格式' };
  }
  
  return { valid: true };
}

/**
 * 生成输出文件名
 */
export function generateOutputFilename(
  inputFilename: string,
  outputFormat: VideoFormat | AudioFormat
): string {
  const baseName = inputFilename.replace(/\.[^/.]+$/, '');
  const formatConfig = 
    SUPPORTED_FORMATS.video[outputFormat as VideoFormat] || 
    SUPPORTED_FORMATS.audio[outputFormat as AudioFormat];
  const ext = formatConfig?.ext || outputFormat;
  return `${baseName}_converted.${ext}`;
}

/**
 * 获取推荐的 CRF 值
 */
export function getRecommendedCRF(quality: 'low' | 'medium' | 'high'): number {
  switch (quality) {
    case 'low':
      return 28; // 较小文件，较低质量
    case 'medium':
      return 23; // 平衡
    case 'high':
      return 18; // 较高质量，较大文件
    default:
      return 23;
  }
}

/**
 * 获取推荐的音频比特率
 */
export function getRecommendedAudioBitrate(quality: 'low' | 'medium' | 'high'): string {
  switch (quality) {
    case 'low':
      return '96k';
    case 'medium':
      return '192k';
    case 'high':
      return '320k';
    default:
      return '192k';
  }
}
