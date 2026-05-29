/**
 * ConvertSafely - AudioConverter Page
 * 音频格式转换页面 - 使用 FFmpeg.wasm 进行音频转换
 */

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUpload,
  FiMusic,
  FiDownload,
  FiX,
  FiSettings,
  FiCheck,
  FiAlertCircle,
  FiLoader,
  FiTrash2,
  FiPlay,
  FiMic,
} from 'react-icons/fi';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

import { useSubscription } from '@/hooks/useSubscription';
import type { ConversionFile, ConversionResult } from '@/types';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { formatFileSize } from '@/utils/constants';

import {
  convertSingleAudio,
  ffmpegManager,
  SUPPORTED_AUDIO_FORMATS,
  type AudioFormat,
  type AudioConverterOptions,
} from '@/converters/video/audioConverter';

// 转换状态类型
type ConversionStatus = 'idle' | 'loading-ffmpeg' | 'converting' | 'completed' | 'error';

export default function AudioConverter() {
  // 订阅状态
  const { limits, canPerformConversion, validateFileSize, incrementUsage, getValidationError } = useSubscription();
  
  // 本地状态
  const [files, setFiles] = useState<ConversionFile[]>([]);
  const [outputFormat, setOutputFormat] = useState<AudioFormat>('mp3');
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  // 预加载 FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        await ffmpegManager.load();
        setFfmpegLoaded(true);
      } catch (err) {
        console.error('Failed to load FFmpeg:', err);
        toast.error('FFmpeg 加载失败，请刷新页面重试');
      }
    };
    loadFFmpeg();
  }, []);

  // 支持的格式
  const supportedFormats = SUPPORTED_AUDIO_FORMATS;

  // 文件上传处理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validationError = getValidationError(files.length + acceptedFiles.length);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const validFiles: ConversionFile[] = [];
    for (const file of acceptedFiles) {
      if (!validateFileSize(file.size)) {
        toast.error(`${file.name}: 文件大小超过 ${limits.maxFileSizeMB}MB 限制`);
        continue;
      }

      // 验证音频文件
      const validAudioTypes = [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/aac',
        'audio/flac',
        'audio/mp4',
        'audio/webm',
      ];
      
      if (!validAudioTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|aac|flac|m4a|wma|weba)$/i)) {
        toast.error(`${file.name}: 不支持的音频格式`);
        continue;
      }

      validFiles.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setStatus('idle');
    setResults([]);
    setError(null);
  }, [files.length, limits.maxFileSizeMB, validateFileSize, getValidationError]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.wma', '.weba'],
    },
    maxFiles: limits.batchSize,
  });

  // 移除文件
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setStatus('idle');
  }, []);

  // 清空文件
  const clearFiles = useCallback(() => {
    setFiles([]);
    setResults([]);
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  // 开始转换
  const startConversion = useCallback(async () => {
    if (files.length === 0) {
      toast.error('请先选择要转换的音频');
      return;
    }

    if (!canPerformConversion(files.length)) {
      toast.error('今日转换次数已达上限，请升级订阅计划');
      return;
    }

    if (!ffmpegLoaded) {
      toast.error('FFmpeg 正在加载中，请稍后再试');
      return;
    }

    setStatus('converting');
    setProgress(0);
    setError(null);

    try {
      const options: AudioConverterOptions = {
        outputFormat,
        quality,
      };

      const conversionResults: ConversionResult[] = [];

      for (let i = 0; i < files.length; i++) {
        const result = await convertSingleAudio(
          files[i],
          options,
          undefined,
          (p) => {
            const overallProgress = ((i) / files.length) * 100 + p / files.length;
            setProgress(Math.round(overallProgress));
          }
        );
        conversionResults.push(result);
      }

      setResults(conversionResults);
      setStatus('completed');
      incrementUsage();
      toast.success(`成功转换 ${conversionResults.length} 个音频！`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '转换失败';
      setError(errorMessage);
      setStatus('error');
      toast.error(errorMessage);
    }
  }, [files, outputFormat, quality, canPerformConversion, incrementUsage, ffmpegLoaded]);

  // 下载结果
  const downloadResult = useCallback((result: ConversionResult) => {
    const url = URL.createObjectURL(result.convertedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.outputName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('下载已开始');
  }, []);

  // 下载所有
  const downloadAll = useCallback(() => {
    results.forEach((result, index) => {
      setTimeout(() => downloadResult(result), index * 500);
    });
  }, [results, downloadResult]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          音频格式转换
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          支持 MP3、WAV、OGG、AAC、FLAC、M4A 等格式互转。使用 FFmpeg.wasm 在浏览器本地处理，保护您的隐私。
        </p>
      </div>

      {/* FFmpeg 加载状态 */}
      {!ffmpegLoaded && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <FiLoader className="w-5 h-5 text-yellow-600 animate-spin" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              正在加载 FFmpeg 引擎，首次使用可能需要几秒钟...
            </span>
          </div>
        </div>
      )}

      {/* 订阅限制提示 */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
            <FiSettings className="w-4 h-4" />
            <span>
              今日剩余转换次数: <strong>{limits.remainingConversions === Infinity ? '无限制' : limits.remainingConversions}</strong>
              {' · '}
              文件大小限制: <strong>{limits.maxFileSizeMB}MB</strong>
            </span>
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-300">
            批量上限: <strong>{limits.batchSize}</strong> 个文件
          </div>
        </div>
      </div>

      {/* 上传区域 */}
      {files.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50',
            !ffmpegLoaded && 'opacity-50 pointer-events-none'
          )}
          {...getRootProps() as any}
        >
          <input {...getInputProps()} disabled={!ffmpegLoaded} />
          <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <FiMic className="w-10 h-10 text-primary" />
          </div>
          <p className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {isDragActive ? '释放以上传音频' : '拖拽音频到此处'}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            或点击选择文件
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            支持 MP3, WAV, OGG, AAC, FLAC, M4A, WMA
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            最大 {limits.maxFileSizeMB}MB · 最多 {limits.batchSize} 个文件
          </p>
        </motion.div>
      )}

      {/* 文件列表和设置 */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* 设置面板 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiSettings className="w-5 h-5" />
                转换设置
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 输出格式 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    输出格式
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as AudioFormat)}
                    disabled={status === 'converting'}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  >
                    {supportedFormats.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label} (.{format.extension})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 质量设置 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    音频质量
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        disabled={status === 'converting'}
                        className={clsx(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50',
                          quality === q
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        )}
                      >
                        {q === 'low' && '低 (96kbps)'}
                        {q === 'medium' && '中 (192kbps)'}
                        {q === 'high' && '高 (320kbps)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 提示信息 */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  音频转换速度较快，取决于文件大小。转换过程中请勿关闭页面。
                </p>
              </div>
            </div>

            {/* 文件列表 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  已选择 {files.length} 个文件
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFiles}
                  disabled={status === 'converting'}
                  className="text-red-500 hover:text-red-600"
                >
                  <FiTrash2 className="w-4 h-4 mr-1" />
                  清空
                </Button>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                {files.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 flex items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <FiMusic className="w-8 h-8 text-orange-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFile(file.id)}
                      disabled={status === 'converting'}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 转换进度 */}
            {status === 'converting' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 border border-primary/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FiLoader className="w-6 h-6 text-primary animate-spin" />
                  <span className="font-medium text-gray-900 dark:text-white">正在转换音频...</span>
                </div>
                <Progress value={progress} size="lg" showLabel />
              </motion.div>
            )}

            {/* 错误提示 */}
            {status === 'error' && error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center gap-3">
                  <FiAlertCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">转换失败</p>
                    <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 转换结果 */}
            {status === 'completed' && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <FiCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      转换完成！
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      成功转换 {results.length} 个音频
                    </p>
                  </div>
                </div>

                {/* 结果列表 */}
                <div className="space-y-2 mb-4">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FiMusic className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {result.outputName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(result.convertedBlob.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => downloadResult(result)}
                      >
                        <FiDownload className="w-4 h-4 mr-1" />
                        下载
                      </Button>
                    </div>
                  ))}
                </div>

                {/* 批量下载 */}
                {results.length > 1 && (
                  <Button onClick={downloadAll} className="w-full">
                    <FiDownload className="w-4 h-4 mr-2" />
                    下载所有文件
                  </Button>
                )}
              </motion.div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'audio/*';
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || []);
                    onDrop(files);
                  };
                  input.click();
                }}
                disabled={status === 'converting' || files.length >= limits.batchSize}
              >
                <FiUpload className="w-4 h-4 mr-2" />
                添加更多
              </Button>
              <Button
                className="flex-1"
                onClick={startConversion}
                disabled={status === 'converting' || files.length === 0 || !ffmpegLoaded}
              >
                {status === 'converting' ? (
                  <>
                    <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                    转换中...
                  </>
                ) : (
                  <>
                    <FiPlay className="w-4 h-4 mr-2" />
                    开始转换
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 文件拒绝提示 */}
      {fileRejections.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
        >
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">部分文件无法上传</p>
              <ul className="mt-1 text-sm text-red-600 dark:text-red-300">
                {fileRejections.map(({ file, errors }, index) => (
                  <li key={index}>
                    {file.name}: {errors.map((e) => e.message).join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
