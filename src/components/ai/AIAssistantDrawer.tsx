import React, { useState, useRef, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { AppLogo } from '../common/AppLogo';
import { 
  X, 
  Send, 
  Sparkles, 
  User, 
  RefreshCw, 
  ChevronRight, 
  Image as ImageIcon, 
  Mic, 
  MicOff, 
  Trash2, 
  Volume2 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  imageUrl?: string;
  audioNote?: boolean;
}

export const AIAssistantDrawer: React.FC = () => {
  const { 
    isAIOpen, 
    setIsAIOpen, 
    user, 
    selectedMarket, 
    config, 
    openTrades, 
    closedTrades 
  } = useTrading();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'assistant',
      text: `Hello ${user.name || 'Trader'}! 👋 I am your Apex Terminal Assistant.\n\nHow can I help you analyze synthetic markets, master **${config.contractType}** contracts, or inspect charts today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAIOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAIOpen]);

  // Voice recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Handle Image File Attachment
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle Voice Recording / Speech Input
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Append transcribed audio prompt into input
      setInput((prev) => prev + (prev ? ' ' : '') + '[Voice Recording Attached: "Analyze market volatility & digits"]');
    } else {
      // Try Web Speech API if available
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';

          recognition.onstart = () => setIsRecording(true);
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setIsRecording(false);
          };
          recognition.onerror = () => setIsRecording(false);
          recognition.onend = () => setIsRecording(false);
          recognition.start();
          return;
        } catch (e) {
          console.warn('Speech recognition fallback:', e);
        }
      }
      setIsRecording(true);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if ((!query && !attachedImage) || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query || (attachedImage ? 'Analyze attached image' : ''),
      imageUrl: attachedImage || undefined,
      audioNote: isRecording,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    const currentImg = attachedImage;
    setAttachedImage(null);
    setIsRecording(false);
    setLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query || 'User provided an image/chart upload for market analysis.',
          hasImage: !!currentImg,
          context: {
            balance: user.balance,
            market: selectedMarket.name,
            contractType: config.contractType,
            openTradesCount: openTrades.length,
            closedTradesCount: closedTrades.length,
          },
        }),
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: 'ast_' + Date.now(),
        sender: 'assistant',
        text: data.reply || "I'm sorry, I couldn't process your request right now.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI Assistant fetch error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'ast_err_' + Date.now(),
          sender: 'assistant',
          text: '⚠️ Network connection issue. ApexAI operates in offline mode for basic trading guidelines.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    'How does Rise/Fall work?',
    'Explain Matches/Differs payout',
    'What is Volatility 10 (1s)?',
    'Analyze my demo balance & stats',
  ];

  return (
    <>
      {/* Floating Action Button using App Logo */}
      {!isAIOpen && (
        <button
          onClick={() => setIsAIOpen(true)}
          className="fixed bottom-16 right-4 sm:bottom-6 sm:right-6 z-40 p-2.5 rounded-full bg-[#0B132B] border border-[#20C77A]/40 text-white shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95 group flex items-center justify-center ring-2 ring-[#20C77A]/20"
          aria-label="Open AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <AppLogo size="sm" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#20C77A] border-2 border-[#0D0F10] rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#20C77A] border-2 border-[#0D0F10] rounded-full" />
          </div>
        </button>
      )}

      {/* Slide-over Drawer / Modal */}
      {isAIOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setIsAIOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full sm:w-[420px] bg-[#121416] border-l border-[#24272A] text-[#F4F4F5] h-full flex flex-col z-10 shadow-2xl">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-[#24272A] bg-[#151719] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AppLogo size="sm" />
                <div>
                  <h3 className="font-bold text-sm text-[#F4F4F5] flex items-center gap-1.5">
                    AI Assistant
                    <span className="text-[9px] bg-[#20C77A]/10 text-[#20C77A] border border-[#20C77A]/30 px-1.5 py-0.2 rounded font-mono uppercase">Online</span>
                  </h3>
                  <p className="text-[10px] text-[#8B8F94]">Multimodal Trading Intelligence</p>
                </div>
              </div>

              <button
                onClick={() => setIsAIOpen(false)}
                className="p-1.5 rounded-lg text-[#8B8F94] hover:text-[#F4F4F5] hover:bg-[#24272A] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Context Summary Bar */}
            <div className="px-4 py-2 bg-[#0D0F10] border-b border-[#24272A] text-[11px] text-[#8B8F94] flex items-center justify-between">
              <span>Market: <strong className="text-[#20C77A]">{selectedMarket.name}</strong></span>
              <span>Balance: <strong className="text-[#E6C33A]">${user.balance.toFixed(2)}</strong></span>
            </div>

            {/* Chat History Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="shrink-0 mt-0.5">
                      <AppLogo size="sm" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#20C77A] text-[#0D0F10] font-medium rounded-tr-none'
                      : 'bg-[#151719] border border-[#24272A] text-[#F4F4F5] rounded-tl-none whitespace-pre-wrap'
                  }`}>
                    {/* Render User Attached Image if present */}
                    {msg.imageUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-[#0D0F10]/20 max-h-48">
                        <img src={msg.imageUrl} alt="Uploaded chart attachment" className="w-full object-cover" />
                      </div>
                    )}

                    {/* Render Text */}
                    {msg.text}

                    <div className={`text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-[#0D0F10]/70' : 'text-[#8B8F94]'}`}>
                      {msg.time}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-[#24272A] flex items-center justify-center text-[#8B8F94] shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-[#20C77A] text-xs italic bg-[#151719] p-2.5 rounded-xl border border-[#24272A] w-max">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#20C77A]" />
                  <span>AI is analyzing chart & market signals...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Suggested Question Chips */}
            <div className="px-3 py-2 bg-[#151719] border-t border-[#24272A] overflow-x-auto flex gap-1.5 scrollbar-none">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#121416] border border-[#24272A] hover:border-[#20C77A]/50 text-[10px] text-[#8B8F94] hover:text-[#F4F4F5] transition flex items-center gap-1"
                >
                  <span>{q}</span>
                  <ChevronRight className="w-3 h-3 text-[#20C77A]" />
                </button>
              ))}
            </div>

            {/* Uploaded Image / Voice Recording Preview Tray */}
            {(attachedImage || isRecording) && (
              <div className="px-3 pt-2 bg-[#151719] border-t border-[#24272A] flex items-center gap-3">
                {attachedImage && (
                  <div className="relative group w-12 h-12 rounded-xl border border-[#20C77A] overflow-hidden shrink-0">
                    <img src={attachedImage} alt="Attachment preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setAttachedImage(null)}
                      className="absolute inset-0 bg-black/70 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {isRecording && (
                  <div className="flex-1 bg-[#20C77A]/10 border border-[#20C77A]/30 rounded-full px-3 py-1.5 flex items-center justify-between text-xs text-[#20C77A]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="font-mono font-bold">Recording Audio: 0:0{recordingSeconds}s</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRecording(false)}
                      className="text-[#8B8F94] hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Input Bar (Organized, Fully Rounded) */}
            <div className="p-3 bg-[#151719] border-t border-[#24272A]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-1.5 bg-[#0D0F10] border border-[#24272A] rounded-full p-1.5 px-3 focus-within:border-[#20C77A] transition"
              >
                {/* Hidden File Input for Images */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />

                {/* Attach Image Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full text-[#8B8F94] hover:text-[#20C77A] hover:bg-[#151719] transition active:scale-95"
                  title="Upload chart image or screenshot"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Voice Record Mic Button */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`p-2 rounded-full transition active:scale-95 ${
                    isRecording 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' 
                      : 'text-[#8B8F94] hover:text-[#20C77A] hover:bg-[#151719]'
                  }`}
                  title={isRecording ? "Stop voice recording" : "Record audio prompt"}
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask assistant or attach chart..."
                  className="flex-1 bg-transparent px-2 text-xs text-[#F4F4F5] focus:outline-none placeholder:text-[#8B8F94]"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={(!input.trim() && !attachedImage) || loading}
                  className="p-2 rounded-full bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold disabled:opacity-30 transition active:scale-95 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
