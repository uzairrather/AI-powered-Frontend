import { useState, useEffect } from 'react';
import { Brain, Search, TrendingUp, Users, MapPin, Calendar, Heart } from 'lucide-react';
// import {API_BASE_URL} from "../constants/config";
interface MemoryInsights {
  total_memories: number;
  time_period: {
    start: string;
    end: string;
    span: number;
  };
  emotional_summary: {
    moodCounts: Record<string, number>;
    dominantMood: string;
  };
  people_summary: Record<string, number>;
  location_summary: Record<string, number>;
  occasion_summary: Record<string, number>;
  memory_density: {
    total_memories: number;
    unique_days: number;
    average_per_day: number;
  };
  suggested_themes: string[];
}

interface NostalgicTheme {
  title: string;
  description: string;
  prompt: string;
  related_memories: string[];
  emotional_tone: string;
}

interface MemorySearchResult {
  videos: any[];
  stories: any[];
  total_results: number;
  search_query: string;
  filters_applied: any;
}

export default function MemoryEngine() {
  const [insights, setInsights] = useState<MemoryInsights | null>(null);
  const [nostalgicThemes, setNostalgicThemes] = useState<NostalgicTheme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MemorySearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'search' | 'nostalgic'>('insights');

  useEffect(() => {
    fetchMemoryInsights();
    fetchNostalgicSuggestions();
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const fetchMemoryInsights = async () => {
    try {
    const response = await fetch(`${API_URL}/api/videos/memories/insights`, {
        credentials: 'include',
      });
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching memory insights:', error);
    }
  };

  const fetchNostalgicSuggestions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/videos/memories/nostalgic-suggestions`, {
        credentials: 'include',
      });
      const data = await response.json();
      setNostalgicThemes(data.nostalgic_themes || []);
    } catch (error) {
      console.error('Error fetching nostalgic suggestions:', error);
    }
  };

  const handleMemorySearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/videos/memories/search?query=${encodeURIComponent(searchQuery)}`,
        {
          credentials: 'include',
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood: string) => {
    const colors = {
      happy: 'text-green-400',
      sad: 'text-blue-400',
      excited: 'text-yellow-400',
      calm: 'text-purple-400',
      tense: 'text-red-400',
      neutral: 'text-gray-400'
    };
    return colors[mood as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Memory Engine</h2>
            <p className="text-gray-300">Your personal memory archive and insights</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'insights'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Insights</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('nostalgic')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'nostalgic'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Nostalgic</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'insights' && insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Memory Overview */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Memory Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Memories:</span>
                <span className="text-white font-semibold">{insights.total_memories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Time Span:</span>
                <span className="text-white font-semibold">{insights.time_period.span} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Avg per Day:</span>
                <span className="text-white font-semibold">
                  {insights.memory_density.average_per_day.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Emotional Patterns */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Emotional Patterns</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Dominant Mood:</span>
                <span className={`font-semibold ${getMoodColor(insights.emotional_summary.dominantMood)}`}>
                  {insights.emotional_summary.dominantMood}
                </span>
              </div>
              {Object.entries(insights.emotional_summary.moodCounts).map(([mood, count]) => (
                <div key={mood} className="flex justify-between">
                  <span className="text-gray-300 capitalize">{mood}:</span>
                  <span className="text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* People Network */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">People Network</h3>
            <div className="space-y-2">
              {Object.entries(insights.people_summary)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([person, count]) => (
                  <div key={person} className="flex justify-between">
                    <span className="text-gray-300">{person}</span>
                    <span className="text-white">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Suggested Themes */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold text-white mb-4">Suggested Story Themes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {insights.suggested_themes.map((theme, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-3 text-center"
                >
                  <span className="text-white text-sm font-medium">{theme}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search Interface */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Search Your Memories</h3>
            <div className="flex space-x-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for people, places, emotions, or moments..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleMemorySearch()}
              />
              <button
                onClick={handleMemorySearch}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults && (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Search Results ({searchResults.total_results})
              </h3>
              <p className="text-gray-300 mb-4">
                Found {searchResults.total_results} results for "{searchResults.search_query}"
              </p>
              
              <div className="space-y-4">
                {searchResults.videos.map((video) => (
                  <div key={video._id} className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium">{video.originalname}</h4>
                    <p className="text-gray-300 text-sm mt-1">{video.transcription}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                      <span>Mood: {video.emotional_analysis?.overall_mood || 'neutral'}</span>
                      <span>Location: {video.memory_metadata?.location || 'unknown'}</span>
                      <span>Occasion: {video.memory_metadata?.occasion || 'general'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'nostalgic' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Nostalgic Story Suggestions</h3>
            <p className="text-gray-300 mb-6">
              Let AI suggest nostalgic story themes based on your memories
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {nostalgicThemes.map((theme, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-6">
                  <h4 className="text-white font-semibold text-lg mb-2">{theme.title}</h4>
                  <p className="text-gray-300 text-sm mb-4">{theme.description}</p>
                  <div className="flex items-center space-x-2 mb-4">
                    <Heart className="h-4 w-4 text-pink-400" />
                    <span className="text-pink-400 text-sm capitalize">{theme.emotional_tone}</span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                    Create Story
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}








