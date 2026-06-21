import { GoogleGenerativeAI } from '@google/generative-ai';

// Fallback to empty string, user can set it in environment if testing locally, 
// but AI Studio securely injects it for server-side if properly configured.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSy_REPLACE_WITH_YOUR_KEY";
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateQuiz = async (fileName, topic, numQuestions) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
  You are an expert educational AI. Generate a multiple-choice quiz in Arabic based on the textbook context provided by the user.
  Textbook Name/Context: "${fileName}"
  Target Topic/Chapter: "${topic}"
  Number of Questions: ${numQuestions}

  Respond STRICTLY with a valid JSON array of objects. Do NOT wrap it in markdown block quotes like \`\`\`json.
  Schema for each object:
  {
    "question": "The question text here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswerIndex": 0, // Integer 0-3
    "explanation": "Explanation of why this is correct",
    "source": "Page X or Chapter Y"
  }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();
  
  // Cleanup markdown if present
  if (text.includes('\`\`\`')) {
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
  }
  
  return JSON.parse(text);
};

export const generateSummary = async (fileName, topic) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
  You are an expert summarizer. Summarize the following Arabic textbook topic.
  Textbook Name: "${fileName}"
  Target Topic/Chapter: "${topic}"

  Extract ONLY: Important Rules (RULE), Key Points (POINT), and Examples with explanations (EXAMPLE). Ignore all fluff.
  
  Respond STRICTLY with a valid JSON array of objects. Do NOT wrap it in markdown block quotes like \`\`\`json.
  Schema for each object:
  {
    "title": "Title of point/rule/example",
    "content": "Detailed explanation or example content",
    "type": "RULE" // Must be one of: "RULE", "POINT", "EXAMPLE"
  }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();
  
  // Cleanup markdown
  if (text.includes('\`\`\`')) {
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
  }
  
  return JSON.parse(text);
};
