// services/translatorApi.ts

interface TranslationOutputItem {
  source?: string;
  target: string;
}

interface TranslationResponse {
  output?: TranslationOutputItem[];
}

export async function translateText(
  text: string[],
  targetLang?: string
): Promise<TranslationOutputItem[] | null> {

  targetLang = sessionStorage.getItem("langId") || targetLang;

  if (!text || !text.length) return null;

  const url =
    "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/compute";

  try {
    const res: Response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        modelId: targetLang,
        input: text,
        task: "translation",
        userId: null,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: TranslationResponse = await res.json();

    if (!data.output || !data.output.length) {
      return null;
    }

    return data.output;

  } catch (err) {
    console.error("Translate API error", err);
    return null;
  }
}