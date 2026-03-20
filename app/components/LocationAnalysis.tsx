"use client";

import { useState } from "react";
import { Button, Spinner, Box, Text, Flex, Callout } from "@radix-ui/themes";
import { useLocationAnalysis } from "@/hooks/useLocationAnalysis";
import type { Address } from "../types";

interface LocationAnalysisProps {
  address: Address | null;
}

export function LocationAnalysis({ address }: LocationAnalysisProps) {
  const { analysis, isAnalyzing, error, analyzeLocation } =
    useLocationAnalysis();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAnalyze = async () => {
    if (!address) return;
    await analyzeLocation(address);
    setIsExpanded(true);
  };

  if (!address) return null;

  return (
    <Box>
      <Flex justify="center" mb="3">
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !address}
          variant="soft"
          size="2"
        >
          {isAnalyzing ? (
            <>
              <Spinner size="2" />
              <Text ml="2">分析中...</Text>
            </>
          ) : (
            "AI 分析此地详情"
          )}
        </Button>
      </Flex>

      {error && (
        <Callout.Root color="red" mb="3">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {analysis && isExpanded && (
        <Box
          style={{
            padding: "16px",
            backgroundColor: "var(--gray-2)",
            borderRadius: "var(--radius-3)",
            marginTop: "12px",
          }}
        >
          <Text size="2" weight="bold" mb="2" style={{ display: "block" }}>
            📍 位置分析报告
          </Text>

          <Flex direction="column" gap="2">
            <Box>
              <Text size="1" weight="bold" color="gray">
                区域概况
              </Text>
              <Text size="2">{analysis.overview}</Text>
            </Box>

            <Box>
              <Text size="1" weight="bold" color="gray">
                安全信息
              </Text>
              <Text size="2">{analysis.safety}</Text>
            </Box>

            <Box>
              <Text size="1" weight="bold" color="gray">
                经济概况
              </Text>
              <Text size="2">{analysis.economy}</Text>
            </Box>

            <Box>
              <Text size="1" weight="bold" color="gray">
                基础设施
              </Text>
              <Text size="2">{analysis.infrastructure}</Text>
            </Box>

            {analysis.sources.length > 0 && (
              <Box>
                <Text size="1" weight="bold" color="gray">
                  参考来源
                </Text>
                <Text size="1" color="gray">
                  {analysis.sources.join(" | ")}
                </Text>
              </Box>
            )}
          </Flex>

          <Flex justify="center" mt="3">
            <Button
              onClick={() => setIsExpanded(false)}
              variant="ghost"
              size="1"
            >
              收起
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
}
