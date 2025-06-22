"use client";

import type React from "react";
import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
} from "react";

import { uploadLeidingPhoto } from "~/utils/data";

// Types
export type FileMetadata = {
  name: string;
  size: number;
  type: string;
  url: string;
  id: string;
};

export type FileWithPreview = {
  file: File | FileMetadata;
  id: string;
  preview?: string;
};

export type FileUploadOptions = {
  leidingId?: string; // required for Supabase
  onSuccess?: (url: string) => void; // updates parent
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  initialFiles?: FileMetadata[];
  onFilesChange?: (files: FileWithPreview[]) => void;
  onFilesAdded?: (addedFiles: FileWithPreview[]) => void;
};

export type FileUploadState = {
  files: FileWithPreview[];
  isDragging: boolean;
  errors: string[];
};

export type FileUploadActions = {
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  clearErrors: () => void;
  handleDragEnter: (e: DragEvent<HTMLElement>) => void;
  handleDragLeave: (e: DragEvent<HTMLElement>) => void;
  handleDragOver: (e: DragEvent<HTMLElement>) => void;
  handleDrop: (e: DragEvent<HTMLElement>) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  openFileDialog: () => void;
  getInputProps: (
    props?: InputHTMLAttributes<HTMLInputElement>
  ) => InputHTMLAttributes<HTMLInputElement> & {
    ref: React.Ref<HTMLInputElement>;
  };
};

export const useFileUpload = (
  options: FileUploadOptions = {}
): [
  FileUploadState,
  FileUploadActions,
  (file: File) => Promise<void>,
  boolean,
  string | null,
  string | null
] => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    maxFiles = Infinity,
    maxSize = Infinity,
    accept = "*",
    multiple = false,
    initialFiles = [],
    leidingId,
    onSuccess,
    onFilesChange,
    onFilesAdded,
  } = options;

  const [state, setState] = useState<FileUploadState>({
    files: initialFiles.map((file) => ({
      file,
      id: file.id,
      preview: file.url,
    })),
    isDragging: false,
    errors: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File | FileMetadata): string | null => {
      if (file.size > maxSize) {
        return `Bestand "${file.name}" is groter dan ${formatBytes(maxSize)}.`;
      }

      if (accept !== "*") {
        const acceptedTypes = accept.split(",").map((type) => type.trim());
        const fileType = file instanceof File ? file.type : file.type;
        const extension = file.name.split(".").pop();
        const fileExt = `.${extension}`;

        const isAccepted = acceptedTypes.some((type) => {
          if (type.startsWith(".")) return fileExt.toLowerCase() === type.toLowerCase();
          if (type.endsWith("/*")) return fileType.startsWith(type.split("/")[0]);
          return fileType === type;
        });

        if (!isAccepted) {
          return `Bestand "${file.name}" is geen toegelaten type.`;
        }
      }

      return null;
    },
    [accept, maxSize]
  );

  const createPreview = useCallback((file: File | FileMetadata): string | undefined => {
    return file instanceof File ? URL.createObjectURL(file) : file.url;
  }, []);

  const generateUniqueId = useCallback((file: File | FileMetadata): string => {
    return file instanceof File
      ? `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      : file.id;
  }, []);

  const clearFiles = useCallback(() => {
    setState((prev) => {
      prev.files.forEach((file) => {
        if (file.preview && file.file instanceof File && file.file.type.startsWith("image/")) {
          URL.revokeObjectURL(file.preview);
        }
      });

      if (inputRef.current) inputRef.current.value = "";

      const newState = { ...prev, files: [], errors: [] };
      onFilesChange?.([]);
      return newState;
    });
  }, [onFilesChange]);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      if (!newFiles?.length) return;
      const newFilesArray = Array.from(newFiles);
      const errors: string[] = [];

      if (!multiple) clearFiles();

      if (multiple && maxFiles !== Infinity && state.files.length + newFilesArray.length > maxFiles) {
        errors.push(`Je kan maximaal ${maxFiles} bestand(en) uploaden.`);
        setState((prev) => ({ ...prev, errors }));
        return;
      }

      const validFiles: FileWithPreview[] = [];

      newFilesArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push({
            file,
            id: generateUniqueId(file),
            preview: createPreview(file),
          });
        }
      });

      if (validFiles.length > 0) {
        onFilesAdded?.(validFiles);
        setState((prev) => {
          const files = !multiple ? validFiles : [...prev.files, ...validFiles];
          onFilesChange?.(files);
          return { ...prev, files, errors };
        });
      } else if (errors.length > 0) {
        setState((prev) => ({ ...prev, errors }));
      }

      if (inputRef.current) inputRef.current.value = "";
    },
    [
      multiple,
      maxFiles,
      state.files.length,
      validateFile,
      createPreview,
      generateUniqueId,
      clearFiles,
      onFilesAdded,
      onFilesChange,
    ]
  );

  const removeFile = useCallback((id: string) => {
    setState((prev) => {
      const updated = prev.files.filter((file) => file.id !== id);
      onFilesChange?.(updated);
      return { ...prev, files: updated, errors: [] };
    });
  }, [onFilesChange]);

  const clearErrors = useCallback(() => {
    setState((prev) => ({ ...prev, errors: [] }));
  }, []);

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setState((prev) => ({ ...prev, isDragging: false }));

      if (e.dataTransfer.files?.length) {
        addFiles(multiple ? e.dataTransfer.files : [e.dataTransfer.files[0]]);
      }
    },
    [addFiles, multiple]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        addFiles(e.target.files);
      }
    },
    [addFiles]
  );

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const getInputProps = useCallback(
    (props: InputHTMLAttributes<HTMLInputElement> = {}) => ({
      ...props,
      type: "file" as const,
      onChange: handleFileChange,
      accept: props.accept || accept,
      multiple: props.multiple ?? multiple,
      ref: inputRef,
    }),
    [accept, multiple, handleFileChange]
  );

  const uploadFile = async (file: File) => {
    if (!leidingId) {
      console.warn("[Upload] ❌ Missing leidingId – upload aborted.");
      return;
    }

    console.log("[Upload] 🟡 Starting upload:", file);

    try {
      setLoading(true);
      setError(null);

      const url = await uploadLeidingPhoto(file, leidingId);
      console.log("[Upload] ✅ Upload successful. Returned URL:", url);

      setPreviewUrl(url);
      onSuccess?.(url); // Updates parent (edit-user.tsx)
    } catch (err: any) {
      console.error("[Upload] ❌ Upload failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return [
    state,
    {
      addFiles,
      removeFile,
      clearFiles,
      clearErrors,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      openFileDialog,
      getInputProps,
    },
    uploadFile,      // ✅ this is index [2]
    loading,
    error,
    previewUrl,
  ]
};

// Human-readable file size
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};