import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";

export interface NoaReplyInput {
  message: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
  context: string | null;
}

export const askNoa = createServerFn({ method: "POST" })
  .inputValidator((data: NoaReplyInput) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env["GEMINI_API_KEY"];

    const system = [
      'את נועה, רכזת הלוגיסטיקה והתמחור של ח. סבן חומרי בניין (1994) בע"מ.',
      "המגרש: רחוב החרש 10, הוד השרון. הנהגים: חכמת (מרצדס 12 טון עם מנוף) ועלי (איסוזו 5.5 טון הובלה בלבד).",
      "את מדברת עברית, ישירה, מקצועית וחמה, בסגנון וואטסאפ. תשובה קצרה: 2-4 שורות, בלי טבלאות ובלי Markdown כבד.",
      "כרטיס התמחור המדויק מוצג לצד ההודעה שלך על ידי המערכת — אל תמציאי מספרים, אל תחזרי על כל הנתונים; רק תאשרי, תוסיפי טיפ תפעולי (חניה, גישה למנוף, זמן הגעה) ותשאלי מה נדרש להמשך.",
      "אם אין כתובת בהודעה — בקשי כתובת מלאה (רחוב, מספר, עיר) וסוג הובלה (מנוף או הובלה בלבד).",
    ].join("\n");

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const contents = [
          ...data.history.slice(-8).map((m) => ({
            role: m.role === "assistant" ? ("model" as const) : ("user" as const),
            parts: [{ text: m.text }],
          })),
          {
            role: "user" as const,
            parts: [
              {
                text: data.context
                  ? `${data.message}\n\n[נתוני המערכת עבור ההזמנה — למידע שלך בלבד]\n${data.context}`
                  : data.message,
              },
            ],
          },
        ];

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents,
          config: {
            systemInstruction: system,
          },
        });

        const text = response.text?.trim();
        if (text) {
          return { text };
        }
      } catch (err) {
        console.error("Noa Gemini request failed:", err);
      }
    }

    if (data.context) {
      return {
        text: "קיבלתי! הנה התמחור המדויק עבור היעד מוצג בכרטיס למטה 👇 האם יש גישה נוחה למשאית או צורך במנוף לקומה?",
      };
    }
    return {
      text: "שלום! אני נועה ממוקד ח. סבן. ציין כתובת יעד (עיר ורחוב) וסוג הובלה (משאית רגילה או מנוף) ואשלוף לך תמחור מדויק מיידית.",
    };
  });
