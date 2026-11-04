
import { GoogleGenAI } from "@google/genai";
import { readFileSync } from "node:fs";

const env = readFileSync(".env.local", "utf8");

const keyLine = env
  .split(/\r?\n/)
  .find((line) => line.startsWith("GEMINI_API_KEY="));

const apiKey = keyLine?.slice("GEMINI_API_KEY=".length).trim();

if (!apiKey) {
  throw new Error("GEMINI_API_KEY not found in .env.local");
}

const ai = new GoogleGenAI({ apiKey });

for await (const model of await ai.models.list()) {
  console.log(model.name);
}
