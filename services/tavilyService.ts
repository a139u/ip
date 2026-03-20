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

function buildSearchQuery(address: Address): string {
  const parts = [
    address.city,
    address.state,
    address.country,
  ].filter(Boolean);
  return parts.join(", ");
}

export interface LocationAnalysis {
  overview: string;
  safety: string;
  economy: string;
  infrastructure: string;
  sources: string[];
}

class TavilyService {
  async searchAddress(address: Address): Promise<LocationAnalysis> {
    const query = buildSearchQuery(address);

    const searchResults = await this.tavilySearch(query);

    const analysis = this.analyzeResults(searchResults, address);
    return analysis;
  }

  private async tavilySearch(query: string): Promise<TavilySearchResult[]> {
    const apiKey = getNextApiKey();

    try {
      const response = await axios.post<TavilyResponse>(
        "https://api.tavily.com/search",
        {
          query,
          search_depth: "basic",
          max_results: 5,
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

  private analyzeResults(
    results: TavilySearchResult[],
    address: Address
  ): LocationAnalysis {
    if (results.length === 0) {
      return {
        overview: `这是位于 ${address.city || ""}, ${address.state || ""}, ${address.country || ""} 的地址。暂无详细数据。`,
        safety: "暂无安全数据",
        economy: "暂无经济数据",
        infrastructure: "暂无基础设施数据",
        sources: [],
      };
    }

    const combinedContent = results
      .map((r) => r.content)
      .join("\n")
      .toLowerCase();

    const sources = results.map((r) => r.title).slice(0, 3);

    const locationStr = `${address.city || ""}, ${address.state || ""}, ${address.country || ""}`;

    let overview = `位于 ${locationStr} 的区域。`;
    if (combinedContent.includes("suburb") || combinedContent.includes("residential")) {
      overview += "这是一个住宅区。";
    } else if (combinedContent.includes("urban") || combinedContent.includes("city")) {
      overview += "这是一个城市中心区域。";
    } else if (combinedContent.includes("rural") || combinedContent.includes("countryside")) {
      overview += "这是一个乡村或郊区。";
    }

    let safety = "安全信息：";
    if (combinedContent.includes("safe") || combinedContent.includes("low crime")) {
      safety += "该区域治安状况良好，犯罪率较低。";
    } else if (combinedContent.includes("danger") || combinedContent.includes("high crime")) {
      safety += "需要注意安全，该区域犯罪率较高。";
    } else {
      safety += "治安情况一般，建议了解当地情况。";
    }

    let economy = "经济概况：";
    if (
      combinedContent.includes("affluent") ||
      combinedContent.includes("high income") ||
      combinedContent.includes("wealthy")
    ) {
      economy += "这是一个高收入/富裕地区。";
    } else if (
      combinedContent.includes("poor") ||
      combinedContent.includes("low income") ||
      combinedContent.includes("economically disadvantaged")
    ) {
      economy += "这是一个经济欠发达地区。";
    } else {
      economy += "这是一个中等经济发展水平的区域。";
    }

    let infrastructure = "基础设施：";
    if (
      combinedContent.includes("school") ||
      combinedContent.includes("hospital") ||
      combinedContent.includes("shopping")
    ) {
      infrastructure += "周边设施齐全，包括学校、医院、购物等。";
    } else if (combinedContent.includes("rural") || combinedContent.includes("remote")) {
      infrastructure += "位于偏远地区，设施可能有限。";
    } else {
      infrastructure += "基础设施情况一般。";
    }

    return {
      overview,
      safety,
      economy,
      infrastructure,
      sources,
    };
  }
}

export const tavilyService = new TavilyService();
