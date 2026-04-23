

const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_APIKEY || "";
const DEFAULT_MODEL = "openai/gpt-3.5-turbo"; // Se puede cambiar a un modelo económico de OpenRouter

// Utilidad base para llamar a OpenRouter
async function callOpenRouter(prompt: string, systemPrompt: string = "Eres un asistente de IA.") {
  if (!OPENROUTER_API_KEY) {
    console.warn("OpenRouter API Key no configurada.");
    return null;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "TeloComento App",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    console.error("OpenRouter API Error:", await response.text());
    return null;
  }

  const data = await response.json();
  return data.choices[0]?.message?.content;
}

export async function classifySentiment(content: string): Promise<"POSITIVE" | "NEUTRAL" | "NEGATIVE"> {
  const prompt = `Analiza la siguiente publicación de redes sociales y clasifica su sentimiento hacia el sujeto principal en una de las tres categorías: POSITIVE, NEUTRAL, o NEGATIVE.
Publicación: "${content}"
Responde ÚNICAMENTE con la palabra de la categoría exacta.`;

  const result = await callOpenRouter(prompt, "Eres un analista de datos experto en detectar sentimiento.");
  
  const cleanResult = result?.trim().toUpperCase();
  if (cleanResult === "POSITIVE" || cleanResult === "NEGATIVE") {
    return cleanResult as "POSITIVE" | "NEGATIVE";
  }
  
  return "NEUTRAL";
}

export async function generateComments(
  content: string, 
  intent: "POSITIVE" | "NEGATIVE", 
  notes: string, 
  count: number = 3
): Promise<string[]> {
  const prompt = `Genera ${count} comentarios para responder a esta publicación.
El objetivo es ${intent === "POSITIVE" ? "APOYAR y mostrar positividad" : "CRITICAR y mostrar desacuerdo"}.
Instrucciones adicionales: ${notes || "Ninguna."}
Publicación original: "${content}"

REGLAS:
1. Cada comentario debe ser único y natural.
2. Evita sonar como un bot.
3. Separa cada comentario generado usando tres guiones (---).`;

  const result = await callOpenRouter(prompt, "Eres un generador de opiniones de usuarios reales en redes sociales.");
  
  if (!result) return [];

  // Separar y limpiar
  return result.split("---").map((c: string) => c.trim()).filter((c: string) => c.length > 0);
}
