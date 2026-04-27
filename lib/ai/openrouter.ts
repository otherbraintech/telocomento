

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
  const prompt = `Actúa como un usuario real de redes sociales en una conversación casual. 
Genera ${count} comentarios para responder a esta publicación.
El objetivo es ${intent === "POSITIVE" ? "APOYAR (estar de acuerdo)" : "CRITICAR (mostrar desacuerdo)"}.
Instrucciones extra del usuario: ${notes || "Ninguna."}

Publicación original: "${content}"

REGLAS CRÍTICAS:
1. TONO BOLIVIANO: Escribe como un usuario de BOLIVIA (tono coloquial, "criollo"). Usa expresiones naturales de allá pero sin exagerar. PROHIBIDO usar "menudo", "vaya", "estupendo" o jergas de España/México.
2. IDENTIFICA AL SUJETO: Lee las instrucciones extra. Si se menciona un nombre (ej. "Sebastian"), asegúrate de incluirlo en el comentario para que sea específico. No ataques al autor del post.
3. PROHIBIDO usar emojis o emoticonos.
4. SIN PUNTOS FINALES: Casi nadie usa punto final en redes sociales. NO termines los comentarios con un punto (.).
5. PUNTUACIÓN RELAJADA: Usa principalmente COMAS (,) para separar ideas. No uses signos de exclamación excesivos.
6. VARIEDAD: Haz algunos muy cortos y otros un poco más largos (máximo 20 palabras).
7. Separa cada comentario generado usando tres guiones (---).`;

  const result = await callOpenRouter(prompt, "Eres un usuario real de redes sociales, directo, coloquial y sin rodeos. No usas emojis y escribes de forma natural.");
  
  if (!result) return [];

  // Separar y limpiar
  return result.split("---").map((c: string) => c.trim()).filter((c: string) => c.length > 0);
}
