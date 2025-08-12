import React, { useState, useRef } from 'react';
import { Upload, Check, AlertCircle, Loader2 } from 'lucide-react';

interface VideoUploadProps {
  onUpload: () => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUpload }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files: FileList) => {
  const file = files[0];
  if (!file) return;

  const isMedia = file.type.startsWith('video/') || file.type.startsWith('image/');
  if (!isMedia) {
    setUploadStatus('error');
    setTimeout(() => setUploadStatus('idle'), 3000);
    return;
  }

  setUploading(true);
  setUploadStatus('idle');

  try {
    const formData = new FormData();
    formData.append('video', file); // You can keep this as 'video' if backend accepts both

    const response = await fetch(`${API_URL}/api/videos/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    setUploadStatus('success');
    onUpload();
    setTimeout(() => setUploadStatus('idle'), 3000);

  } catch (error) {
    console.error('Upload Error:', error);
    setUploadStatus('error');
    setTimeout(() => setUploadStatus('idle'), 3000);
  } finally {
    setUploading(false);
  }
};



  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? 'border-purple-400 bg-purple-500/10'
            : 'border-gray-600 hover:border-gray-500'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          {uploading ? (
            <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
          ) : uploadStatus === 'success' ? (
            <Check className="h-12 w-12 text-green-400" />
          ) : uploadStatus === 'error' ? (
            <AlertCircle className="h-12 w-12 text-red-400" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}

          <div>
            {uploading ? (
              <p className="text-lg font-medium text-gray-300">Uploading and processing...</p>
            ) : uploadStatus === 'success' ? (
              <p className="text-lg font-medium text-green-400">Video uploaded successfully!</p>
            ) : uploadStatus === 'error' ? (
              <p className="text-lg font-medium text-red-400">Upload failed. Please try again.</p>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-300">Drop your video here or click to browse</p>
                <p className="text-sm text-gray-400 mt-2">Supports MP4, MOV, AVI and more (max 500MB)</p>
              </>
            )}
          </div>
        </div>
      </div>

      {uploadStatus === 'idle' && (
        <div className="mt-4 text-xs text-gray-400">
          <p>• Videos are automatically transcribed using Groq ASR</p>
          <p>• AI tags are generated for better searchability</p>
          <p>• All data is stored securely in MongoDB</p>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
