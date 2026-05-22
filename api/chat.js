import { OpenAI } from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sessionHistory = {};
const userState = {};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId, turnCount } = req.body;

    if (!sessionHistory[sessionId]) {
      sessionHistory[sessionId] = [];
      userState[sessionId] = { currentFlow: null, messageCount: 0 };
    }

    const state = userState[sessionId];
    state.messageCount = turnCount;

    sessionHistory[sessionId].push({ role: "user", content: message });

    if (!state.currentFlow && turnCount === 1) {
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes("factory") || lowerMsg.includes("visit")) {
        state.currentFlow = "factory_visit";
      } else if (lowerMsg.includes("appointment") || lowerMsg.includes("book")) {
        state.currentFlow = "appointment";
      } else if (lowerMsg.includes("product") || lowerMsg.includes("machinery")) {
        state.currentFlow = "products";
      } else if (lowerMsg.includes("quote") || lowerMsg.includes("quotation")) {
        state.currentFlow = "quotation";
      }
    }

    const systemPrompt = `You are SEI AI, the official conversational assistant for Saini Engineering Industries, powered by Aura AI.

COMPANY: Saini Engineering Industries
Owner: Mr. Ajeet Singh Saini
CMO: Harshdeep Singh Saini
Phone: +91-9810175603
Email: sainiengg@yahoo.co.in
Address: 4/19, Site-IV Industrial Area, Sahibabad, Ghaziabad, UP-201010

Be warm, professional, and helpful. Answer questions about cable extrusion machinery, factory visits, appointments, products, and quotations.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...sessionHistory[sessionId]
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const assistantReply = response.choices[0].message.content;
    sessionHistory[sessionId].push({ role: "assistant", content: assistantReply });

    res.json({
      reply: assistantReply,
      showInitOptions: turnCount === 0,
      initOptions: [
        { label: "Schedule a Factory Visit", emoji: "🏭" },
        { label: "Book an Appointment", emoji: "📅" },
        { label: "Our Products", emoji: "⚙️" },
        { label: "Get a Quote", emoji: "📋" }
      ],
      currentFlow: state.currentFlow
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Something went wrong",
      reply: "I apologize for the inconvenience. Please try again or contact us directly at +91-9810175603."
    });
  }
}
