import { useState, useCallback } from "react";
import { tavilyService, type LocationAnalysis } from "@/services/tavilyService";
import type { Address } from "@/app/types";

export function useLocationAnalysis() {
  const [analysis, setAnalysis] = useState<LocationAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeLocation = useCallback(async (address: Address) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await tavilyService.searchAddress(address);
      setAnalysis(result);
    } catch (err) {
      setError("分析失败，请重试");
      console.error("Location analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    analysis,
    isAnalyzing,
    error,
    analyzeLocation,
    clearAnalysis,
  };
}
