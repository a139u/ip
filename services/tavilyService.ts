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

function buildLocationQuery(address: Address): string {
  const parts = [address.city, address.state, address.country].filter(Boolean);
  return parts.join(", ");
}

interface SearchTopic {
  name: string;
  query: (location: string) => string;
}

const SEARCH_TOPICS: SearchTopic[] = [
  { name: "communities", query: (loc) => `${loc} nearby neighborhoods communities districts` },
  { name: "schools", query: (loc) => `${loc} schools education universities` },
  { name: "history", query: (loc) => `${loc} history historical events` },
  { name: "famousPeople", query: (loc) => `${loc} famous people celebrities notable figures` },
  { name: "specialties", query: (loc) => `${loc} local specialties food products handicrafts` },
  { name: "customs", query: (loc) => `${loc} customs traditions culture festivals` },
];

export interface LocationAnalysis {
  overview: string;
  safety: string;
  economy: string;
  infrastructure: string;
  communities: string;
  schools: string;
  history: string;
  famousPeople: string;
  specialties: string;
  customs: string;
  sources: string[];
}

interface TopicResults {
  communities: TavilySearchResult[];
  schools: TavilySearchResult[];
  history: TavilySearchResult[];
  famousPeople: TavilySearchResult[];
  specialties: TavilySearchResult[];
  customs: TavilySearchResult[];
}

class TavilyService {
  async searchAddress(address: Address): Promise<LocationAnalysis> {
    const location = buildLocationQuery(address);

    const topicResults = await this.searchAllTopics(location);

    const generalResults = await this.tavilySearch(location, 5);

    const analysis = this.analyzeAllResults(generalResults, topicResults, address);
    return analysis;
  }

  private async searchAllTopics(location: string): Promise<TopicResults> {
    const results: TopicResults = {
      communities: [],
      schools: [],
      history: [],
      famousPeople: [],
      specialties: [],
      customs: [],
    };

    const searchPromises = SEARCH_TOPICS.map(async (topic) => {
      try {
        const searchResults = await this.tavilySearch(topic.query(location), 3);
        results[topic.name as keyof TopicResults] = searchResults;
      } catch (error) {
        console.error(`Error searching ${topic.name}:`, error);
      }
    });

    await Promise.all(searchPromises);
    return results;
  }

  private async tavilySearch(query: string, maxResults = 5): Promise<TavilySearchResult[]> {
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

  private extractSummary(results: TavilySearchResult[], maxLength = 200): string {
    if (results.length === 0) return "暂无相关数据";

    const combined = results.map((r) => r.content).join(" ");
    const cleaned = combined.replace(/\s+/g, " ").trim();

    if (cleaned.length <= maxLength) return cleaned;

    const truncated = cleaned.substring(0, maxLength);
    const lastPunctuation = Math.max(
      truncated.lastIndexOf("。"),
      truncated.lastIndexOf(","),
      truncated.lastIndexOf("，"),
      truncated.lastIndexOf(". ")
    );

    if (lastPunctuation > maxLength * 0.6) {
      return truncated.substring(0, lastPunctuation + 1);
    }
    return truncated + "...";
  }

  private extractListItems(results: TavilySearchResult[], keywords: string[], maxItems = 3): string[] {
    const items: string[] = [];
    const combined = results.map((r) => r.content).join(" ");

    for (const keyword of keywords) {
      const regex = new RegExp(`[^。.]*${keyword}[^。.]+[。.]`, "gi");
      const matches = combined.match(regex);
      if (matches) {
        for (const match of matches.slice(0, 2)) {
          const cleaned = match.replace(/\s+/g, " ").trim();
          if (cleaned.length > 5 && cleaned.length < 100) {
            items.push(cleaned);
          }
        }
      }
    }

    return items.slice(0, maxItems);
  }

  private analyzeAllResults(
    generalResults: TavilySearchResult[],
    topicResults: TopicResults,
    address: Address
  ): LocationAnalysis {
    const locationStr = `${address.city || ""}, ${address.state || ""}, ${address.country || ""}`;

    const generalContent = generalResults.map((r) => r.content).join(" ").toLowerCase();

    let overview = `位于 ${locationStr}`;
    if (generalContent.includes("suburb") || generalContent.includes("residential")) {
      overview += "，这是一个住宅区";
    } else if (generalContent.includes("urban") || generalContent.includes("city center")) {
      overview += "，位于城市中心区域";
    } else if (generalContent.includes("rural") || generalContent.includes("countryside")) {
      overview += "，位于乡村或郊区";
    } else if (generalContent.includes("coastal") || generalContent.includes("beach")) {
      overview += "，这是一个沿海地区";
    } else if (generalContent.includes("mountain") || generalContent.includes("hills")) {
      overview += "，这是一个山区或丘陵地带";
    }
    overview += "。";

    let safety = "安全信息：";
    if (generalContent.includes("safe") && generalContent.includes("low crime")) {
      safety += "治安良好，犯罪率低，适合居住。";
    } else if (generalContent.includes("danger") || generalContent.includes("high crime")) {
      safety += "治安需注意，犯罪率相对较高。";
    } else if (generalContent.includes("police") || generalContent.includes("security")) {
      safety += "有完善的安全保障体系。";
    } else {
      safety += "治安状况一般，建议了解当地情况。";
    }

    let economy = "经济概况：";
    if (generalContent.includes("affluent") || generalContent.includes("wealthy") || generalContent.includes("high income")) {
      economy += "高收入/富裕地区，经济发达。";
    } else if (generalContent.includes("poor") || generalContent.includes("low income") || generalContent.includes("economically disadvantaged")) {
      economy += "经济欠发达地区。";
    } else if (generalContent.includes("industrial") || generalContent.includes("manufacturing")) {
      economy += "工业/制造业发达地区。";
    } else if (generalContent.includes("tourism") || generalContent.includes("tourist")) {
      economy += "旅游业为经济支柱。";
    } else {
      economy += "中等经济发展水平。";
    }

    let infrastructure = "基础设施：";
    const hasSchool = generalContent.includes("school") || generalContent.includes("university");
    const hasHospital = generalContent.includes("hospital") || generalContent.includes("medical");
    const hasShopping = generalContent.includes("shopping") || generalContent.includes("mall");

    if (hasSchool && hasHospital && hasShopping) {
      infrastructure += "设施齐全，学校、医院、商场等配套完善。";
    } else if (hasSchool && hasHospital) {
      infrastructure += "教育和医疗设施较好。";
    } else if (hasSchool) {
      infrastructure += "教育资源丰富。";
    } else if (hasHospital) {
      infrastructure += "医疗设施较好。";
    } else if (generalContent.includes("rural") || generalContent.includes("remote")) {
      infrastructure += "位于偏远地区，设施相对有限。";
    } else {
      infrastructure += "基础设施配套一般。";
    }

    const communities = this.extractSummary(topicResults.communities);
    const schools = this.extractSummary(topicResults.schools);
    const history = this.extractSummary(topicResults.history);
    const famousPeople = this.extractSummary(topicResults.famousPeople);
    const specialties = this.extractSummary(topicResults.specialties);
    const customs = this.extractSummary(topicResults.customs);

    const allSources = [
      ...generalResults,
      ...topicResults.communities,
      ...topicResults.schools,
      ...topicResults.history,
      ...topicResults.famousPeople,
      ...topicResults.specialties,
      ...topicResults.customs,
    ];
    const uniqueSources = allSources
      .map((r) => r.title)
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .slice(0, 5);

    return {
      overview,
      safety,
      economy,
      infrastructure,
      communities,
      schools,
      history,
      famousPeople,
      specialties,
      customs,
      sources: uniqueSources,
    };
  }
}

export const tavilyService = new TavilyService();
