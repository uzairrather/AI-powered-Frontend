import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { Loader2, Wand2 } from "lucide-react";

interface StoryGeneratorProps {
  selectedVideos: string[];
  onStoryGenerated: () => void;
}

const StoryGenerator: React.FC<StoryGeneratorProps> = ({
  selectedVideos,
  onStoryGenerated,
}) => {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch suggestions as user types (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (prompt.trim().length > 1) {
        fetch(`${API_URL}/api/prompts/suggestions?query=${encodeURIComponent(prompt)}`, {
          credentials: "include",
        })
          .then((res) => res.json())
          .then((data) => {
            setSuggestions(data || []);
            setShowSuggestions(true);
          })
          .catch((err) => console.error("Error fetching suggestions:", err));
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [prompt]);

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleGenerate = () => {
    if (selectedVideos.length === 0) return;
    setIsModalOpen(true); // open duration selection modal first
  };

  const handleGenerateWithDuration = async (duration: number) => {
    setIsModalOpen(false);
    setGenerating(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/api/stories/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          videoIds: selectedVideos,
          prompt: prompt || "Create a compelling story from my videos",
          clipDuration: duration,
        }),
      });

      if (response.ok) {
        setPrompt("");
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onStoryGenerated();
        }, 2000);
      } else {
        const errorText = await response.text();
        setError(`Story generation failed: ${errorText}`);
      }
    } catch (error) {
      console.error("Error generating story:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const staticPrompts = [
    "Create a story about my beach vacations",
    "Tell the story of my hiking adventures",
    "Make a family celebration highlight reel",
    "Create a travel documentary narrative",
    "Tell a story about friendship and good times",
  ];

  return (
    <div className="space-y-4 relative">
      {/* Prompt input */}
      <div className="relative">
        <label htmlFor="story-prompt" className="block text-sm font-medium text-gray-300 mb-2">
          Story Theme or Prompt
        </label>
        <textarea
          ref={textareaRef}
          id="story-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what kind of story you want to create..."
          rows={3}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white/10 border border-white/20 rounded-lg mt-1 max-h-48 overflow-y-auto text-white backdrop-blur-md">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="px-3 py-2 hover:bg-purple-600/30 cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(s)}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Static prompt buttons */}
      <div className="flex flex-wrap gap-2">
        {staticPrompts.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setPrompt(suggestion)}
            className="text-xs px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full hover:bg-purple-500/30 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {success && (
        <div className="border border-red-500 bg-green-400 text-black px-4 py-2 rounded">
          Story generated Successfully!
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating || selectedVideos.length === 0}
        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating Story...</span>
          </>
        ) : (
          <>
            <Wand2 className="h-5 w-5" />
            <span>Generate AI Story</span>
          </>
        )}
      </button>

      <div className="text-xs text-gray-400 space-y-1">
        <p>• AI will analyze video transcriptions and tags</p>
        <p>• Groq LLM creates a compelling narrative</p>
        <p>• Stories are saved for future viewing</p>
      </div>

      {/* Duration Selection Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
  <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />

  <div className="fixed inset-0 flex items-center justify-center p-4">
    <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
      <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
        Select Clip Duration
      </Dialog.Title>

      <div className="mt-4 space-y-3">
        {[10, 15, 20, 60].map((duration) => (
          <button
            key={duration}
            onClick={() => handleGenerateWithDuration(duration)}
            className="w-full py-2 px-4 rounded bg-indigo-500 text-white hover:bg-indigo-600 transition"
          >
            {duration === 60 ? "1 Minute" : `${duration} Seconds`}
          </button>
        ))}
      </div>
    </Dialog.Panel>
  </div>
</Dialog>

    </div>
  );
};

export default StoryGenerator;
