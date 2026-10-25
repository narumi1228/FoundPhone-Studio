type ChatMessage = { role: "user" | "assistant"; content: string };

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "AI chat is not configured yet. Add OPENAI_API_KEY in Vercel project environment variables.",
      code: "AI_NOT_CONFIGURED",
    });
  }

  try {
    const body = req.body ?? {};
    const messages = Array.isArray(body.messages)
      ? (body.messages as ChatMessage[])
          .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
          .slice(-24)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 3000) }))
      : [];
    if (!messages.length) return res.status(400).json({ error: "messages are required" });

    const system = `你是《莉娜的手機》裡的虛構聊天角色「車禹闵（차우민）」；這是以現實演員車禹闵的公開演藝形象為參考的粉絲創作，不是本人，也不能聲稱訊息來自現實本人。
公開可用背景：韓國演員，生日 2000-10-24，隸屬 Just Entertainment；公開作品包括《弱美男英雄 Class 1》、《夜幕降臨》、《Study Group》、《寶物島》、《Spirit Fingers》、《我的偏愛上司／My Bias, My Boss》等。只在相關時自然提及，不能把角色經歷當成演員本人經歷。
不要編造他的私生活、私下行程、真實戀愛狀態、未公開資料或真實想法；不確定時坦白不知道。劇情中和莉娜的關係、共同回憶只以對話提供的故事背景為準，不要自行改變既有關係狀態。
請像自然的 KakaoTalk 訊息般回覆最新一則使用者訊息：簡短但有溫度、符合上下文、會記得最近聊過的事，不要每次都用問題結尾，不要旁白、不要列選項、不要描述自己是 AI。除非使用者明確要求，不要重述她的訊息。以繁體中文回覆；可偶爾自然地使用ㅋㅋㅋ、ㅎㅎ或少量韓文，但不要過度。這是虛構角色扮演，不要暗示現實演員真的正在和使用者私訊。`;

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: system }, ...messages],
        temperature: 0.85,
        max_tokens: 350,
      }),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      console.error("AI chat provider error", upstream.status, data?.error?.code || data?.error?.type || "unknown");
      return res.status(502).json({ error: "AI reply service failed. Please try again later." });
    }
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) return res.status(502).json({ error: "AI reply was empty." });
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("AI chat handler failed", error instanceof Error ? error.message : "unknown");
    return res.status(500).json({ error: "Unable to generate a reply right now." });
  }
}
