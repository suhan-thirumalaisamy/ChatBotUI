import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Trash2, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm your Utility Customer Support assistant. I can help you with electricity, gas, water services, billing questions, and emergency reports. How can I assist you today?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId] = useState(`session_${Date.now()}`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        message,
        sessionId
      });
      return response.json();
    },
    onSuccess: (data) => {
      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: data.response,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: (error: any) => {
      console.error('Chat error:', error);
      
      let errorMessage = "Sorry, I'm having trouble connecting right now. Please try again later.";
      
      // Try to extract error message from the response
      if (error.message) {
        try {
          const errorData = JSON.parse(error.message.split(': ')[1]);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Use the original error message if parsing fails
          if (error.message.includes('Lambda endpoint not configured')) {
            errorMessage = "Chat service is not configured. Please contact support.";
          }
        }
      }
      
      const errorBotMessage: Message = {
        id: `error_${Date.now()}`,
        text: errorMessage,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorBotMessage]);
      
      toast({
        title: "Connection Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    const message = inputValue.trim();
    
    if (!message) {
      toast({
        title: "Empty Message",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    if (sendMessageMutation.isPending) {
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: message,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    // Send to Lambda
    sendMessageMutation.mutate(message);
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages([{
        id: "welcome",
        text: "Hello! I'm your Utility Customer Support assistant. I can help you with electricity, gas, water services, billing questions, and emergency reports. How can I assist you today?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendMessageMutation.isPending) {
        handleSendMessage();
      }
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50",
          "bg-blue-600 hover:bg-blue-700 text-white",
          !isOpen && "animate-pulse"
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Interface Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-end p-4"
          onClick={toggleChat}
        >
          <Card 
            className={cn(
              "w-full max-w-md h-96 md:h-[32rem] flex flex-col",
              "bg-white rounded-t-2xl md:rounded-2xl shadow-2xl",
              "transform transition-transform duration-300",
              isOpen ? "translate-y-0" : "translate-y-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl md:rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">Utility Support</h3>
                  <p className="text-xs text-slate-500">Online</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                className="text-slate-400 hover:text-slate-600 h-8 w-8"
                title="Clear Chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start space-x-2",
                    !message.isBot && "justify-end"
                  )}
                >
                  {message.isBot && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-xs",
                      message.isBot
                        ? "bg-slate-100"
                        : "bg-blue-600"
                    )}
                  >
                    <p className={cn(
                      "text-sm",
                      message.isBot ? "text-slate-700" : "text-white"
                    )}>
                      {message.text}
                    </p>
                    <span className={cn(
                      "text-xs mt-1 block",
                      message.isBot ? "text-slate-500" : "text-blue-100"
                    )}>
                      {message.timestamp}
                    </span>
                  </div>

                  {!message.isBot && (
                    <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-3 w-3 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Message */}
              {sendMessageMutation.isPending && (
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <div className="bg-slate-100 rounded-lg px-3 py-2 max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl md:rounded-b-2xl">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="resize-none min-h-[2.5rem] max-h-20 text-sm"
                    rows={1}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending || !inputValue.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 min-w-[2.5rem] h-10"
                  size="icon"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
