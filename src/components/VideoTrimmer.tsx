import { useState, useRef,  } from 'react';

interface VideoTrimmerProps {
  videoUrl: string;
  onTrim: (start: number, end: number) => void;
  duration: number;
}

export const VideoTrimmer = ({ videoUrl, onTrim, duration }: VideoTrimmerProps) => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(duration);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTrim = () => {
    onTrim(startTime, endTime);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Trim Your Video</h3>
      
      <video 
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full mb-4 rounded"
      />
      
      <div className="mb-4">
        <label className="block mb-2">Start Time (seconds):</label>
        <input
          type="range"
          min="0"
          max={duration}
          step="0.1"
          value={startTime}
          onChange={(e) => setStartTime(parseFloat(e.target.value))}
          className="w-full"
        />
        <span>{startTime.toFixed(1)}s</span>
      </div>

      <div className="mb-4">
        <label className="block mb-2">End Time (seconds):</label>
        <input
          type="range"
          min="0"
          max={duration}
          step="0.1"
          value={endTime}
          onChange={(e) => setEndTime(parseFloat(e.target.value))}
          className="w-full"
        />
        <span>{endTime.toFixed(1)}s</span>
      </div>

      <button
        onClick={handleTrim}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Confirm Trim
      </button>
    </div>
  );
};