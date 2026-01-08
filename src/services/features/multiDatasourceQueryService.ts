/**
 * Multi-Datasource Query Service
 * Supports querying across multiple datasources simultaneously
 */

import { LLMService } from '../llm/llmService';
import type { LLMPrompt } from '../../types/llm';

export interface MultiDatasourceQueryRequest {
  naturalLanguage: string;
  datasources: Array<{
    id: string;
    type: string;
    name: string;
  }>;
  timeRange?: {
    from: string;
    to: string;
  };
}

export interface MultiDatasourceQueryResponse {
  queries: Array<{
    datasourceId: string;
    query: string;
    explanation: string;
  }>;
  combinedView: string;
  insights: string[];
}

export class MultiDatasourceQueryService {
  constructor(private llm: LLMService) {}

  async generateMultiDatasourceQuery(
    request: MultiDatasourceQueryRequest
  ): Promise<MultiDatasourceQueryResponse> {
    const datasourceList = request.datasources
      .map((ds) => `- ${ds.name} (${ds.type}): ${ds.id}`)
      .join('\n');

    const prompt: LLMPrompt = {
      system: `You are an expert in querying multiple datasources in Grafana.
Generate queries for each datasource that can answer the user's question.`,
      user: `Generate queries for the following datasources:
${datasourceList}

Question: ${request.naturalLanguage}

Time range: ${request.timeRange?.from || 'last 1 hour'} to ${request.timeRange?.to || 'now'}

For each datasource, provide:
1. The query in the appropriate query language
2. A brief explanation of what the query does

Format your response as a JSON object with a "queries" array.`,
    };

    try {
      const response = await this.llm.chat(prompt);
      return this.parseMultiDatasourceResponse(response.content, request.datasources);
    } catch (error) {
      throw error;
    }
  }

  private parseMultiDatasourceResponse(
    content: string,
    datasources: MultiDatasourceQueryRequest['datasources']
  ): MultiDatasourceQueryResponse {
    // Simple parsing - in production would use more sophisticated JSON extraction
    const queries = datasources.map((ds) => ({
      datasourceId: ds.id,
      query: this.extractQueryForDatasource(content, ds.name),
      explanation: this.extractExplanationForDatasource(content, ds.name),
    }));

    return {
      queries,
      combinedView: this.generateCombinedView(queries),
      insights: this.extractInsights(content),
    };
  }

  private extractQueryForDatasource(content: string, datasourceName: string): string {
    const regex = new RegExp(`${datasourceName}.*?query[:\s]+([^\n]+)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }

  private extractExplanationForDatasource(content: string, datasourceName: string): string {
    const regex = new RegExp(`${datasourceName}.*?explanation[:\s]+([^\n]+)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }

  private generateCombinedView(queries: Array<{ datasourceId: string; query: string }>): string {
    return queries.map((q) => `${q.datasourceId}: ${q.query}`).join('\n');
  }

  private extractInsights(content: string): string[] {
    const insights: string[] = [];
    const lines = content.split('\n');
    let inInsights = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('insights:')) {
        inInsights = true;
        continue;
      }
      if (inInsights && line.trim().startsWith('-')) {
        insights.push(line.trim().substring(1).trim());
      }
    }

    return insights;
  }
}
