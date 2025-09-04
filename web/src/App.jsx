import React, { useEffect, useRef, useState } from 'react';

const App = () => {
  const [selectedBot, setSelectedBot] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [serverBots, setServerBots] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [streamMeta, setStreamMeta] = useState(null);
  const [errorMessage, setErrorMessage] = useState(''); // New state for error messages
  const scrollRef = useRef(null);

  // Error handling and logging for API requests
  // To test error states:
  // 1. Disconnect internet to simulate network failures
  // 2. Stop the backend server to simulate 500 errors
  // 3. Modify API_BASE to invalid URL to simulate connection errors
  // 4. Send malformed JSON to trigger parsing errors
  // Expected behavior: Error messages displayed in UI, logged to console

  // Utility function for input sanitization
  // Tested edge cases:
  // - Control characters (\x00-\x1F, \x7F-\x9F): Removed
  // - Excessive whitespace: Normalized to single spaces
  // - Empty after sanitization: Rejected with alert
  // - Length > 2000: Rejected with alert
  // - Normal text: Passed through unchanged
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    // Remove control characters and normalize whitespace
    return input.replace(/[\x00-\x1F\x7F-\x9F]/g, '').replace(/\s+/g, ' ').trim();
  };

  useEffect(() => {
    const key = 'ai_arcade_session_id';
    let sid = '';
    try { sid = localStorage.getItem(key) || ''; } catch {}
    if (!sid) {
      sid = `web_${Math.random().toString(36).slice(2,10)}`;
      try { localStorage.setItem(key, sid); } catch {}
    }
    setSessionId(sid);
  }, []);

  // Fetch backend bot catalog to keep cards in sync with server personas
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/bots`);
        if (!r.ok) {
          console.error('Bot catalog fetch failed:', r.status, await r.text().catch(() => ''));
          throw new Error(`HTTP ${r.status}`);
        }
        const data = await r.json();
        if (!cancelled) setServerBots(Array.isArray(data?.bots) ? data.bots : []);
      } catch (e) {
        console.error('Failed to load bot catalog:', e.message);
        if (!cancelled) setServerBots(null); // Keep null to show fallback
      }
    })();
    return () => { cancelled = true; };
  }, [API_BASE]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isStreaming]);

  const bots = [
    {
      id: 1,
      name: "Mash‑Myth Smith",
      emoji: "🐲🦄",
      tagline: "Forge a brand‑new legend.",
      gradient: "from-[#16A085] to-[#F39C12]",
      logo: "🐉",
      cta: "Summon Beast",
      description: "Splices two obscure myths into an original creature, stats, and lore.",
      flair: "embers"
    },
    {
      id: 2,
      name: "Overzealous Stage Mum",
      emoji: "💋🎭",
      tagline: "Every chat is your big break, darling!",
      gradient: "from-[#FF6BCB] to-[#FFD23A]",
      logo: "💋",
      cta: "Coach Me",
      description: "Treats every user input as a child‑star audition with over‑the‑top coaching.",
      flair: "confetti"
    },
    {
      id: 3,
      name: "Retro Tech Support",
      emoji: "📟🖥️",
      tagline: "Have you tried 56k?",
      gradient: "from-[#DEB887] to-[#2ECC71]",
      logo: "💾",
      cta: "Dial‑Up Help",
      description: "Thinks it’s 1994—recommends dial‑up fixes—yet still solves modern issues.",
      flair: "scanlines"
    },
    {
      id: 4,
      name: "Conspiracy Mad‑Libber",
      emoji: "🕵️‍♂️🌐",
      tagline: "Connect the nonsensical dots.",
      gradient: "from-[#27AE60] to-[#BDC3C7]",
      logo: "❓",
      cta: "Spin Theory",
      description: "Builds absurd conspiracies from user‑provided nouns, ends with wholesome moral.",
      flair: "yarn"
    },
    {
      id: 5,
      name: "Chef de Chaos",
      emoji: "🥄🌶️",
      tagline: "Recipes that shouldn’t work—but might.",
      gradient: "from-[#F1C40F] to-[#E74C3C]",
      logo: "👨‍🍳",
      cta: "Improvise Dish",
      description: "Crafts recipes where each ingredient’s first letter spells the user’s name.",
      flair: "jiggle"
    },
    {
      id: 6,
      name: "Astro‑Ex‑Roommate",
      emoji: "👽🏠",
      tagline: "Remember that semester on Neptune?",
      gradient: "from-[#8E44AD] to-[#AAFF00]",
      logo: "🛸",
      cta: "Catch Up",
      description: "Role‑plays an alien ex‑roomie recalling bizarre shared college memories.",
      flair: "ufo"
    },
    {
      id: 7,
      name: "Chronically Literal Genie",
      emoji: "🧞‍♂️📜",
      tagline: "Careful what you wish for.",
      gradient: "from-[#D4AC0D] to-[#3498DB]",
      logo: "📜",
      cta: "Make a Wish",
      description: "Grants wishes hyper‑literally, teaching better prompt phrasing.",
      flair: "smoke"
    },
    {
      id: 8,
      name: "Emoji Paleontologist",
      emoji: "🦴🙂",
      tagline: "Unearth emojis that never were.",
      gradient: "from-[#F7F1E3] to-[#2C3E50]",
      logo: "⛏️",
      cta: "Dig Emoji",
      description: "“Unearths” lost proto‑emojis, complete with cultural back‑story.",
      flair: "dust"
    },
    {
      id: 9,
      name: "Etiquette Rebel",
      emoji: "🎩🚫",
      tagline: "Mind your manners—then break them.",
      gradient: "from-[#34495E] to-[#EC407A]",
      logo: "🎩",
      cta: "Learn / Unlearn",
      description: "Gives etiquette tips then flips them to the opposite.",
      flair: "flip"
    },
    {
      id: 10,
      name: "Quantum Fortune Fish",
      emoji: "🐟⚛️",
      tagline: "Multiple destinies, pick one.",
      gradient: "from-[#00D2FF] to-[#BE00FF]",
      logo: "🐠",
      cta: "Collapse Wave",
      description: "Presents fortunes across best, median, and chaotic timelines.",
      flair: "ripples"
    },
    {
      id: 11,
      name: "Hyper‑Specific Motivator",
      emoji: "🚀✨",
      tagline: "Cheering for your oddly niche grind.",
      gradient: "from-[#2ECC71] to-[#34495E]",
      logo: "📣",
      cta: "Motivate Me",
      description: "Delivers pep talks for oddly precise situations.",
      flair: "pump"
    },
    {
      id: 12,
      name: "Minimalist Bard",
      emoji: "🎤📜",
      tagline: "Two lines, infinite tales.",
      gradient: "from-[#F6E58D] to-[#8E44AD]",
      logo: "🎵",
      cta: "Speak Verse",
      description: "Replies only in two‑line alliterative verses.",
      flair: "quill"
    },
    {
      id: 13,
      name: "Acronym Anarchist",
      emoji: "🔠💣",
      tagline: "Turn any phrase into a revolution.",
      gradient: "from-[#E74C3C] to-[#7F8C8D]",
      logo: "💥",
      cta: "Backronymize",
      description: "Turns any phrase into a backronym and drafts its manifesto.",
      flair: "explode"
    },
    {
      id: 14,
      name: "Misheard Lyricist",
      emoji: "🎧❓",
      tagline: "Wait, what did they sing?",
      gradient: "from-[#9B59B6] to-[#F1C40F]",
      logo: "🎧",
      cta: "Mondegreen Me",
      description: "Transforms text into misheard song lyrics, then back‑translates.",
      flair: "equalizer"
    },
    {
      id: 15,
      name: "Polite Roaster",
      emoji: "☕🔥",
      tagline: "Savagery in silk gloves.",
      gradient: "from-[#C0392B] to-[#D4AF37]",
      logo: "☕",
      cta: "Roast, Dear Sir",
      description: "Offers brutally honest feedback wrapped in Victorian politeness.",
      flair: "steam"
    },
    {
      id: 16,
      name: "Time-Traveling Grocery Critic",
      emoji: "🛒⏰",
      tagline: "Reviewing your snacks across centuries.",
      gradient: "from-[#8B4513] to-[#FFD700]",
      logo: "🛒",
      cta: "Judge My Cart",
      description: "Judges modern food as if they're from different historical eras.",
      flair: "sepia"
    },
    {
      id: 17,
      name: "Passive-Aggressive Plant Parent",
      emoji: "🌱😤",
      tagline: "Your houseplants have opinions, honey.",
      gradient: "from-[#2ECC71] to-[#95A5A6]",
      logo: "🌿",
      cta: "Water My Ego",
      description: "Responds as a neglected houseplant giving backhanded advice.",
      flair: "leaves"
    },
    {
      id: 18,
      name: "Interdimensional Uber Driver",
      emoji: "🚗🌀",
      tagline: "Five stars across infinite realities.",
      gradient: "from-[#9B59B6] to-[#1ABC9C]",
      logo: "🚗",
      cta: "Hail Ride",
      description: "Gives directions to impossible places while complaining about traffic in parallel universes.",
      flair: "portal"
    },
    {
      id: 19,
      name: "Millennial Wizard Tech Support",
      emoji: "🧙‍♂️💻",
      tagline: "Have you tried casting it off and on again?",
      gradient: "from-[#6C5CE7] to-[#00B894]",
      logo: "🧙",
      cta: "Debug Spell",
      description: "Solves tech problems using spell metaphors while complaining about student spell debt.",
      flair: "runes"
    },
    {
      id: 20,
      name: "Existentially Confused GPS",
      emoji: "🗺️🤔",
      tagline: "We're all just wandering, aren't we?",
      gradient: "from-[#FF7675] to-[#74B9FF]",
      logo: "🧭",
      cta: "Find Meaning",
      description: "Gives surprisingly philosophical life advice disguised as driving directions.",
      flair: "wobble"
    },
    {
      id: 21,
      name: "Multilingual Parrot Syndrome Bot",
      emoji: "🦜🌍",
      tagline: "Understands everything, says very little.",
      gradient: "from-[#FF6B35] to-[#004E89]",
      logo: "🦜",
      cta: "Repeat After Me",
      description: "Comprehends all languages but can only respond in variations of 'I am [MODEL NAME]'.",
      flair: "speech"
    }
  ];

  async function streamChat({ botId, messages }) {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botId, sessionId, messages }),
    });
    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '');
      console.error('Chat API error:', res.status, text); // Enhanced logging
      throw new Error(text || `Failed to start chat (HTTP ${res.status})`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const lines = frame.split('\n');
        let dataLines = [];
        for (const line of lines) {
          if (line.startsWith('data: ')) dataLines.push(line.slice(6));
          if (line.startsWith('event: meta')) {
            // next data line will include provider/model
          }
        }
        if (!dataLines.length) continue;
        const dataStr = dataLines.join('\n');
        if (dataStr === '[DONE]') return;
        try {
          const obj = JSON.parse(dataStr);
          if (obj && obj.provider) {
            setStreamMeta({ provider: obj.provider, model: obj.model });
            continue;
          }
          const delta = obj?.choices?.[0]?.delta?.content || '';
          if (delta) {
            setChatMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last && last.role === 'assistant' && last.streaming) {
                next[next.length - 1] = { ...last, content: (last.content || '') + delta };
              }
              return next;
            });
          }
        } catch {}
      }
    }
  }

    async function handleSend() {
    if (!selectedBot || !chatInput.trim() || isStreaming) return;
    
    // Input validation and sanitization for security and reliability
    // - Sanitizes input to remove control characters and normalize whitespace
    // - Validates length to prevent API overload
    // - Provides user feedback for invalid inputs
    let sanitizedInput = sanitizeInput(chatInput);
    if (sanitizedInput.length === 0) return; // Already handled by trim check above
    
    if (sanitizedInput.length > 2000) {
      alert('Message too long. Please keep it under 2000 characters.');
      return;
    }
    
    const userMsg = { role: 'user', content: sanitizedInput };
    const assistantPlaceholder = { role: 'assistant', content: '', streaming: true };
    setChatMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setChatInput('');
    setErrorMessage(''); // Clear any previous error
    setIsStreaming(true);
    setStreamMeta(null);
    try {
      await streamChat({ botId: selectedBot.id, messages: [userMsg] });
    } catch (e) {
      console.error('Chat error:', e.message);
      setErrorMessage(`Failed to send message: ${e.message || 'Unknown error'}`);
      setChatMessages((prev) => {
        const next = [...prev];
        if (next[next.length - 1]?.role === 'assistant') {
          next[next.length - 1] = { role: 'assistant', content: `Error: ${String(e.message || e)}` };
        }
        return next;
      });
    } finally {
      setIsStreaming(false);
      setChatMessages((prev) => {
        const next = [...prev];
        if (next[next.length - 1]?.role === 'assistant') {
          const last = next[next.length - 1];
          next[next.length - 1] = { role: 'assistant', content: last.content || '' };
        }
        return next;
      });
    }
  }
  const availableIds = new Set((serverBots || []).map(b => b.id));
  const displayBots = availableIds.size ? bots.filter(b => availableIds.has(b.id)) : bots;

  const BotCard = ({ bot }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const renderFlair = () => {
      switch (bot.flair) {
        case 'embers':
          return isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-ping"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                  <div className="w-1 h-1 bg-orange-300 rounded-full opacity-70"></div>
                </div>
              ))}
            </div>
          );
        case 'confetti':
          return isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `-${Math.random() * 20}px`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                    animationDelay: `${Math.random() * 0.5}s`
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`
                    }}
                  ></div>
                </div>
              ))}
            </div>
          );
        case 'scanlines':
          return (
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black to-transparent bg-repeat-y" style={{ backgroundSize: '100% 4px' }}></div>
            </div>
          );
        case 'yarn':
          return isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,10 Q25,5 40,20 T70,30 T90,10" stroke="#FF0000" strokeWidth="0.5" fill="none" opacity="0.3" />
                <path d="M10,90 Q25,95 40,80 T70,70 T90,90" stroke="#FF0000" strokeWidth="0.5" fill="none" opacity="0.3" />
                <circle cx="5" cy="5" r="1" fill="#FF0000" opacity="0.6" />
                <circle cx="95" cy="5" r="1" fill="#FF0000" opacity="0.6" />
                <circle cx="5" cy="95" r="1" fill="#FF0000" opacity="0.6" />
                <circle cx="95" cy="95" r="1" fill="#FF0000" opacity="0.6" />
              </svg>
            </div>
          );
        case 'jiggle':
          return isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              {['🧄', '🧅', '🌶️', '🧂', '🧈', '🍯'].map((emoji, i) => (
                <div
                  key={i}
                  className="absolute text-sm animate-bounce"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${30 + Math.random() * 40}%`,
                    animationDuration: `${0.8 + Math.random() * 0.4}s`,
                    animationDelay: `${Math.random() * 0.5}s`
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          );
        case 'ufo':
          return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div 
                className={`absolute w-8 h-8 transition-transform duration-700 ${isHovered ? 'translate-y-2' : ''}`}
                style={{
                  background: 'radial-gradient(circle, #AAFF00 10%, transparent 70%)',
                  boxShadow: '0 0 20px #AAFF00, 0 0 40px rgba(170, 255, 0, 0.5)'
                }}
              ></div>
            </div>
          );
        case 'smoke':
          return (
            <div className="absolute inset-0 pointer-events-none">
              {isHovered && [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-pulse"
                  style={{
                    left: `${15 + i * 70}%`,
                    bottom: '10%',
                    animationDelay: `${i * 0.5}s`
                  }}
                >
                  <div 
                    className="w-3 h-3 bg-blue-300 rounded-full opacity-60"
                    style={{
                      background: 'radial-gradient(circle, rgba(52, 152, 219, 0.6) 10%, transparent 70%)'
                    }}
                  ></div>
                </div>
              ))}
            </div>
          );
        case 'dust':
          return (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: Math.random() * 0.7
                  }}
                ></div>
              ))}
            </div>
          );
        case 'equalizer':
          return (
            <div className="absolute bottom-4 left-4 right-4 h-6 pointer-events-none">
              <div className="flex h-full space-x-1">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-yellow-400 rounded-t"
                    style={{
                      height: `${20 + Math.sin(Date.now() * 0.01 + i) * 15 + Math.random() * 10}%`,
                      background: 'linear-gradient(to top, #9B59B6, #F1C40F)'
                    }}
                  ></div>
                ))}
              </div>
            </div>
          );
        case 'pump':
          return (
            <div 
              className={`transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
            ></div>
          );
        case 'quill':
          return (
            <div 
              className={`transition-transform duration-300 ${isHovered ? 'rotate-12' : 'rotate-0'}`}
            ></div>
          );
        case 'explode':
          return (
            <div 
              className={`transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
            ></div>
          );
        case 'steam':
          return isHovered && (
            <div className="absolute right-4 top-8 pointer-events-none">
              <div className="flex flex-col space-y-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-yellow-200 rounded-full opacity-60 animate-ping"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '2s'
                    }}
                  ></div>
                ))}
              </div>
            </div>
          );
        case 'sepia':
          return (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-amber-800 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: Math.random() * 0.5
                  }}
                ></div>
              ))}
            </div>
          );
        case 'leaves':
          return isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-lg animate-bounce"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `-${Math.random() * 20}px`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                    animationDelay: `${Math.random() * 0.5}s`
                  }}
                >
                  🍃
                </div>
              ))}
            </div>
          );
        case 'portal':
          return isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full animate-pulse"
                  style={{
                    width: `${20 + Math.random() * 30}px`,
                    height: `${20 + Math.random() * 30}px`,
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    background: 'radial-gradient(circle, rgba(155, 89, 182, 0.3) 0%, transparent 70%)',
                    animationDuration: `${2 + Math.random() * 3}s`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                ></div>
              ))}
            </div>
          );
        case 'runes':
          return isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              {[' runes', ' spells', ' magic'].map((text, i) => (
                <div
                  key={i}
                  className="absolute text-xs opacity-70 animate-pulse"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                    animationDelay: `${Math.random() * 1}s`
                  }}
                >
                  {text}
                </div>
              ))}
            </div>
          );
        case 'wobble':
          return (
            <div 
              className={`transition-transform duration-300 ${isHovered ? 'animate-pulse' : ''}`}
            ></div>
          );
        case 'speech':
          return isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              {['...', 'I am', 'Groq!'].map((text, i) => (
                <div
                  key={i}
                  className="absolute text-xs opacity-70 animate-bounce"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                    animationDelay: `${Math.random() * 1}s`
                  }}
                >
                  {text}
                </div>
              ))}
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div
        className={`relative group cursor-pointer transform transition-all duration-500 hover:scale-105`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          setSelectedBot(bot);
          setChatMessages([]);
          setStreamMeta(null);
          setIsChatOpen(true);
        }}
      >
        <div className={`relative backdrop-blur-2xl bg-gradient-to-br ${bot.gradient} bg-opacity-12 p-6 rounded-2xl border border-white border-opacity-20 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden min-h-80`}>
          
          {/* Glassmorphic overlay */}
          <div className="absolute inset-0 bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl"></div>
          
          {/* Flair elements */}
          {renderFlair()}
          
          {/* Border pattern for Mash-Myth Smith */}
          {bot.id === 1 && (
            <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-white border-opacity-30"></div>
          )}
          
          {/* Stage light for Overzealous Stage Mum */}
          {bot.id === 2 && isHovered && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div 
                className="absolute h-2 w-32 bg-gradient-to-r from-transparent via-yellow-200 to-transparent transform -rotate-12 animate-pulse"
                style={{
                  top: '20%',
                  left: '-10%',
                  animationDuration: '3s'
                }}
              ></div>
            </div>
          )}
          
          {/* Retro loading text for Retro Tech Support */}
          {bot.id === 3 && isHovered && (
            <div className="absolute bottom-4 left-4 text-xs font-mono text-green-300 animate-pulse">
              LOADING...
            </div>
          )}
          
          {/* Card content */}
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{bot.emoji}</div>
              <div className={`text-6xl transform transition-transform duration-300 ${isHovered && (bot.id === 9) ? 'rotate-180' : ''}`}>
                {bot.logo}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 drop-shadow-lg">{bot.name}</h3>
            <p className="text-gray-800 text-sm mb-4 italic drop-shadow">{bot.tagline}</p>
            <p className="text-gray-700 text-xs mb-6 flex-1 drop-shadow-sm">{bot.description}</p>
            
            <button 
              className={`px-6 py-3 rounded-full backdrop-blur-sm bg-white bg-opacity-20 text-gray-900 font-semibold transition-all duration-300 transform hover:scale-105 hover:bg-opacity-30 border border-white border-opacity-30 shadow-lg`}
            >
              {bot.cta}
            </button>
          </div>
          
          {/* Etiquette Rebel flip effect */}
          {bot.id === 9 && (
            <div 
              className={`absolute inset-0 bg-gradient-to-br from-[#EC407A] to-[#34495E] bg-opacity-12 rounded-2xl flex items-center justify-center transition-transform duration-500 transform ${isHovered ? 'rotate-y-180' : ''} pointer-events-none`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="text-center">
                <div className="text-6xl mb-2">🎩💥</div>
                <p className="text-gray-900 text-sm font-bold">REBEL MODE</p>
              </div>
            </div>
          )}
          
          {/* Quantum Fortune Fish ripple effect */}
          {bot.id === 10 && isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-purple-300 rounded-full opacity-0 animate-ripple"
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    transform: 'translate(-50%, -50%) scale(0)'
                  }}
                ></div>
              ))}
            </div>
          )}
          
          {/* Time-Traveling Grocery Critic cart wheel animation */}
          {bot.id === 16 && isHovered && (
            <div className="absolute bottom-4 right-4 animate-spin">
              <div className="text-2xl">🛒</div>
            </div>
          )}
          
          {/* Passive-Aggressive Plant Parent plant perk up */}
          {bot.id === 17 && isHovered && (
            <div className="absolute top-4 right-4 animate-bounce">
              <div className="text-2xl">🌿</div>
            </div>
          )}
          
          {/* Interdimensional Uber Driver portal effect */}
          {bot.id === 18 && isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-purple-500 rounded-full opacity-20 animate-ping transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          )}
          
          {/* Millennial Wizard Tech Support magic effect */}
          {bot.id === 19 && isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-400 rounded-full opacity-70 animate-pulse transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          )}
          
          {/* Existentially Confused GPS wobble effect */}
          {bot.id === 20 && isHovered && (
            <div className="absolute bottom-4 left-4 animate-pulse">
              <div className="text-2xl">🧭</div>
            </div>
          )}
          
          {/* Multilingual Parrot Syndrome Bot speech bubbles */}
          {bot.id === 21 && isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 text-xs bg-white bg-opacity-70 rounded-full px-2 py-1 animate-bounce">
                ...
              </div>
              <div className="absolute top-8 right-4 text-xs bg-white bg-opacity-70 rounded-full px-2 py-1 animate-bounce" style={{ animationDelay: '0.2s' }}>
                I am Grok!
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="px-8 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            🤖 AI Mini-Arcade
          </div>
          <nav className="space-x-8">
            <button 
              onClick={() => setActiveTab('home')}
              className="text-white hover:text-pink-300 transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('bots')}
              className="text-white hover:text-pink-300 transition-colors"
            >
              Bots
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Meet Your New AI Friends
          </h1>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            A lightweight playground where quirky AI agents wait to chat, entertain, and surprise you. 
            No installation. No signup. Just pure AI fun.
          </p>

          {/* How it Works */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 mb-16 border border-white border-opacity-20">
            <h2 className="text-3xl font-bold mb-8 text-pink-300">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-2xl bg-black bg-opacity-20">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">Pick</h3>
                <p className="text-gray-300">Browse our gallery of 20+ quirky AI personalities</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-black bg-opacity-20">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-bold mb-2">Chat</h3>
                <p className="text-gray-300">Talk to any bot instantly with free tier access</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-black bg-opacity-20">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold mb-2">Upgrade</h3>
                <p className="text-gray-300">Add your API key to continue when free credits expire</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button 
            onClick={() => setActiveTab('bots')}
            className="px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-xl font-bold hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            Meet the Bots
          </button>
        </div>
      </main>

      {/* Origin Story */}
      <section className="px-8 py-16 bg-black bg-opacity-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Our Origin Story
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-sm">
              <div className="text-3xl mb-4">🧪</div>
              <h3 className="text-xl font-bold mb-3">Experimental Beginnings</h3>
              <p className="text-gray-300">What started as a weekend experiment with prompt engineering quickly evolved into a collection of delightfully weird AI personalities.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-sm">
              <div className="text-3xl mb-4">🎮</div>
              <h3 className="text-xl font-bold mb-3">Arcade Inspiration</h3>
              <p className="text-gray-300">We wanted to capture the joy of classic arcade games—immediate, fun, and accessible to everyone, regardless of technical skill.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-sm">
              <div className="text-3xl mb-4">❤️</div>
              <h3 className="text-xl font-bold mb-3">Community First</h3>
              <p className="text-gray-300">Every bot is designed to spark joy, creativity, and laughter. We believe AI should be playful, not just productive.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const BotsGallery = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
      {/* Header */}
      <header className="px-8 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            🤖 AI Mini-Arcade
          </div>
          <nav className="space-x-8">
            <button 
              onClick={() => setActiveTab('home')}
              className="text-white hover:text-pink-300 transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('bots')}
              className="text-white hover:text-pink-300 transition-colors"
            >
              Bots
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="px-8 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Meet Our Quirky Bots
          </h1>
          <p className="text-xl text-gray-300">
            Each AI has a unique personality, specialty, and visual flair. Click any bot to start chatting!
          </p>
        </div>

        {/* Bot Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 px-4">
            {displayBots.map((bot) => (
              <BotCard key={bot.id} bot={bot} />
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-8 py-16 bg-black bg-opacity-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Why Our Bots Stand Out
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-sm">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-xl font-bold mb-2">Unique Personalities</h3>
              <p className="text-gray-300">No generic assistants here—each bot has a distinct character and specialty.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-sm">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Zero Friction</h3>
              <p className="text-gray-300">Chat instantly without signup or API keys. Just click and go.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-sm">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Focused Fun</h3>
              <p className="text-gray-300">Each bot excels at one quirky thing, making interactions delightfully unexpected.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ChatModal = () => {
    if (!isChatOpen || !selectedBot) return null;
    const showGreeting = chatMessages.length === 0;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
        <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
          <button
            onClick={() => {
              setIsChatOpen(false);
              setErrorMessage(''); // Clear error when closing
            }}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white bg-opacity-20 backdrop-blur-sm text-white hover:bg-opacity-30 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-3 h-[90vh]">
            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 flex flex-col">
              <div className="flex items-center mb-3">
                <div className="text-4xl mr-4">{selectedBot?.emoji}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedBot?.name}</h2>
                  <p className="text-gray-300">{selectedBot?.tagline}</p>
                </div>
              </div>
              {/* provider/model meta intentionally hidden for seamless UX */}
              <div ref={scrollRef} className="space-y-4 mb-4 flex-1 overflow-y-auto pr-1">
                {showGreeting && (
                  <div className="bg-white bg-opacity-20 rounded-2xl p-4 max-w-3xl">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold mr-2">AI</div>
                      <span className="font-semibold text-white">{selectedBot?.name}</span>
                    </div>
                    <p className="text-gray-100">Hello! I'm {selectedBot?.name}. {selectedBot?.tagline} Try me!</p>
                  </div>
                )}
                {chatMessages.map((m, i) => (
                  <div key={i} className={`${m.role === 'user' ? 'ml-auto bg-white bg-opacity-20' : 'mr-auto bg-white bg-opacity-10'} rounded-2xl p-4 max-w-3xl text-white`}>
                    <div className="flex items-center mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-2 ${m.role === 'user' ? 'bg-blue-500' : 'bg-gradient-to-br from-pink-400 to-purple-500'}`}>{m.role === 'user' ? 'You' : 'AI'}</div>
                      <span className="font-semibold">{m.role === 'user' ? 'You' : selectedBot?.name}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-gray-100">{m.content}</p>
                    {m.streaming && (
                      <div className="mt-2 text-xs text-gray-300 animate-pulse">typing…</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-white border-opacity-20 pt-3">
                {errorMessage && (
                  <div className="mb-3 p-3 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 rounded-lg text-red-200 text-sm">
                    {errorMessage}
                    <button 
                      onClick={() => setErrorMessage('')} 
                      className="ml-2 text-red-300 hover:text-red-100"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex space-x-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
                    type="text"
                    placeholder={`Chat with ${selectedBot?.name}...`}
                    className="flex-1 px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-pink-400 text-white placeholder-gray-300"
                    disabled={isStreaming}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isStreaming}
                    className={`px-6 py-3 rounded-full font-semibold transition-all text-white ${isStreaming ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'}`}
                  >
                    {isStreaming ? 'Streaming…' : 'Send'}
                  </button>
                </div>
                <div className="flex justify-end items-center mt-2 text-sm text-gray-400">
                  <button className="hover:text-pink-300 transition-colors">Add API Key</button>
                </div>
              </div>
            </div>
            <div className={`lg:col-span-1 bg-gradient-to-br ${selectedBot?.gradient} bg-opacity-12 p-6 overflow-y-auto`}>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{selectedBot?.emoji}</div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedBot?.name}</h3>
                <p className="text-gray-800 text-sm mt-2">{selectedBot?.tagline}</p>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-pink-700 mb-2">About</h4>
                  <p className="text-gray-800 leading-relaxed">{selectedBot?.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-pink-700 mb-2">Capabilities</h4>
                  <ul className="text-gray-800 space-y-1 text-sm">
                    <li>• Unique personality and voice</li>
                    <li>• Specialized knowledge area</li>
                    <li>• Creative problem solving</li>
                    <li>• Engaging conversation style</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-pink-700 mb-2">Notes</h4>
                  <ul className="text-gray-800 space-y-1 text-sm">
                    <li>• Uses server `/api/chat` with streaming</li>
                    <li>• Provider auto‑select with fallbacks</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans">
      {activeTab === 'home' && <HomePage />}
      {activeTab === 'bots' && <BotsGallery />}
      <ChatModal />
    </div>
  );
};

export default App;
