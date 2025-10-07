import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey:'AIzaSyAzC20vRlQuqAfiVH-VTLiR1zuPCXc0ZUY'});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
         role:'user',
         parts:[{text:"hi,i am rohit"}]
      },
      {
        role: 'model',
        parts:[{text: "Hi Rohit, it's nice to meet you! How can I help you today?"}]
      },
      {
        role: 'user',
        parts:[{ text: "what is my name "}]
      }
  ]
  });
  console.log(response.text);
}

await main();