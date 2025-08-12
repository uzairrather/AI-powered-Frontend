import React, { useRef, useState } from "react";
import {
  Play,
  Clock,
  Tag,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Video {
  gridfsId: any;
  _id: string;
  filename: string;
  originalname: string;
  contentType: string;
  size: number;
  transcription: string;
  tags: string[];
  processing_status: "uploading" | "processing" | "completed" | "error";
  uploaded_at: string;
  thumbnailId?: string;
}

interface VideoGridProps {
  videos: Video[];
  selectedVideos: string[];
  onVideoSelect: (videoId: string) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  selectedVideos,
  onVideoSelect,
}) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const togglePlay = (videoId: string) => {
    const videoElement = videoRefs.current[videoId];
    if (!videoElement) return;

    if (playingVideoId === videoId) {
      if (videoElement.paused) {
        videoElement.play();
      } else {
        videoElement.pause();
      }
    } else {
      // Pause any other playing video
      if (playingVideoId && videoRefs.current[playingVideoId]) {
        videoRefs.current[playingVideoId]?.pause();
      }
      setPlayingVideoId(videoId);
      videoElement.play();
    }
  };

  const toggleMute = (videoId: string) => {
    const videoElement = videoRefs.current[videoId];
    if (!videoElement) return;
    videoElement.muted = !videoElement.muted;
    setIsMuted(videoElement.muted);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />;
    }
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          No videos found
        </h3>
        <p className="text-gray-400">Upload your first video to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div
          key={video._id}
          className={`relative bg-white/5 rounded-xl border transition-all hover:scale-105 ${
            selectedVideos.includes(video._id)
              ? "border-purple-400 bg-purple-500/10"
              : "border-white/10 hover:border-white/20"
          }`}
          onClick={() => onVideoSelect(video._id)}
        >
          {/* Video Container */}
          <div
            className="aspect-video bg-black rounded-t-xl relative overflow-hidden group"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={(el) => (videoRefs.current[video._id] = el)}
              muted={isMuted}
              controls
              className="w-full h-full object-cover"
              src={`${API_URL}/api/videos/${video.gridfsId}`}
              onPlay={() => setPlayingVideoId(video._id)}
              onPause={() =>
                setPlayingVideoId((id) => (id === video._id ? null : id))
              }
            >
              Your browser does not support the video tag.
            </video>

            {/* Controls Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => togglePlay(video._id)}
                className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20"
              >
                {playingVideoId === video._id &&
                !videoRefs.current[video._id]?.paused ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </button>
              <button
                onClick={() => toggleMute(video._id)}
                className="ml-4 bg-white/10 text-white p-2 rounded-full hover:bg-white/20"
              >
                {isMuted ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </button>
            </div>

            <div className="absolute top-3 right-3 flex items-center space-x-1">
              {getStatusIcon(video.processing_status)}
            </div>
            {selectedVideos.includes(video._id) && (
              <div className="absolute top-3 left-3 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                ✓
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-medium text-white truncate">
                {video.originalname}
              </h3>
              <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(video.uploaded_at)}</span>
                </span>
                <span>{formatFileSize(video.size)}</span>
              </div>
            </div>

            <div
              className={`text-xs px-2 py-1 rounded-full inline-flex items-center space-x-1 ${
                video.processing_status === "completed"
                  ? "bg-green-500/20 text-green-300"
                  : video.processing_status === "processing"
                  ? "bg-blue-500/20 text-blue-300"
                  : video.processing_status === "error"
                  ? "bg-red-500/20 text-red-300"
                  : "bg-gray-500/20 text-gray-300"
              }`}
            >
              {getStatusIcon(video.processing_status)}
              <span className="capitalize">{video.processing_status}</span>
            </div>

            {video.tags && video.tags.length > 0 && (
              <div className="flex items-start space-x-2">
                <Tag className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {video.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {video.tags.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{video.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {video.transcription && (
              <div className="flex items-start space-x-2">
                <FileText className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-300 line-clamp-2">
                  {video.transcription.substring(0, 600)}...
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
