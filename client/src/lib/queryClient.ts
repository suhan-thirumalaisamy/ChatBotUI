import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { LexRuntimeV2Client, RecognizeTextCommand, RecognizeUtteranceCommand } from "@aws-sdk/client-lex-runtime-v2";
import { fetchAuthSession } from 'aws-amplify/auth';

async function decodeLexResponse(encodedResponse: string): Promise<any> {
  try {
    // Decode base64
    const binaryString = atob(encodedResponse);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Decompress using gzip (if compressed)
    const decompressed = await decompressGzip(bytes);
    
    // Convert to string
    const decoder = new TextDecoder('utf-8');
    const result = decoder.decode(decompressed);
    
    return result;
  } catch (error) {
    console.error('Error decoding Lex response:', error);
    throw new Error('Failed to decode response');
  }
}

// Gzip decompression using CompressionStream API (modern browsers)
async function decompressGzip(compressedData: Uint8Array): Promise<Uint8Array> {
  try {
    // Create a readable stream from the compressed data
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(compressedData);
        controller.close();
      }
    });
    
    // Create decompression stream
    const decompressionStream = new DecompressionStream('gzip');
    const decompressedStream = stream.pipeThrough(decompressionStream);
    
    // Read the decompressed data
    const reader = decompressedStream.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    return result;
  } catch (error) {
    console.error('Gzip decompression failed:', error);
    throw error;
  }
}

// Alternative: Manual gzip decompression (fallback for older browsers)
function decompressGzipManual(data: Uint8Array): Uint8Array {
  // This is a simplified implementation
  // For production, consider using a library like pako
  
  // Check gzip magic number
  if (data[0] !== 0x1f || data[1] !== 0x8b) {
    throw new Error('Not a valid gzip file');
  }
  
  // Skip gzip header (simplified)
  let offset = 10;
  
  // Skip extra fields, filename, comment if present
  const flags = data[3];
  if (flags & 0x04) { // FEXTRA
    const xlen = data[offset] | (data[offset + 1] << 8);
    offset += 2 + xlen;
  }
  if (flags & 0x08) { // FNAME
    while (data[offset++] !== 0);
  }
  if (flags & 0x10) { // FCOMMENT
    while (data[offset++] !== 0);
  }
  if (flags & 0x02) { // FHCRC
    offset += 2;
  }
  
  // For a complete implementation, you'd need to implement DEFLATE decompression
  // This is complex, so I recommend using the Compression Streams API above
  // or a library like pako for older browser support
  
  throw new Error('Manual gzip decompression not fully implemented. Use modern browser with CompressionStream support or pako library.');
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

let lexClient: LexRuntimeV2Client;

const getLexClient = async () => {
  try {
    if(lexClient) {
      return lexClient;
    }
    const session = await fetchAuthSession();
    
    lexClient =  new LexRuntimeV2Client({
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      credentials: session.credentials,
    });
    return lexClient;
  } catch (error) {
    console.error('Error creating Lex client:', error);
    throw error;
  }
};


export async function sendTextToLex(
  message: string = "",
  sessionId: string = "demo-session-001"
) {
  try {
    const lexClient = await getLexClient();
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
    const lexClient = await getLexClient();
    const audioBuffer = await audioBlob.arrayBuffer();
    const audioUint8Array = new Uint8Array(audioBuffer);

    const command = new RecognizeUtteranceCommand({
      botId: import.meta.env.VITE_LEX_BOT_ID,
      botAliasId: import.meta.env.VITE_LEX_BOT_ALIAS_ID || 'TSTALIASID',
      localeId: import.meta.env.VITE_LEX_LOCALE_ID || 'en_US',
      sessionId: sessionId,
      requestContentType: 'audio/x-l16; sample-rate=16000; channel-count=1',
      responseContentType: 'text/plain;charset=utf-8',
      inputStream: audioUint8Array,
    });

    const response = await lexClient.send(command);
    console.log('Lex response:', response);
    response.inputTranscript = await decodeLexResponse(response.inputTranscript || "");
    response.messages = await decodeLexResponse(response.messages || "");
    let messages = JSON.parse(response.messages || "[]");
    // Extract the response message from Lex
    const botMessage = messages?.[0]?.content || "I'm sorry, I didn't understand that.";
    
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
