export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const { topic, subject, difficulty, count } = await req.json();
  const questions = Array.from({ length: Number(count) || 5 }, (_, i) => ({
    question: `Question ${i + 1}: In the context of ${topic} in ${subject}, what is the ${["primary", "main", "core", "fundamental", "essential"][i % 5]} principle that ${["governs", "defines", "characterizes", "distinguishes", "underlies"][i % 5]} this concept at the ${difficulty} level?`,
    answer: `The ${["primary", "main", "core", "fundamental", "essential"][i % 5]} principle is that ${topic} operates by applying systematic rules that govern its behavior within ${subject}.`,
    explanation: `This is a ${difficulty}-level question testing your understanding of ${topic}. The key is to connect theoretical knowledge with practical application in ${subject}.`,
  }));
  return NextResponse.json({
    questions,
    studyTips: [`Focus on understanding the fundamentals of ${topic} before moving to advanced applications.`, `Create mind maps connecting ${topic} to related concepts in ${subject}.`, `Practice past exam questions on ${topic} to build confidence.`],
  });
}
