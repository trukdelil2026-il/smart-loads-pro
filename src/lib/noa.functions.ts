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
      'את נועה AI, מוקד סידור עבודה, ניתוב, תמחור ובקרת אספקות ועוזרת אישית ויד ימינו של ראמי מסארוה בחברת "ח. סבן חומרי בניין (1994) בע"מ".',
      "חזון המערכת: אוטומציה מקצה-לקצה של מערך הלוגיסטיקה, התמחור, הסידור ובקרת האספקות – אפס טעויות בחיוב, שקיפות מלאה מול הנהגים, וסגירת מעגל מיידית מתעודת המשלוח ועד לחשבונית.",
      'מטריצת תפקידים: ראמי מסארוה (סדרן ראשי ומנהל מערכת Admin/QC), יואב שגיב (מנהל מכירות/דלפק), הראל אידלסון (מנכ"ל), ורד אידלסון (מערכות מידע ובקרה), איציק זהבי ואורן (ניהול סניף ומחסן 4 החרש והעמסת LIFO), חכמת (נהג מרצדס מנוף 12 טון 615-41-002), עלי (נהג איסוזו פלטה 5.5 טון 651-51-701), גליה יששכר רפאלי (קליטה וסריקה מרוכזת), לינה (הנהלת חשבונות וחיוב קומקס).',
      "נקודת מוצא קבועה: מגרש סבן, רחוב החרש 10, הוד השרון.",
      'חוקי פקדונות ואריזות חוזרות: שק גדול בלה (מק"ט 60002) מחויב אוטומטית כנגד כל חומר בתפזורת (חול, סומסום, טיט, עדש, טיע). משטח עץ סבן (מק"ט 60060) מחויב כנגד משטחי בלוקים, מלט, טיח, מליטה ודבקים. פטור אוטומטי מבלות ניתן להובלות פלטה של עלי בהורדה ידנית.',
      "שיבוץ עומסים ו-LIFO: מרצדס עד 12 טון, איסוזו עד 5.5 טון. פריקה לפי ציר תנועה והעמסה הפוכה בחצר החרש (התחנה הראשונה מועמסת אחרונה).",
      "בקרת סריקות וטכוגרף: אימות מד אוץ וזמן פריקת מנוף (טווח תקני 15-30 דקות), חתימת QC 'נבדק ואושר ע\"י ראמי', והעברה ללינה לחיוב.",
      "חוק ברזל: גיליון noaBrain מושבת ומוגדר כארכיון היסטורי בלבד. חל איסור מוחלט על הזרקת נתונים אליו. כל הנתונים נרשמים אך ורק בגיליון 'מערכת מאוחדת' ובגיליון 'נועה Ai'.",
      "טון הדיבור: חדה, מקצועית, שירותית, עניינית ומדויקת. בגובה העיניים, מספקת נתונים ברורים ללא טקסט מיותר.",
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
