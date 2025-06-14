import { GoogleGenAI, GenerateContentResponse } from "@google/genai";


export async function reviewCode(code: string, language: string, filesReviewed: string[] = []): Promise<string> {
  if (!import.meta.env.VITE_API_KEY) {
    console.error("API_KEY environment variable is not set.");
    throw new Error("API_KEY environment variable is not set. Please configure it to use the AI features.");
  }

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  const model = import.meta.env.VITE_GEMINI_2;
  
  let filesContext = "";
  if (filesReviewed.length > 0) {
    filesContext = `The code provided below is a concatenation of the following file(s) from a ${language} repository: ${filesReviewed.join(', ')}. Please consider this context in your review.`;
  } else {
    filesContext = `The code provided below is from a ${language} context.`;
  }

  const prompt = `
Act as an expert AI code reviewer. Your task is to analyze the provided code snippet(s) and offer a detailed, constructive review.
${filesContext}

Please structure your feedback clearly. You can use markdown for formatting, like headings, bold text, bullet points, and code blocks. Address each of the following sections relevant to the provided code:

**1. Overview & General Impression:**
   - A brief summary of the code's purpose (if discernible) and your overall assessment.

**2. Potential Bugs & Logical Errors:**
   - Identify any bugs, logical flaws, or unhandled edge cases. Provide specific examples from the code.

**3. Code Quality & Readability:**
   - Comment on code clarity, organization, naming conventions, and comments.
   - Suggest improvements for maintainability and readability.

**4. Adherence to Best Practices & Conventions (${language}-specific):**
   - Evaluate if the code follows common best practices, idiomatic patterns, and style guides for ${language}.

**5. Performance Considerations (if applicable):**
   - Point out any potential performance bottlenecks and suggest optimizations if evident.

**6. Security Vulnerabilities (if applicable):**
   - Highlight any security concerns (e.g., input validation, data exposure, common vulnerabilities for ${language}).

**7. Suggestions for Improvement & Refactoring:**
   - Provide concrete, actionable suggestions for making the code better, more robust, or more efficient. Use code examples for suggestions where helpful.

**8. Positive Aspects (Optional but encouraged):**
   - Mention any parts of the code that are well-written, demonstrate good practices, or solve problems effectively.

Please be thorough, constructive, and provide actionable advice. If the code is too short or lacks context for a full review, state that and provide feedback on what is available.

Code to review:
\`\`\`${language}
${code}
\`\`\`
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    const resultText = response.text;

    if (resultText) {
      return resultText;
    } else {
      const candidateText = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText) return candidateText;
      
      console.warn("Gemini API returned an empty or unexpected response structure.", response);
      throw new Error("Received no feedback from the AI. The response might be empty or in an unexpected format.");
    }
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    if (error.message && error.message.toLowerCase().includes("api key not valid")) { // More robust check
        throw new Error("Invalid API Key. Please check your API_KEY environment variable.");
    }
    if (error.message && error.message.includes("quota")) {
        throw new Error("API quota exceeded. Please check your Gemini API quota or try again later.");
    }
     if (error.status === 400 || (error.message && error.message.toLowerCase().includes("parse input error"))){
        throw new Error(`The AI model could not process the request, possibly due to the input format or content. Details: ${error.message}`);
    }
    if (error.message && error.message.toLowerCase().includes("candidate was blocked due to safety")){
        throw new Error("The code review was blocked due to safety concerns with the input or output content.");
    }
    throw new Error(`Failed to get review from AI: ${error.message || 'Unknown error from Gemini API'}`);
  }
}
