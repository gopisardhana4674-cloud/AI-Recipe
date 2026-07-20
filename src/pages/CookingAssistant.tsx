import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import { useRecipeStore, Recipe } from '../store/recipeStore';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

interface CookingAssistantProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function CookingAssistant({ recipe, isOpen, onClose }: CookingAssistantProps) {
  const { askCookingAssistant } = useRecipeStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hi there! I am your AI Chef Assistant for the "${recipe.title}" recipe. Ask me anything: scaling servings, swapping ingredients, cooking time checks, or clarify steps!`,
        },
      ]);
    }
  }, [isOpen, recipe.title, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg];
      const answer = await askCookingAssistant(history, recipe);
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Chef network connection timed out. Please try again!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Hi there! I am your AI Chef Assistant for the "${recipe.title}" recipe. Ask me anything: scaling servings, swapping ingredients, cooking time checks, or clarify steps!`,
      },
    ]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Cooking Assistant" size="md">
      <div className="flex flex-col h-[550px] gap-4">
        {/* Chat Bubbles Feed */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
          {messages.map((msg, index) => {
            const isBot = msg.role === 'assistant';
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${isBot ? 'self-start' : 'self-end flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center border flex-shrink-0
                    ${isBot
                      ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                      : 'bg-white/10 border-white/20 text-gray-300'
                    }
                  `}
                >
                  {isBot ? <Bot size={16} /> : <User size={16} />}
                </div>

                {/* Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed font-medium
                    ${isBot
                      ? 'bg-white/[0.02] border border-white/[0.04] text-gray-200 rounded-tl-none'
                      : 'bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-tr-none'
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-3 self-start max-w-[80%]">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center border bg-orange-500/10 border-orange-500/20 text-orange-400">
                <Bot size={16} />
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-gray-400 rounded-tl-none flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-orange-400 rounded-full animate-bounce" />
                <span className="h-1.5 w-1.5 bg-orange-400 rounded-full animate-bounce delay-100" />
                <span className="h-1.5 w-1.5 bg-orange-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="flex gap-2 border-t border-white/5 pt-4 mt-auto">
          <Button variant="outline" size="md" onClick={handleClear} type="button" title="Clear chat thread">
            <Trash2 size={16} className="text-gray-400 hover:text-red-400" />
          </Button>
          <input
            type="text"
            placeholder="Type your cooking query (e.g. Can I use butter instead of oil?)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-orange-500/50 rounded-xl text-sm text-white placeholder-gray-500 outline-none backdrop-blur-md transition-all"
          />
          <Button type="submit" disabled={!input.trim() || loading} className="px-4 py-3">
            <Send size={16} />
          </Button>
        </form>
      </div>
    </Modal>
  );
}
