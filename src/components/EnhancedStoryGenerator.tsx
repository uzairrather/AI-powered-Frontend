import { useState, useEffect } from 'react';
import { Sparkles, Heart, Zap, BookOpen, Palette, Music, Settings } from 'lucide-react';

interface StoryPrompt {
  suggested_themes: string[];
  suggested_styles: string[];
  suggested_tones: string[];
  story_prompts: {
    title: string;
    description: string;
    prompt: string;
  }[];
  emotional_journey_options: {
    type: string;
    description: string;
  }[];
}

interface StoryGenerationOptions {
  storyType: 'inspirational' | 'emotional_journey' | 'memory_lane' | 'achievement' | 'family_moment' | 'custom';
  theme: string;
  style: string;
  tone: string;
  emotionalJourney: boolean;
  contrastType: 'good_vs_bad' | 'before_vs_after' | 'struggle_vs_triumph' | 'sadness_vs_joy';
  userPrompt: string;
  clipDuration?: number;
}

interface Props {
  selectedVideos: string[];
  onStoryGenerated: () => void;
}

export default function EnhancedStoryGenerator({ selectedVideos, onStoryGenerated }: Props) {
  const [storyPrompts, setStoryPrompts] = useState<StoryPrompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompts' | 'custom' | 'quick'>('prompts');
  
  
  const [options, setOptions] = useState<StoryGenerationOptions>({
    storyType: 'inspirational',
    theme: 'inspirational',
    style: 'cinematic',
    tone: 'uplifting',
    emotionalJourney: false,
    contrastType: 'good_vs_bad',
    userPrompt: '',
    clipDuration: 30
  });
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; 

  useEffect(() => {
    if (selectedVideos.length > 0) {
      fetchStoryPrompts();
    }
  }, [selectedVideos]);

  const fetchStoryPrompts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/stories/prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          videoIds: selectedVideos,
          userPrompt: options.userPrompt
        }),
      });
      const data = await response.json();
      setStoryPrompts(data);
    } catch (error) {
      console.error('Error fetching story prompts:', error);
    }
  };

  const generateStory = async (customPrompt?: string) => {
    if (selectedVideos.length === 0) return;

    setGenerating(true);
    try {
      // 🆕 Always use /generate endpoint when there's a custom prompt
      // Only use specialized endpoints for quick generation without custom prompts
      const hasCustomPrompt = customPrompt || options.userPrompt;
      const endpoint = hasCustomPrompt ? '/generate' :
                      options.storyType === 'inspirational' ? '/inspirational' :
                      options.storyType === 'emotional_journey' ? '/emotional-journey' : '/generate';

      // 🆕 Generate a consistent title based on user input
      let storyTitle = 'AI Generated Story';
      if (customPrompt) {
        // Use the first sentence or phrase from custom prompt as title
        const firstSentence = customPrompt.split(/[.!?]/)[0].trim();
        if (firstSentence.length > 0 && firstSentence.length < 100) {
          storyTitle = firstSentence;
        }
      } else if (options.userPrompt) {
        // Use the first sentence or phrase from user prompt as title
        const firstSentence = options.userPrompt.split(/[.!?]/)[0].trim();
        if (firstSentence.length > 0 && firstSentence.length < 100) {
          storyTitle = firstSentence;
        }
      } else {
        // Generate title based on story type and theme
        storyTitle = `${options.theme.charAt(0).toUpperCase() + options.theme.slice(1)} ${options.storyType.replace('_', ' ').charAt(0).toUpperCase() + options.storyType.replace('_', ' ').slice(1)}`;
      }

      const requestBody = {
        videoIds: selectedVideos,
        prompt: customPrompt || options.userPrompt,
        title: storyTitle, // 🆕 Pass the generated title
        clipDuration: options.clipDuration,
        storyType: options.storyType,
        theme: options.theme,
        style: options.style,
        tone: options.tone,
        emotionalJourney: options.emotionalJourney,
        contrastType: options.contrastType
      };
      const response = await fetch(`${API_URL}/api/stories${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Story generated successfully:', result);
        onStoryGenerated();
      } else {
        console.error('Failed to generate story');
      }
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleQuickStory = (type: 'inspirational' | 'emotional_journey') => {
    updateOption('storyType', type);
    if (type === 'emotional_journey') {
      updateOption('emotionalJourney', true);
    }
    generateStory();
  };

  const updateOption = (key: keyof StoryGenerationOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-3 text-white">Loading story prompts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Sparkles className="h-8 w-8 text-green-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Enhanced Story Generator</h2>
          <p className="text-gray-300">Create compelling stories with AI-powered creativity</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white/5 backdrop-blur-lg rounded-xl p-1">
        <button
          onClick={() => setActiveTab('prompts')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'prompts'
              ? 'bg-green-500 text-white shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          AI Prompts
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'custom'
              ? 'bg-green-500 text-white shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          Custom
        </button>
        <button
          onClick={() => setActiveTab('quick')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'quick'
              ? 'bg-green-500 text-white shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          Quick
        </button>
      </div>

      {/* AI Prompts Tab */}
      {activeTab === 'prompts' && storyPrompts && (
        <div className="space-y-6">
          {/* Suggested Prompts */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI-Suggested Story Prompts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storyPrompts.story_prompts.map((prompt, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">{prompt.title}</h4>
                  <p className="text-gray-300 text-sm mb-3">{prompt.description}</p>
                  <button
                    onClick={() => generateStory(prompt.prompt)}
                    disabled={generating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                  >
                    {generating ? 'Generating...' : 'Create Story'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Emotional Journey Options */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Emotional Journey Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storyPrompts.emotional_journey_options.map((option, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2 capitalize">{option.type.replace('_', ' ')}</h4>
                  <p className="text-gray-300 text-sm mb-3">{option.description}</p>
                  <button
                    onClick={() => {
                      updateOption('emotionalJourney', true);
                      updateOption('contrastType', option.type);
                      generateStory();
                    }}
                    disabled={generating}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50"
                  >
                    {generating ? 'Generating...' : 'Create Journey'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Tab */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Custom Story Settings</h3>
            
            {/* Story Type */}
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">Story Type</label>
              <select
                value={options.storyType}
                onChange={(e) => updateOption('storyType', e.target.value)}
                className="w-full bg-gray-800 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{
                  backgroundImage: 'none'
                }}
              >
                <option value="inspirational" className="bg-gray-800 text-white">Inspirational</option>
                <option value="emotional_journey" className="bg-gray-800 text-white">Emotional Journey</option>
                <option value="memory_lane" className="bg-gray-800 text-white">Memory Lane</option>
                <option value="achievement" className="bg-gray-800 text-white">Achievement</option>
                <option value="family_moment" className="bg-gray-800 text-white">Family Moment</option>
                <option value="custom" className="bg-gray-800 text-white">Custom</option>
              </select>
            </div>

            {/* Theme */}
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">Theme</label>
              <select
                value={options.theme}
                onChange={(e) => updateOption('theme', e.target.value)}
                className="w-full bg-gray-800 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{
                  backgroundImage: 'none'
                }}
              >
                <option value="inspirational" className="bg-gray-800 text-white">Inspirational</option>
                <option value="nostalgic" className="bg-gray-800 text-white">Nostalgic</option>
                <option value="adventure" className="bg-gray-800 text-white">Adventure</option>
                <option value="family" className="bg-gray-800 text-white">Family</option>
                <option value="achievement" className="bg-gray-800 text-white">Achievement</option>
                <option value="transformation" className="bg-gray-800 text-white">Transformation</option>
              </select>
            </div>

            {/* Style */}
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">Style</label>
              <select
                value={options.style}
                onChange={(e) => updateOption('style', e.target.value)}
                className="w-full bg-gray-800 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{
                  backgroundImage: 'none'
                }}
              >
                <option value="cinematic" className="bg-gray-800 text-white">Cinematic</option>
                <option value="documentary" className="bg-gray-800 text-white">Documentary</option>
                <option value="vlog" className="bg-gray-800 text-white">Vlog</option>
                <option value="storybook" className="bg-gray-800 text-white">Storybook</option>
              </select>
            </div>

            {/* Tone */}
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">Tone</label>
              <select
                value={options.tone}
                onChange={(e) => updateOption('tone', e.target.value)}
                className="w-full bg-gray-800 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{
                  backgroundImage: 'none'
                }}
              >
                <option value="uplifting" className="bg-gray-800 text-white">Uplifting</option>
                <option value="reflective" className="bg-gray-800 text-white">Reflective</option>
                <option value="energetic" className="bg-gray-800 text-white">Energetic</option>
                <option value="calm" className="bg-gray-800 text-white">Calm</option>
                <option value="dramatic" className="bg-gray-800 text-white">Dramatic</option>
              </select>
            </div>

            {/* Emotional Journey Toggle */}
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.emotionalJourney}
                  onChange={(e) => updateOption('emotionalJourney', e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-green-500 focus:ring-green-500"
                />
                <span className="text-gray-300 text-sm font-medium">Enable Emotional Journey</span>
              </label>
            </div>

            {/* Contrast Type (if emotional journey enabled) */}
            {options.emotionalJourney && (
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">Contrast Type</label>
                <select
                  value={options.contrastType}
                  onChange={(e) => updateOption('contrastType', e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={{
                    backgroundImage: 'none'
                  }}
                >
                  <option value="good_vs_bad" className="bg-gray-800 text-white">Good vs Bad</option>
                  <option value="before_vs_after" className="bg-gray-800 text-white">Before vs After</option>
                  <option value="struggle_vs_triumph" className="bg-gray-800 text-white">Struggle vs Triumph</option>
                  <option value="sadness_vs_joy" className="bg-gray-800 text-white">Sadness vs Joy</option>
                </select>
              </div>
            )}

            {/* Custom Prompt */}
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">Custom Prompt</label>
              <textarea
                value={options.userPrompt}
                onChange={(e) => updateOption('userPrompt', e.target.value)}
                placeholder="Describe the story you want to create..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
              />
            </div>

            {/* Clip Duration */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">Target Duration (seconds)</label>
              <input
                type="number"
                value={options.clipDuration}
                onChange={(e) => updateOption('clipDuration', parseInt(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                min="10"
                max="300"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={() => generateStory()}
              disabled={generating || selectedVideos.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 font-semibold"
            >
              {generating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating Story...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Generate Custom Story</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quick Tab */}
      {activeTab === 'quick' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Story Generation</h3>
            <p className="text-gray-300 mb-6">Generate stories instantly with pre-configured settings</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inspirational Story */}
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Heart className="h-8 w-8 text-green-400" />
                  <div>
                    <h4 className="text-white font-semibold text-lg">Inspirational Story</h4>
                    <p className="text-gray-300 text-sm">Uplifting and motivational</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Create an inspiring story that celebrates life's beautiful moments and personal growth.
                </p>
                <button
                  onClick={() => handleQuickStory('inspirational')}
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Create Inspirational Story'}
                </button>
              </div>

              {/* Emotional Journey */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="h-8 w-8 text-purple-400" />
                  <div>
                    <h4 className="text-white font-semibold text-lg">Emotional Journey</h4>
                    <p className="text-gray-300 text-sm">Contrast and transformation</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Create a compelling story that contrasts different emotional states and life choices.
                </p>
                <button
                  onClick={() => handleQuickStory('emotional_journey')}
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Create Emotional Journey'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

