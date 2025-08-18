import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Bot,
  User,
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
      sampleRate: 16000,
    });

    const fileReader = new FileReader();

    fileReader.onload = async () => {
      try {
        const arrayBuffer = fileReader.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const channelData =
          audioBuffer.numberOfChannels > 1
            ? audioBuffer.getChannelData(0)
            : audioBuffer.getChannelData(0);

        const int16Array = new Int16Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
          const sample = Math.max(-1, Math.min(1, channelData[i]));
          int16Array[i] = sample * 0x7fff;
        }

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

function createWavBuffer(
  samples: Int16Array,
  sampleRate: number,
  numChannels: number
): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

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
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  const offset = 44;
  for (let i = 0; i < samples.length; i++) {
    view.setInt16(offset + i * 2, samples[i], true);
  }

  return buffer;
}

export function MainChat() {
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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

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
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

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

    sendMessageMutation.mutate(message);
  };

  const startRecording = async () => {
    try {
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

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        try {
          const wavBlob = await convertWebMToWav(audioBlob);
          sendVoiceMessageMutation.mutate(wavBlob);
        } catch (error) {
          console.error("Error converting audio:", error);
        }

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

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      {/* Chat Header */}
      {/* <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: "#ff3c5a" }}
          >
            R
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Rebel Energy Assistant</h2>
            <p className="text-sm text-gray-500">Always here to help</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearChat}
          className="text-gray-600 hover:text-gray-800"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div> */}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ marginBottom : "3rem" }}>
        {messages.length === 1 && (
          <div className="text-center py-12">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
              style={{ backgroundColor: "#ff3c5a" }}
            >
              R
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              How can I help you today?
            </h3>
            <p className="text-gray-600 mb-6">
              Ask me about your energy account, billing, service requests, or any other questions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <div className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors">
                <p className="text-sm text-gray-700">Check my account balance</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors">
                <p className="text-sm text-gray-700">Report a power outage</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors">
                <p className="text-sm text-gray-700">Set up a payment plan</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors">
                <p className="text-sm text-gray-700">Energy efficiency tips</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start space-x-3",
              !message.isBot && "justify-end"
            )}
          >
            {message.isBot && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ backgroundColor: "#ff3c5a" }}
              >
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAP1BMVEVHcEz/Clv/C1z/AFr/AFv/BFv/JGj/Blv/BFr/AVf/AFX/AE3/S3v/wM3/mLD/b5L+//7+2+H/Y4r/MW3/AFrLm4l5AAAAFXRSTlMATJXI/+oTpo0i/////////////8OBOylAAAAA/klEQVR4AWySAQJAIAxFkx+sAO5/VkvVBg/Aq22LUTS2BeBa25gfuh6KvjMvBrywz+EOH5yaZMQvYx0PgLz3RP6GkClzOIDCNE1zPPFlKYqT/GhZ13Xb18ziVaYdtFAMkiC9CGFjkpGn6FmACP5mjsKep+D+auG+9XGSOQuNsW8BLEgS1rRaoIhfmSMLrXFKoMAsm0wWWwH8lLmh8itsB4ngPkIkUA1xvquId5LD+S0zNaoIw7tRkbtMlEaZb6P0asliiaBb3ctyK2GS+84w9iXQXns91F8OYWZyXB/vFyq/XAnCIEP5obtGKNkTnXHALsXIeqRkXkT2F2HFyP4Au4kbEfvki2cAAAAASUVORK5CYII=" alt="R" />
              </div>
            )}

            <div
              className={cn(
                "max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl",
                message.isBot
                  ? "bg-gray-100 text-gray-900"
                  : "text-white"
              )}
              style={
                message.isBot
                  ? {}
                  : { backgroundColor: "#ff3c5a" }
              }
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <span
                className={cn(
                  "text-xs mt-1 block",
                  message.isBot ? "text-gray-500" : "text-pink-100"
                )}
              >
                {message.timestamp}
              </span>
            </div>

            {!message.isBot && (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Message */}
        {(sendMessageMutation.isPending || sendVoiceMessageMutation.isPending) && (
          <div className="flex items-start space-x-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ backgroundColor: "#ff3c5a" }}
            >
              R
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
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
      <div className="border-t border-gray-200 p-4" style={{ position : "fixed" , left : 0, right : 0,bottom: 0, width: "100%", backgroundColor: "white" }}>
        <div className="flex items-end space-x-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="resize-none min-h-[3rem] max-h-32 pr-12 border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              rows={1}
            />
          </div>

          <Button
          variant="outline"
          size="icon"
          onClick={handleClearChat}
          className="h-12 w-12"
        >
          <RotateCcw className="h-5 w-5" />
          {/* New Chat */}
        </Button>
          
          <Button
            onClick={handleVoiceToggle}
            disabled={
              sendMessageMutation.isPending || sendVoiceMessageMutation.isPending
            }
            variant="outline"
            size="icon"
            className={cn(
              "h-12 w-12 border-gray-300",
              isRecording ? "animate-pulse bg-red-50 border-red-300" : ""
            )}
            title={isRecording ? "Stop recording" : "Start voice message"}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5 text-red-600" />
            ) : (
              <Mic className="h-5 w-5 text-gray-600" />
            )}
          </Button>

          <Button
            onClick={handleSendMessage}
            disabled={
              !inputValue.trim() ||
              sendMessageMutation.isPending ||
              sendVoiceMessageMutation.isPending
            }
            className="h-12 w-12 text-white"
            style={{ backgroundColor: "#ff3c5a" }}
            size="icon"
          >
            {sendMessageMutation.isPending || sendVoiceMessageMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}