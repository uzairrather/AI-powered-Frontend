import { useState, useEffect } from "react";
import { Upload, Search, Video, Sparkles, Loader2, Brain } from "lucide-react";
import VideoUpload from "./components/VideoUpload";
import VideoGrid from "./components/VideoGrid";
import SearchBar from "./components/SearchBar";
import StoryList from "./components/StoryList";
import MemoryEngine from "./components/MemoryEngine";
import EnhancedStoryGenerator from "./components/EnhancedStoryGenerator";

interface Video {
  _id: string;
  filename: string;
  originalname: string;
  contentType: string;
  size: number;
  gridfsId: string;
  transcription: string;
  tags: string[];
  processing_status: "uploading" | "processing" | "completed" | "error";
  uploaded_at: string;
  // 🆕 New AI-enhanced fields
  ai_tags?: Array<{
    category: string;
    tags: string[];
    confidence: number;
  }>;
  emotional_analysis?: {
    overall_mood: string;
    emotional_peaks: Array<{
      timestamp: string;
      emotion: string;
      intensity: number;
    }>;
    sentiment_score: number;
  };
  memory_metadata?: {
    location: string;
    date_recorded: Date;
    people_present: string[];
    occasion: string;
    significance: string;
    privacy_level: string;
  };
  search_metadata?: {
    keywords: string[];
    description: string;
    highlights: string[];
  };
}

interface Story {
  _id: string;
  title: string;
  description: string;
  narrative: string;
  clips: Video[];
  created_at: string;
  // 🆕 New story fields
  prompt?: {
    theme: string;
    style: string;
    tone: string;
    user_prompt: string;
    target_duration: number;
  };
  story_type?: string;
  emotional_journey?: {
    enabled: boolean;
    contrast_type: string;
    positive_clips: string[];
    negative_clips: string[];
  };
  story_metadata?: {
    total_duration: number;
    clip_count: number;
    emotional_arc: {
      start_mood: string;
      end_mood: string;
      peak_moment: string;
    };
    themes: string[];
    music_suggestion: string;
    color_palette: string;
  };
  sharing?: {
    is_public: boolean;
    share_url: string;
    view_count: number;
    likes: string[];
    comments: Array<{
      user: string;
      text: string;
      created_at: string;
    }>;
  };
  ai_generation?: {
    model_used: string;
    generation_time: number;
    confidence_score: number;
    revision_count: number;
  };
}

function App() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [activeTab, setActiveTab] = useState<"videos" | "stories" | "memories">(
    "videos"
  );
  const [videos, setVideos] = useState<Video[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/user`, {
        credentials: "include", // ✅ ensures cookie session is sent
      });
      if (response.ok) {
        const data = await response.json();
        // console.log("✅ Authenticated user:", data);
        setUser(data);
        await fetchVideos();
        await fetchStories();
      } else {
        window.location.href = `${API_URL}/auth/google`;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      window.location.href = `${API_URL}/auth/google`;
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/videos`, {
        credentials: "include",
      });
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/stories`, {
        credentials: "include",
      });
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      fetchVideos();
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/videos/search?q=${encodeURIComponent(
          query
        )}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      } else {
        console.error("Search request failed:", response.status);
        // Fallback to client-side filtering if API fails
        fetchVideos();
      }
    } catch (error) {
      console.error("Error searching videos:", error);
      // Fallback to client-side filtering if API fails
      fetchVideos();
    }
  };

  const handleVideoUpload = () => {
    fetchVideos();
  };

  const handleStoryGenerated = () => {
    fetchStories();
    setSelectedVideos([]);
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleLogout = () => {
    window.location.href = `${API_URL}/auth/logout`;
  };

  const filteredVideos = videos.filter((video) => {
    const query = searchQuery.toLowerCase();

    return (
      searchQuery === "" ||
      video.originalname?.toLowerCase().includes(query) ||
      video.transcription?.toLowerCase().includes(query) ||
      (Array.isArray(video.tags) &&
        video.tags.some((tag) => tag?.toLowerCase().includes(query))) ||
      (Array.isArray(video.ai_tags) &&
        video.ai_tags.some(
          (aiTag) =>
            Array.isArray(aiTag.tags) &&
            aiTag.tags.some((tag) => tag?.toLowerCase().includes(query))
        )) ||
      (Array.isArray(video.search_metadata?.keywords) &&
        video.search_metadata.keywords.some((keyword) =>
          keyword?.toLowerCase().includes(query)
        )) ||
      video.search_metadata?.description?.toLowerCase().includes(query) ||
      video.memory_metadata?.occasion?.toLowerCase().includes(query) ||
      (Array.isArray(video.memory_metadata?.people_present) &&
        video.memory_metadata.people_present.some((person) =>
          person?.toLowerCase().includes(query)
        ))
    );
  });

  // ✅ Automatic polling for processing videos
  useEffect(() => {
    const interval = setInterval(async () => {
      const hasProcessing = videos.some(
        (v) => v.processing_status === "processing"
      );
      if (!hasProcessing) {
        clearInterval(interval);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/videos`, {
          credentials: "include",
        });
        const data = await response.json();
        setVideos(data);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [videos]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <Loader2 className="h-8 w-8 animate-spin mr-2" /> Checking
        authentication...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-700
">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  AI Video Studio
                </h1>
                <p className="text-xs text-gray-300">
                  Powered by Groq & MongoDB
                </p>
              </div>
            </div>

            {/* ✅ Navigation + User Info */}
            <div className="flex items-center space-x-4">
              {/* Navigation Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveTab("videos")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === "videos"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4" />
                    <span>Videos</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("stories")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === "stories"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Stories</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("memories")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === "memories"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>Memories</span>
                  </div>
                </button>
              </div>

              {/* User Info + Logout */}
              {user && (
                <div className="flex items-center space-x-3">
                  <img
                    src={user.photo} //  Updated
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-white">{user.displayName}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "videos" ? (
          <div className="space-y-8">
            {/* Upload Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <Upload className="h-6 w-6 text-purple-400" />
                <span>Upload Videos</span>
              </h2>
              <VideoUpload onUpload={handleVideoUpload} />
            </div>

            {/* Search Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <Search className="h-6 w-6 text-blue-400" />
                <span>Search Videos</span>
              </h2>
              <SearchBar onSearch={handleSearch} />
              {searchQuery && (
                <p className="text-gray-300 mt-2">
                  {filteredVideos.length} result
                  {filteredVideos.length !== 1 ? "s" : ""} for "{searchQuery}"
                </p>
              )}
            </div>

            {/* Enhanced Story Generation */}
            {selectedVideos.length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Sparkles className="h-6 w-6 text-green-400" />
                  <span>AI Story Creation</span>
                </h2>
                <div className="mb-4">
                  <p className="text-gray-300">
                    {selectedVideos.length} video
                    {selectedVideos.length !== 1 ? "s" : ""} selected
                  </p>
                </div>
                <EnhancedStoryGenerator
                  selectedVideos={selectedVideos}
                  onStoryGenerated={handleStoryGenerated}
                />
              </div>
            )}

            {/* Videos Grid */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Video className="h-6 w-6 text-purple-400" />
                  <span>Your Videos</span>
                </h2>
                {selectedVideos.length > 0 && (
                  <button
                    onClick={() => setSelectedVideos([])}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                  <span className="ml-2 text-gray-300">Loading videos...</span>
                </div>
              ) : (
                <VideoGrid
                  videos={filteredVideos}
                  selectedVideos={selectedVideos}
                  onVideoSelect={toggleVideoSelection}
                />
              )}
            </div>
          </div>
        ) : activeTab === "stories" ? (
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-green-400" />
                <span>AI-Generated Stories</span>
              </h2>
              <StoryList stories={stories} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Brain className="h-6 w-6 text-blue-400" />
                <span>Memory Engine</span>
              </h2>
              <MemoryEngine />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
