// Natural language to query conversion service

import { LLMService } from '../llm/llmService';
import { formatPromptTemplate, getPromptTemplate } from '../llm/promptTemplates';
import type { QueryRequest, QueryResponse } from '../../types/features';
import type { LLMPrompt } from '../../types/llm';

export class QueryService {
  private llm: LLMService;

  constructor(llm: LLMService) {
    this.llm = llm;
  }

  /**
   * Converts natural language to a PromQL or LogQL query
   */
  async generateQuery(request: QueryRequest): Promise<QueryResponse> {
    const template = getPromptTemplate('queryGeneration');
    if (!template) {
      throw new Error('Query generation template not found');
    }

    const userPrompt = formatPromptTemplate(template, {
      queryType: request.queryType,
      request: request.naturalLanguage,
      datasource: request.datasourceId,
      timeRange: request.timeRange
        ? `${request.timeRange.from} to ${request.timeRange.to}`
        : 'last 1 hour',
      context: 'No additional context provided',
    });

    const prompt: LLMPrompt = {
      system: template.systemPrompt,
      user: userPrompt,
    };

    try {
      const response = await this.llm.chat(prompt);

      // Parse the response to extract query and explanation
      return this.parseQueryResponse(response.content, request.queryType);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Explains a query in natural language
   */
  async explainQuery(query: string, queryType: 'promql' | 'logql'): Promise<string> {
    const template = getPromptTemplate('queryExplanation');
    if (!template) {
      throw new Error('Query explanation template not found');
    }

    const userPrompt = formatPromptTemplate(template, {
      queryType,
      query,
    });

    const prompt: LLMPrompt = {
      system: template.systemPrompt,
      user: userPrompt,
    };

    try {
      const response = await this.llm.chat(prompt);
      return response.content;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Optimizes a query for better performance
   */
  async optimizeQuery(query: string, queryType: 'promql' | 'logql'): Promise<{
    optimized: string;
    improvements: string[];
  }> {
    const prompt: LLMPrompt = {
      system: `You are an expert in optimizing ${queryType.toUpperCase()} queries for performance and correctness.
Analyze the provided query and suggest optimizations.`,
      user: `Optimize this ${queryType} query:
\`\`\`
${query}
\`\`\`

Provide:
1. The optimized query
2. A list of improvements made (each on a new line starting with "- ")`,
    };

    try {
      const response = await this.llm.chat(prompt);
      return this.parseOptimizationResponse(response.content);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Suggests similar or related queries
   */
  async suggestQueries(
    query: string,
    queryType: 'promql' | 'logql',
    count: number = 3
  ): Promise<string[]> {
    const prompt: LLMPrompt = {
      system: `You are an expert in ${queryType.toUpperCase()} queries.
Suggest related queries that might be useful for the user.`,
      user: `Suggest ${count} related queries to:
\`\`\`
${query}
\`\`\`

Provide only the queries, one per line, without explanation.`,
    };

    try {
      const response = await this.llm.chat(prompt);
      return response.content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, count);
    } catch (error) {
      throw error;
    }
  }

  private parseQueryResponse(content: string, queryType: string): QueryResponse {
    // Extract code blocks from the response
    const codeBlockRegex = /```(?:promql|logql)?\n([\s\S]*?)```/;
    const match = content.match(codeBlockRegex);

    let query = '';
    let explanation = content;

    if (match) {
      query = match[1].trim();
      explanation = content.replace(codeBlockRegex, '').trim();
    } else {
      // If no code block, try to find the query in other formats
      const lines = content.split('\n');
      const nonEmptyLines = lines.filter(line => line.trim().length > 0);
      if (nonEmptyLines.length > 0) {
        query = nonEmptyLines[0].trim();
        explanation = lines.slice(1).join('\n').trim();
      }
    }

    // Calculate a simple confidence score based on response structure
    const confidence = match ? 0.9 : 0.6;

    return {
      query,
      explanation,
      confidence,
      suggestions: this.extractSuggestions(explanation),
    };
  }

  private parseOptimizationResponse(content: string): {
    optimized: string;
    improvements: string[];
  } {
    // Extract the optimized query (first code block or first line)
    const codeBlockRegex = /```(?:promql|logql)?\n([\s\S]*?)```/;
    const match = content.match(codeBlockRegex);

    let optimized = '';
    let remainingContent = content;

    if (match) {
      optimized = match[1].trim();
      remainingContent = content.replace(codeBlockRegex, '').trim();
    } else {
      const lines = content.split('\n');
      const nonEmptyLines = lines.filter(line => line.trim().length > 0);
      if (nonEmptyLines.length > 0) {
        optimized = nonEmptyLines[0].trim();
        remainingContent = lines.slice(1).join('\n').trim();
      }
    }

    // Extract improvements (lines starting with "- ")
    const improvements = remainingContent
      .split('\n')
      .filter(line => line.trim().startsWith('- '))
      .map(line => line.trim().substring(2));

    return {
      optimized,
      improvements,
    };
  }

  private extractSuggestions(content: string): string[] {
    // Extract bullet points or numbered suggestions
    const suggestionRegex = /(?:^|\n)[\-\*\d+\.\)]+\s+(.+?)(?=\n|$)/g;
    const matches = content.matchAll(suggestionRegex);
    return Array.from(matches).map(m => m[1].trim()).filter(s => s.length > 0);
  }
}
