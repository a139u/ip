import axios from "axios";
import type { Address } from "@/app/types";

interface TavilySearchResult {
  url: string;
  title: string;
  content: string;
}

interface TavilyResponse {
  results: TavilySearchResult[];
}

const TAVILY_API_KEYS = [
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
];

let currentKeyIndex = 0;

function getNextApiKey(): string {
  const key = TAVILY_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % TAVILY_API_KEYS.length;
  return key;
}

export interface LocationAnalysis {
  schools: string;
  hospitals: string;
  shopping: string;
  famousPeople: string;
  specialties: string;
  customs: string;
  sources: string[];
}

class TavilyService {
  async searchAddress(address: Address): Promise<LocationAnalysis> {
    const query = this.buildSearchQuery(address);
    const results = await this.tavilySearch(query, 10);

    return this.analyzeResults(results, address);
  }

  private buildSearchQuery(address: Address): string {
    const parts = [
      address.road,
      address.city,
      address.state,
      address.country,
    ].filter(Boolean);

    if (parts.length === 0) return "unknown location";

    return parts.join(", ");
  }

  private async tavilySearch(query: string, maxResults = 10): Promise<TavilySearchResult[]> {
    const apiKey = getNextApiKey();

    try {
      const response = await axios.post<TavilyResponse>(
        "https://api.tavily.com/search",
        {
          query,
          search_depth: "basic",
          max_results: maxResults,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      return response.data.results || [];
    } catch (error) {
      console.error("Tavily search error:", error);
      return [];
    }
  }

  private extractItems(results: TavilySearchResult[], keywords: string[]): string {
    const items: string[] = [];
    const combined = results.map((r) => r.content).join(" ");

    for (const keyword of keywords) {
      const sentences = combined.split(/[.。!！?？]/);
      for (const sentence of sentences) {
        const lowerSentence = sentence.toLowerCase();
        if (lowerSentence.includes(keyword.toLowerCase())) {
          const cleaned = sentence.replace(/\s+/g, " ").trim();
          if (cleaned.length > 5 && cleaned.length < 200) {
            items.push(cleaned);
          }
        }
      }
    }

    const unique = [...new Set(items)];
    if (unique.length === 0) return "暂无相关数据";

    return unique.slice(0, 5).map((item) => `• ${item}`).join("\n");
  }

  private analyzeResults(results: TavilySearchResult[], address: Address): LocationAnalysis {
    if (results.length === 0) {
      return {
        schools: "暂无相关数据",
        hospitals: "暂无相关数据",
        shopping: "暂无相关数据",
        famousPeople: "暂无相关数据",
        specialties: "暂无相关数据",
        customs: "暂无相关数据",
        sources: [],
      };
    }

    const sources = results.map((r) => r.title).filter((t, i, arr) => arr.indexOf(t) === i).slice(0, 5);

    const schools = this.extractItems(results, [
      "school", "university", "college", "institute", "academy",
      "中学", "小学", "大学", "学院", "学校", "教育",
    ]);

    const hospitals = this.extractItems(results, [
      "hospital", "clinic", "medical", "healthcare", "doctor",
      "医院", "诊所", "医疗", "卫生", "保健",
    ]);

    const shopping = this.extractItems(results, [
      "mall", "shopping", "store", "market", "plaza", "center",
      "商场", "购物", "超市", "市场", "商店", "中心",
    ]);

    const famousPeople = this.extractItems(results, [
      "famous", "celebrity", "born", "native", "artist", "writer", "politician",
      "名人", "明星", "出生于", "著名", "艺术家", "政治家",
    ]);

    const specialties = this.extractItems(results, [
      "specialty", "specialty", "food", "product", "local", "famous", "cuisine",
      "特产", "美食", "产品", "当地", "著名", "菜肴",
    ]);

    const customs = this.extractItems(results, [
      "custom", "tradition", "festival", "culture", "customs",
      "风俗", "传统", "节日", "文化", "习俗",
    ]);

    return {
      schools,
      hospitals,
      shopping,
      famousPeople,
      specialties,
      customs,
      sources,
    };
  }
}

export const tavilyService = new TavilyService();
