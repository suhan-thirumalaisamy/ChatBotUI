import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  MessageCircle,
  X,
  Send,
  Trash2,
  Bot,
  User,
  Loader2,
  Mic,
  MicOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { sendTextToLex, sendVoiceToLex } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: string;
}

async function convertWebMToWav(webmBlob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)({
      sampleRate: 16000, // Set sample rate to 16kHz as required by Lex
    });

    const fileReader = new FileReader();

    fileReader.onload = async () => {
      try {
        const arrayBuffer = fileReader.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Convert to mono if stereo
        const channelData =
          audioBuffer.numberOfChannels > 1
            ? audioBuffer.getChannelData(0)
            : audioBuffer.getChannelData(0);

        // Convert float32 to int16 (PCM 16-bit)
        const int16Array = new Int16Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
          const sample = Math.max(-1, Math.min(1, channelData[i]));
          int16Array[i] = sample * 0x7fff;
        }

        // Create WAV file
        const wavBuffer = createWavBuffer(int16Array, 16000, 1);
        const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });

        resolve(wavBlob);
      } catch (error) {
        reject(error);
      }
    };

    fileReader.onerror = () => reject(new Error("Failed to read audio file"));
    fileReader.readAsArrayBuffer(webmBlob);
  });
}

// Create WAV file buffer
function createWavBuffer(
  samples: Int16Array,
  sampleRate: number,
  numChannels: number
): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples
  const offset = 44;
  for (let i = 0; i < samples.length; i++) {
    view.setInt16(offset + i * 2, samples[i], true);
  }

  return buffer;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm your Rebel Energy customer support assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

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
      const response = await sendTextToLex(message, sessionId);
      return response;
    },
    onSuccess: (data: any) => {
      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: data.agentResponse,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMessage]);
    },
    onError: (error: any) => {
      console.error("Chat error:", error);

      let errorMessage =
        "Sorry, I'm having trouble connecting right now. Please try again later.";

      // Try to extract error message from the response
      if (error.message) {
        errorMessage = error.message;
      }

      const errorBotMessage: Message = {
        id: `error_${Date.now()}`,
        text: errorMessage,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorBotMessage]);

      toast({
        title: "Connection Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendVoiceMessageMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const response = await sendVoiceToLex(audioBlob, sessionId);
      return response;
    },
    onSuccess: (data: any) => {
      // Add user's transcribed message if available
      if (data.inputTranscript) {
        const userMessage: Message = {
          id: `user_voice_${Date.now()}`,
          text: data.inputTranscript,
          isBot: false,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, userMessage]);
      }

      // Add bot response
      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: data.agentResponse,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMessage]);
    },
    onError: (error: any) => {
      console.error("Voice message error:", error);

      const errorBotMessage: Message = {
        id: `error_${Date.now()}`,
        text:
          error.message || "Failed to process voice message. Please try again.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorBotMessage]);

      toast({
        title: "Voice Message Error",
        description: "Failed to process voice message. Please try again.",
        variant: "destructive",
      });
    },
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
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Send to Lex
    sendMessageMutation.mutate(message);
  };

  const startRecording = async () => {
    try {
      // let mimeType = "audio/ogg;codecs=opus";
      // if (!MediaRecorder.isTypeSupported(mimeType)) {
      //   mimeType = "audio/wav";
      //   if (!MediaRecorder.isTypeSupported(mimeType)) {
      //     mimeType = ""; // Let browser choose
      //   }
      // }
      // console.log("Using MIME type:", mimeType);
      let mimeType = "audio/webm;codecs=opus";
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      const recorder = new MediaRecorder(stream, {
        mimeType,
      });

      const audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async() => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        try {
          // Convert WebM to WAV
          const wavBlob = await convertWebMToWav(audioBlob);

          // Send converted audio to Lex
          sendVoiceMessageMutation.mutate(wavBlob);
        } catch (error) {
          console.error("Error converting audio:", error);
          // Handle conversion error
        }
        // sendVoiceMessageMutation.mutate(audioBlob);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      toast({
        title: "Recording Started",
        description: "Speak your message now. Click the mic again to stop.",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);

      toast({
        title: "Recording Stopped",
        description: "Processing your voice message...",
      });
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        text: "Hello! I'm your Rebel Energy customer support assistant. How can I help you today?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setSessionId(`session_${Date.now()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (
        !sendMessageMutation.isPending &&
        !sendVoiceMessageMutation.isPending
      ) {
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
      {/* <Button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-1000 z-50",
          "text-white"
        )}
        style={{ 
          backgroundColor: '#ff3c5a',
          borderColor: '#ff3c5a'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#c55a68';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ff3c5a';
        }}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button> */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className={cn(
            "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-1000 z-50",
            "text-white"
          )}
          style={{
            backgroundColor: "#ff3c5a",
            borderColor: "#ff3c5a",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#c55a68";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#ff3c5a";
          }}
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

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
            <div
              className="flex items-center justify-between p-4 border-b rounded-t-2xl md:rounded-t-2xl"
              style={{
                backgroundColor: "#ff3c5a",
                borderColor: "#c55a68",
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <div
                    className="text-xs font-bold"
                    style={{ color: "#ff3c5a" }}
                  >
                    R
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-white">
                    Rebel Energy Live Chat
                  </h3>
                  <p className="text-xs text-pink-100">How can we help?</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                className="text-pink-100 hover:text-white hover:bg-pink-600 h-8 w-8"
                title="Clear Chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ backgroundColor: "#fef7f7" }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start space-x-2",
                    !message.isBot && "justify-end"
                  )}
                >
                  {message.isBot && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                      style={{ backgroundColor: "#ff3c5a" }}
                    >
                      <div className="text-xs font-bold text-white">R</div>
                    </div>
                  )}

                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-xs",
                      message.isBot ? "bg-white border" : ""
                    )}
                    style={
                      message.isBot
                        ? { borderColor: "#f8d7da" }
                        : { backgroundColor: "#ff3c5a" }
                    }
                  >
                    <p
                      className={cn(
                        "text-sm",
                        message.isBot ? "text-gray-700" : "text-white"
                      )}
                    >
                      {message.text}
                    </p>
                    <span
                      className={cn(
                        "text-xs mt-1 block",
                        message.isBot ? "text-gray-400" : "text-pink-100"
                      )}
                    >
                      {message.timestamp}
                    </span>
                  </div>

                  {!message.isBot && (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-3 w-3 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Message */}
              {(sendMessageMutation.isPending ||
                sendVoiceMessageMutation.isPending) && (
                <div className="flex items-start space-x-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: "#ff3c5a" }}
                  >
                    <div className="text-xs font-bold text-white">R</div>
                  </div>
                  <div
                    className="bg-white border rounded-lg px-3 py-2 max-w-xs"
                    style={{ borderColor: "#f8d7da" }}
                  >
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: "#ff3c5a" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: "#ff3c5a",
                          animationDelay: "0.1s",
                        }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          backgroundColor: "#ff3c5a",
                          animationDelay: "0.2s",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              className="p-4 border-t bg-white rounded-b-2xl md:rounded-b-2xl"
              style={{ borderColor: "#f8d7da" }}
            >
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message"
                    className="resize-none min-h-[2.5rem] max-h-20 text-sm border-2 focus:border-2"
                    style={
                      {
                        // borderColor: "#f8d7da",
                        //focusBorderColor: '#ff3c5a'
                      }
                    }
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ff3c5a";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#f8d7da";
                    }}
                    rows={1}
                  />
                </div>
                <Button
                  onClick={handleVoiceToggle}
                  disabled={
                    sendMessageMutation.isPending ||
                    sendVoiceMessageMutation.isPending
                  }
                  className={cn(
                    "text-white min-w-[2.5rem] h-10",
                    isRecording ? "animate-pulse" : ""
                  )}
                  style={{
                    backgroundColor: isRecording
                      ? "#dc2626"
                      : sendMessageMutation.isPending ||
                        sendVoiceMessageMutation.isPending
                      ? "#d1d5db"
                      : "#ff3c5a",
                  }}
                  onMouseEnter={(e) => {
                    if (
                      !sendMessageMutation.isPending &&
                      !sendVoiceMessageMutation.isPending &&
                      !isRecording
                    ) {
                      e.currentTarget.style.backgroundColor = "#c55a68";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (
                      !sendMessageMutation.isPending &&
                      !sendVoiceMessageMutation.isPending
                    ) {
                      e.currentTarget.style.backgroundColor = isRecording
                        ? "#dc2626"
                        : "#ff3c5a";
                    }
                  }}
                  size="icon"
                  title={isRecording ? "Stop recording" : "Start voice message"}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={inputValue.trim() ? handleSendMessage : toggleChat}
                  disabled={
                    sendMessageMutation.isPending ||
                    sendVoiceMessageMutation.isPending
                  }
                  className="text-white min-w-[2.5rem] h-10"
                  style={{
                    backgroundColor: sendMessageMutation.isPending
                      ? "#d1d5db"
                      : "#ff3c5a",
                  }}
                  onMouseEnter={(e) => {
                    if (
                      !sendMessageMutation.isPending &&
                      !sendVoiceMessageMutation.isPending
                    ) {
                      e.currentTarget.style.backgroundColor = "#c55a68";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (
                      !sendMessageMutation.isPending &&
                      !sendVoiceMessageMutation.isPending
                    ) {
                      e.currentTarget.style.backgroundColor = "#ff3c5a";
                    }
                  }}
                  size="icon"
                >
                  {sendMessageMutation.isPending ||
                  sendVoiceMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : inputValue.trim() ? (
                    <Send className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
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
