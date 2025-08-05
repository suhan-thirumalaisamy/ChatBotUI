import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { LexRuntimeV2Client, RecognizeTextCommand, RecognizeUtteranceCommand } from "@aws-sdk/client-lex-runtime-v2";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Initialize Lex Runtime V2 Client
const lexClient = new LexRuntimeV2Client({
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  }
});

export async function sendTextToLex(
  message: string = "",
  sessionId: string = "demo-session-001"
) {
  try {
    const command = new RecognizeTextCommand({
      botId: import.meta.env.VITE_LEX_BOT_ID,
      botAliasId: import.meta.env.VITE_LEX_BOT_ALIAS_ID || 'TSTALIASID',
      localeId: import.meta.env.VITE_LEX_LOCALE_ID || 'en_US',
      sessionId: sessionId,
      text: message,
    });

    const response = await lexClient.send(command);
    
    // Extract the response message from Lex
    const botMessage = response.messages?.[0]?.content || "I'm sorry, I didn't understand that.";
    
    return {
      agentResponse: botMessage,
      sessionState: response.sessionState,
      interpretations: response.interpretations
    };
  } catch (error) {
    console.error('Error communicating with Lex:', error);
    throw new Error('Failed to communicate with the chatbot. Please try again.');
  }
}

export async function sendVoiceToLex(
  audioBlob: Blob,
  sessionId: string = "demo-session-001"
) {
  try {
    const audioBuffer = await audioBlob.arrayBuffer();
    const audioUint8Array = new Uint8Array(audioBuffer);

    const command = new RecognizeUtteranceCommand({
      botId: import.meta.env.VITE_LEX_BOT_ID,
      botAliasId: import.meta.env.VITE_LEX_BOT_ALIAS_ID || 'TSTALIASID',
      localeId: import.meta.env.VITE_LEX_LOCALE_ID || 'en_US',
      sessionId: sessionId,
      requestContentType: 'audio/webm;codecs=opus',
      inputStream: audioUint8Array,
    });

    const response = await lexClient.send(command);
    
    // Extract the response message from Lex
    const botMessage = response.messages || "I'm sorry, I didn't understand that.";
    
    return {
      agentResponse: botMessage,
      sessionState: response.sessionState,
      interpretations: response.interpretations,
      inputTranscript: response.inputTranscript
    };
  } catch (error) {
    console.error('Error sending voice to Lex:', error);
    throw new Error('Failed to process voice message. Please try again.');
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
