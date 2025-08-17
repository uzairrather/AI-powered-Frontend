import React from "react";
import { Calendar, Video, FileText, Sparkles } from "lucide-react";

interface StoryClip {
  transcription?: string;
  gridfsId?: string;
  _id?: string;
}

interface Story {
  _id: string;
  title: string;
  description: string;
  narrative: string;
  clips: StoryClip[];
  created_at: string;
  rendered_video_id?: string;
}

interface StoryListProps {
  stories: Story[];
}

const StoryList: React.FC<StoryListProps> = ({ stories }) => {
  const [openVideoId, setOpenVideoId] = React.useState<string | null>(null);
 const API_URL = (() => {
  const fromEnv = import.meta.env?.VITE_API_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  return isLocal ? 'http://localhost:5000' : window.location.origin;
})();


  const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const cleanNarrative = (text: string) => {
  return text.replace(/Clip\s*\d+:\s*/gi, '').trim();
};


  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          No stories created yet
        </h3>
        <p className="text-gray-400">
          Select some videos and generate your first AI story
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stories.map((story) => (
        <div
          key={story._id}
          className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span>{story.title}</span>
              </h3>
              {story.description && (
                <p className="text-gray-300 mb-3">{story.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(story.created_at)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Video className="h-4 w-4" />
                  <span>
                    {story.clips.length} video
                    {story.clips.length !== 1 ? "s" : ""}
                  </span>
                </span>
              </div>
            </div>
            <button
              className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              onClick={() =>
                setOpenVideoId(openVideoId === story._id ? null : story._id)
              }
            >
              {openVideoId === story._id ? 'Hide Video' : 'Watch Story Video'}
            </button>
          </div>

          {openVideoId === story._id && (
            <div className="mb-4">
              {story.rendered_video_id ? (
                <video
                  controls
                  autoPlay
                  className="w-full rounded-lg border border-white/10 bg-black"
                  src={`${API_URL}/api/stories/${story._id}/video`}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                story.clips && story.clips[0] && (story.clips[0].gridfsId || story.clips[0]._id) ? (
                  <video
                    controls
                    autoPlay
                    className="w-full rounded-lg border border-white/10 bg-black"
                    src={
                      story.clips[0].gridfsId
                        ? `${API_URL}/api/videos/${story.clips[0].gridfsId}`
                        : `${API_URL}/api/videos/${story.clips[0]._id}/stream`
                    }
                  >
                    Your browser does not support the video tags
                  </video>
                ) : (
                  <div className="w-full rounded-lg border border-yellow-600/40 bg-yellow-500/10 p-4 text-yellow-200">
                    Story video is still rendering. Please check again in a moment or refresh.
                  </div>
                )
              )}
            </div>
          )}

          {/* ✅ Transcription Section */}
          {story.clips.length > 0 && (
            <div className="bg-black/20 rounded-lg p-4 border border-white/5 mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">
                  Transcription
                </span>
              </div>
              <div className="prose prose-invert max-w-none">
                {story.clips.map((clip, index) => (
                  <div
                    key={index}
                    className="text-gray-300 text-sm leading-relaxed whitespace-pre-line mb-2"
                  >
                    <strong className="block mb-1 text-white/80">
                      Clip {index + 1}:
                    </strong>
                    {clip.transcription
                      ? clip.transcription
                      : "No transcription available."}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ AI Narrative Section */}
          <div className="bg-black/20 rounded-lg p-4 border border-white/5">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">
                AI-Generated Narrative
              </span>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {cleanNarrative(story.narrative)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StoryList;
