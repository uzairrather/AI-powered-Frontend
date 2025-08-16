import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setSuggestions([]);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    onSearch('');
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setSuggestions([]);
  };

  const fetchSuggestions = async (search: string) => {
  try {
    console.log('🔍 Fetching suggestions for:', search);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const res = await fetch(`${API_URL}/api/videos/search?q=${encodeURIComponent(search)}`, {
      credentials: 'include'
    });
    const data = await res.json();
    console.log('✅ Search results:', data); // <-- check what's returned

    const allMatches: string[] = [];

    data.forEach((video: any) => {
      if (video.filename?.toLowerCase().includes(search.toLowerCase())) {
        allMatches.push(video.filename);
      }
      video.tags?.forEach((tag: string) => {
        if (tag.toLowerCase().includes(search.toLowerCase())) {
          allMatches.push(tag);
        }
      });
      if (video.transcription?.toLowerCase().includes(search.toLowerCase())) {
        const match = video.transcription
          .split('. ')
          .find((line: string) => line.toLowerCase().includes(search.toLowerCase()));
        if (match) allMatches.push(match.trim());
      }
    });

    const uniqueSuggestions = Array.from(new Set(allMatches)).slice(0, 5);
    console.log('💡 Suggestions:', uniqueSuggestions); // <--- debug this too
    setSuggestions(uniqueSuggestions);
  } catch (err) {
    console.error('❌ Suggestion fetch error:', err);
  }
};


  useEffect(() => {
    if (typingTimeout) clearTimeout(typingTimeout);

    if (query.trim().length > 1) {
      const timeout = setTimeout(() => {
        fetchSuggestions(query);
      }, 300); // debounce
      setTypingTimeout(timeout);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by transcription, tags, or filename..."
          className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* ✅ Suggestion Dropdown */}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 bg-purple-700 border border-white/10 rounded-md shadow-lg w-full max-h-48 overflow-auto">
          {suggestions.map((sugg, idx) => (
            <li
              key={idx}
              onClick={() => handleSelectSuggestion(sugg)}
              className="px-4 py-2 text-sm text-white hover:bg-purple-600 cursor-pointer"
            >
              {sugg}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {['travel', 'family', 'nature', 'celebration', 'friends'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleSelectSuggestion(tag)}
            className="px-3 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full hover:bg-purple-500/30 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
};

export default SearchBar;
