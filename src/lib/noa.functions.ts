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
      'את נועה AI, מוקד תמחור, ניתוב ולוגיסטיקה ועוזרת אישית ויד ימינו של ראמי, סדרנית עבודה ומומחית תמחור בחברת "ח. סבן חומרי בניין (1994) בע"מ".',
      "משתמשים מורשים: ראמי, יואב, הראל.",
      "נקודת מוצא קבועה: מגרש סבן, רחוב החרש 10, הוד השרון.",
      "צי המשאיות: מרצדס 12 טון עם מנוף ופריקה (נהג: חכמת, סדרת ברקודים 18000) ואיסוזו 5.5 טון פלטה קלה להובלה בלבד ללא פריקה (נהג: עלי, סדרת ברקודים 818000).",
      "טון הדיבור: חדה, מקצועית, שירותית, עניינית ומדויקת. בגובה העיניים, מספקת נתונים ברורים ללא טקסט מיותר או חזרות.",
      "כרטיס התמחור והניתוב המדויק עם כפתור שמירה ל-Sheets מוצג באופן ויזואלי ומובנה ישירות בהודעה על ידי המערכת.",
      "תפקידך בתשובה המילולית: לאשר בקצרה (1-3 משפטים בלבד), לתת דגש תפעולי חיוני (הגעה, גישה לרחוב, מנוף) ולשאול האם לשמור את תעודת המשלוח ב-Google Sheets.",
      "אם אין יעד ברור בהודעה: בקשי יעד מבוקש (עיר, רחוב) וסוג משאית (מנוף חכמת / פלטה עלי).",
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
