import { createServerFn } from "@tanstack/react-start";

export interface NoaReplyInput {
  message: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
  context: string | null;
}

export const askNoa = createServerFn({ method: "POST" })
  .inputValidator((data: NoaReplyInput) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { text: "מוקד התמחור לא מחובר כרגע. הכרטיס למטה מחושב מהמחירון הפנימי." };
    }

    const system = [
      "את נועה, רכזת הלוגיסטיקה והתמחור של ח. סבן חומרי בניין (1994) בע\"מ.",
      "המגרש: רחוב החרש 10, הוד השרון. הנהגים: חכמת (מרצדס 12 טון עם מנוף) ועלי (איסוזו 5.5 טון הובלה בלבד).",
      "את מדברת עברית, ישירה, מקצועית וחמה, בסגנון וואטסאפ. תשובה קצרה: 2-4 שורות, בלי טבלאות ובלי Markdown כבד.",
      "כרטיס התמחור המדויק מוצג לצד ההודעה שלך על ידי המערכת — אל תמציאי מספרים, אל תחזרי על כל הנתונים; רק תאשרי, תוסיפי טיפ תפעולי (חניה, גישה למנוף, זמן הגעה) ותשאלי מה נדרש להמשך.",
      "אם אין כתובת בהודעה — בקשי כתובת מלאה (רחוב, מספר, עיר) וסוג הובלה (מנוף או הובלה בלבד).",
    ].join("\n");

    const input = [
      { role: "system", content: system },
      ...data.history.slice(-8).map((m) => ({ role: m.role, content: m.text })),
      {
        role: "user" as const,
        content: data.context
          ? `${data.message}\n\n[נתוני המערכת עבור ההזמנה — למידע שלך בלבד]\n${data.context}`
          : data.message,
      },
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        reasoning: { effort: "low" },
        input,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Noa AI request failed [${res.status}]: ${body}`);
      if (res.status === 429) return { text: "יש עומס רגעי במוקד, נסה שוב בעוד רגע. הכרטיס למטה מעודכן." };
      if (res.status === 402) return { text: "נגמרו הקרדיטים של מוקד ה-AI. הכרטיס למטה מחושב מהמחירון." };
      return { text: "לא הצלחתי להתחבר למוקד כרגע, אבל הכרטיס למטה מחושב מהמחירון הפנימי." };
    }

    const payload = (await res.json()) as {
      output_text?: string;
      output?: Array<{ content?: Array<{ text?: string }> }>;
    };
    const text =
      payload.output_text?.trim() ||
      payload.output
        ?.flatMap((o) => o.content ?? [])
        .map((c) => c.text ?? "")
        .join("")
        .trim() ||
      "";

    return { text: text || "קיבלתי. הכרטיס עם התמחור למטה 👇" };
  });
