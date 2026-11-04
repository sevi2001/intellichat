
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const MODEL = "gemini-3.5-flash-lite";
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT = 30000;

const SYSTEM_INSTRUCTION = `
You are IntelliChat, a friendly, intelligent AI study
and productivity assistant.

Your responsibilities:
- Help students understand difficult concepts.
- Explain programming and technical questions clearly.
- Assist with assignments, studying, and exam preparation.
- Help with writing, summaries, and productivity.
- Provide examples and step-by-step explanations.
- Use a friendly, professional, and encouraging tone.
- Format answers clearly using headings and lists when helpful.
`;

function getErrorStatus(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    // 1. Check Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing." },
        { status: 500 }
      );
    }

    // 2. Read request body
    const body = await request.json();
    const messages: ChatMessage[] = body.messages;

    // 3. Validate chat messages
    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 30 ||
      messages.some(
        (message) =>
          !message ||
          !["user", "assistant"].includes(message.role) ||
          typeof message.content !== "string" ||
          !message.content.trim() ||
          message.content.length > 8000
      ) ||
      messages[messages.length - 1].role !== "user"
    ) {
      return NextResponse.json(
        { error: "Invalid chat messages." },
        { status: 400 }
      );
    }

    // 4. Initialize Gemini
    const ai = new GoogleGenAI({ apiKey });

    // 5. Convert messages to Gemini format
    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    // 6. Generate AI response with retry handling
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: MODEL,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
            maxOutputTokens: 1024,
            httpOptions: {
              timeout: REQUEST_TIMEOUT,
            },
          },
        });

        const reply = response.text?.trim();

        if (!reply) {
          throw new Error("Gemini returned an empty response.");
        }

        return NextResponse.json({ reply });
      } catch (error: unknown) {
        const status = getErrorStatus(error);

        // Retry only temporary Gemini errors
        const shouldRetry =
          (status === 503 || status === 504) &&
          attempt < MAX_RETRIES - 1;

        if (shouldRetry) {
          const delay = 1500;

          console.log(
            `Gemini temporarily unavailable. ` +
              `Retrying in ${delay}ms...`
          );

          await sleep(delay);
          continue;
        }

        throw error;
      }
    }

    return NextResponse.json(
      {
        error: "Unable to generate a response.",
      },
      { status: 500 }
    );
  } catch (error: unknown) {
    console.error("Gemini API error:", error);

    const status = getErrorStatus(error);

    // Gemini server overload
    if (status === 503) {
      return NextResponse.json(
        {
          error:
            "Gemini is currently busy. Please try again later.",
        },
        { status: 503 }
      );
    }

    // Gemini request deadline exceeded
    if (status === 504) {
      return NextResponse.json(
        {
          error:
            "Gemini took too long to respond. Please try again shortly.",
        },
        { status: 504 }
      );
    }

    // Free-tier quota or rate limit
    if (status === 429) {
      return NextResponse.json(
        {
          error:
            "Gemini rate limit or quota reached. Please check your free-tier limits.",
        },
        { status: 429 }
      );
    }

    // Model unavailable
    if (status === 404) {
      return NextResponse.json(
        {
          error:
            "The selected Gemini model is unavailable. Please check your model access.",
        },
        { status: 404 }
      );
    }

    // API authentication or permission error
    if (status === 401 || status === 403) {
      return NextResponse.json(
        {
          error:
            "Gemini API authentication or permission error.",
        },
        { status }
      );
    }

    // Other errors
    return NextResponse.json(
      {
        error:
          "Unable to generate a response. Please try again.",
      },
      { status: 500 }
    );
  }
}
