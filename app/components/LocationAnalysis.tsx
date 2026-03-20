"use client";

import { useState } from "react";
import { Button, Spinner, Box, Text, Flex, Callout, Collapsible } from "@radix-ui/themes";
import { useLocationAnalysis } from "@/hooks/useLocationAnalysis";
import type { Address } from "../types";

interface LocationAnalysisProps {
  address: Address | null;
}

interface AnalysisSectionProps {
  title: string;
  icon: string;
  content: string;
  defaultOpen?: boolean;
}

function AnalysisSection({ title, icon, content, defaultOpen = false }: AnalysisSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!content || content === "暂无相关数据") return null;

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
      <Collapsible.Trigger asChild>
        <Flex
          align="center"
          gap="2"
          style={{
            cursor: "pointer",
            padding: "8px 0",
            borderBottom: "1px solid var(--gray-5)",
          }}
        >
          <Text size="2" weight="bold">
            {icon} {title}
          </Text>
          <Text size="1" color="gray" style={{ marginLeft: "auto" }}>
            {isOpen ? "收起 ▲" : "展开 ▼"}
          </Text>
        </Flex>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Text size="2" style={{ padding: "8px 0", display: "block", lineHeight: "1.6" }}>
          {content}
        </Text>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export function LocationAnalysis({ address }: LocationAnalysisProps) {
  const { analysis, isAnalyzing, error, analyzeLocation } = useLocationAnalysis();
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
              <Text ml="2">深度分析中...</Text>
            </>
          ) : (
            "🔍 AI 深度分析此地详情"
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
          <Text size="2" weight="bold" mb="3" style={{ display: "block" }}>
            📊 {address.city || ""} 深度分析报告
          </Text>

          <Box style={{ borderTop: "1px solid var(--gray-4)", paddingTop: "8px" }}>
            <AnalysisSection
              title="区域概况"
              icon="🗺️"
              content={analysis.overview}
              defaultOpen={true}
            />
            <AnalysisSection title="安全信息" icon="🛡️" content={analysis.safety} />
            <AnalysisSection title="经济概况" icon="💰" content={analysis.economy} />
            <AnalysisSection title="基础设施" icon="🏗️" content={analysis.infrastructure} />
            <AnalysisSection title="附近社区" icon="🏘️" content={analysis.communities} />
            <AnalysisSection title="教育资源" icon="🎓" content={analysis.schools} />
            <AnalysisSection title="历史事件" icon="📜" content={analysis.history} />
            <AnalysisSection title="名人典故" icon="👤" content={analysis.famousPeople} />
            <AnalysisSection title="特产美食" icon="🎁" content={analysis.specialties} />
            <AnalysisSection title="风俗文化" icon="🎭" content={analysis.customs} />
          </Box>

          {analysis.sources.length > 0 && (
            <Box
              mt="3"
              p="2"
              style={{
                backgroundColor: "var(--gray-3)",
                borderRadius: "var(--radius-2)",
              }}
            >
              <Text size="1" weight="bold" color="gray">
                参考来源
              </Text>
              <Flex direction="column" gap="1" mt="1">
                {analysis.sources.map((source, i) => (
                  <Text key={i} size="1" color="gray">
                    • {source}
                  </Text>
                ))}
              </Flex>
            </Box>
          )}

          <Flex justify="center" mt="3">
            <Button onClick={() => setIsExpanded(false)} variant="ghost" size="1">
              收起报告
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
}
