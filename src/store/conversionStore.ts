import { create } from 'zustand';
import type { ConversionFile, ConversionResult } from '@/types';

interface ConversionState {
  files: ConversionFile[];
  currentConversion: ConversionResult | null;
  isConverting: boolean;
  progress: number;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  setProgress: (progress: number) => void;
  setConversionResult: (result: ConversionResult) => void;
  reset: () => void;
}

export const useConversionStore = create<ConversionState>((set) => ({
  files: [],
  currentConversion: null,
  isConverting: false,
  progress: 0,
  addFiles: (newFiles) =>
    set((state) => ({
      files: [
        ...state.files,
        ...newFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        })),
      ],
    })),
  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    })),
  setProgress: (progress) => set({ progress }),
  setConversionResult: (result) => set({ currentConversion: result, isConverting: false }),
  reset: () => set({ files: [], currentConversion: null, isConverting: false, progress: 0 }),
}));
