/**
 * Unit tests for Query Service
 */

import { QueryService } from './queryService';
import { LLMService } from '../llm/llmService';
import type { QueryRequest } from '../../types/features';

// Mock LLM Service
jest.mock('../llm/llmService');

describe('QueryService', () => {
  let queryService: QueryService;
  let mockLLMService: jest.Mocked<LLMService>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a mock LLM service
    mockLLMService = {
      chat: jest.fn(),
    } as unknown as jest.Mocked<LLMService>;

    queryService = new QueryService(mockLLMService);
  });

  describe('constructor', () => {
    it('should create an instance with LLM service', () => {
      expect(queryService).toBeInstanceOf(QueryService);
    });
  });

  describe('generateQuery', () => {
    it('should generate a PromQL query from natural language', async () => {
      const request: QueryRequest = {
        naturalLanguage: 'Show me the CPU usage',
        queryType: 'promql',
        datasourceId: 'prometheus',
      };

      const mockResponse = {
        content: '```promql\nrate(cpu_usage_seconds_total[5m])\n```\n\nThis query shows the CPU usage rate over 5 minutes.',
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        model: 'gpt-4',
      };

      mockLLMService.chat.mockResolvedValueOnce(mockResponse);

      const result = await queryService.generateQuery(request);

      expect(result).toHaveProperty('query');
      expect(result.query).toContain('cpu_usage');
      expect(result).toHaveProperty('explanation');
      expect(result).toHaveProperty('confidence');
      expect(result.confidence).toBe(0.9);
    });

    it('should generate a LogQL query from natural language', async () => {
      const request: QueryRequest = {
        naturalLanguage: 'Find all errors in the logs',
        queryType: 'logql',
        datasourceId: 'loki',
      };

      const mockResponse = {
        content: '```logql\n{job="varlog"} |= "error"\n```\n\nThis query searches for log lines containing "error".',
        usage: {
          promptTokens: 80,
          completionTokens: 40,
          totalTokens: 120,
        },
        model: 'gpt-4',
      };

      mockLLMService.chat.mockResolvedValueOnce(mockResponse);

      const result = await queryService.generateQuery(request);

      expect(result.query).toContain('error');
      expect(result.explanation).toBeDefined();
    });

    it('should handle queries without code blocks', async () => {
      const request: QueryRequest = {
        naturalLanguage: 'Simple query',
        queryType: 'promql',
        datasourceId: 'prometheus',
      };

      const mockResponse = {
        content: 'up{job="prometheus"}\n\nThis is a simple query',
        usage: {
          promptTokens: 50,
          completionTokens: 30,
          totalTokens: 80,
        },
        model: 'gpt-4',
      };

      mockLLMService.chat.mockResolvedValueOnce(mockResponse);

      const result = await queryService.generateQuery(request);

      expect(result.query).toBe('up{job="prometheus"}');
      expect(result.confidence).toBe(0.6);
    });

    it('should include time range in the prompt', async () => {
      const request: QueryRequest = {
        naturalLanguage: 'Memory usage',
        queryType: 'promql',
        datasourceId: 'prometheus',
        timeRange: {
          from: 'now-1h',
          to: 'now',
        },
      };

      const mockResponse = {
        content: '```promql\nnode_memory_MemAvailable_bytes\n```',
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        model: 'gpt-4',
      };

      mockLLMService.chat.mockResolvedValueOnce(mockResponse);

      await queryService.generateQuery(request);

      expect(mockLLMService.chat).toHaveBeenCalled();
      const callArgs = mockLLMService.chat.mock.calls[0][0];
      expect(callArgs.user).toContain('now-1h');
      expect(callArgs.user).toContain('now');
    });

    it('should throw error when template is not found', async () => {
      // This test would require mocking getPromptTemplate to return null
      // For now, we'll test the error handling path
      const request: QueryRequest = {
        naturalLanguage: 'Test',
        queryType: 'promql',
        datasourceId: 'test',
      };

      // If chat fails, the error should be propagated
      mockLLMService.chat.mockRejectedValueOnce(new Error('Template not found'));

      await expect(queryService.generateQuery(request)).rejects.toThrow();
    });

    it('should extract suggestions from response', async () => {
      const request: QueryRequest = {
        naturalLanguage: 'HTTP request rate',
        queryType: 'promql',
        datasourceId: 'prometheus',
      };

      const mockResponse = {
        content: `[\`promql\`](promql)
rate(http_requests_total[5m])
\`\`\`

Suggestions:
- Consider adding filters by status code
- You might want to group by instance`,
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        model: 'gpt-4',
      };

      mockLLMService.chat.mockResolvedValueOnce(mockResponse);

      const result = await queryService.generateQuery(request);

      expect(result).toHaveProperty('suggestions');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe('explainQuery', () => {
    it('should explain a PromQL query', async () => {
      const query = 'rate(http_requests_total[5m])';
      const queryType = 'promql';

      const mockResponse = {
        content:
          'This query calculates the per-second rate of HTTP requests over a 5-minute window. It is useful for identifying trends in request volume.',
        usage: {
          promptTokens: 80,
          completionTokens: 40,
          totalTokens: 120,
        },
        model: 'gpt-4',
      };

      mockLLMService.chat.mockResolvedValueOnce(mockResponse);

      const explanation = await queryService.explainQuery(query, queryType);

      expect(typeof explanation).toBe('string');
      expect(explanation.length).toBeGreaterThan(0);
      expect(explanation).toContain('rate');
    });

    it('should explain a LogQL query', async () => {
      const query = '{job="varlog"} |= "error"';
      const queryType = 'logql';

      const mockResponse = {
        content:
          'This query searches for log entries from the "varlog" job that contain the word "error".',
        usage: {
          promptTokens: 80,
          completionTokens: 40,
          totalTokens: 120,
        },
        model: 'gpt-4',
      };

      mockLLMService.chat.mockResolvedValueOnce(mockResponse);

      const explanation = await queryService.explainQuery(query, queryType);

      expect(explanation).toContain('error');
    });

    it('should handle errors during explanation', async () => {
      mockLLMService.chat.mockRejectedValueOnce(new Error('LLM error'));

      await expect(queryService.explainQuery('test', 'promql')).rejects.toThrow();
    });
  });

  describe('optimizeQuery', () => {
    it('should optimize a PromQL query', async () => {
      const query = 'rate(http_requests_total[5m])';
      const queryType = 'promql';

      const mockResponse = {
        content: `[\`promql\`](promql)
sum by (job) (rate(http_requests_total[5m]))
\`\`\`

- Added aggregation by job to reduce series count
- Using sum to consolidate multiple series`,
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        model: 'gpt-4',
      };

      mockLLMService.chat.mockResolvedValueOnce(mockResponse);

      const result = await queryService.optimizeQuery(query, queryType);

      expect(result).toHaveProperty('optimized');
      expect(result).toHaveProperty('improvements');
      expect(typeof result.optimized).toBe('string');
      expect(Array.isArray(result.improvements)).toBe(true);
      expect(result.improvements.length).toBeGreaterThan(0);
    });

    it('should handle optimization without code block', async () => {
      const query = 'up';
      const queryType = 'promql';

      const mockResponse = {
        content: `up{job="prometheus"}

- Added job filter for specificity`,
        usage: {
          promptTokens: 80,
          completionTokens: 40,
          totalTokens: 120,
        },
        model: 'gpt-4',
      };

      mockLLMService.chat.mockResolvedValueOnce(mockResponse);

      const result = await queryService.optimizeQuery(query, queryType);

      expect(result.optimized).toContain('job=');
      expect(result.improvements).toContain('Added job filter for specificity');
    });

    it('should handle empty improvements list', async () => {
      const query = 'up';
      const queryType = 'promql';

      const mockResponse = {
        content: 'up\n\nNo improvements needed',
        usage: {
          promptTokens: 50,
          completionTokens: 30,
          totalTokens: 80,
        },
        model: 'gpt-4',
      };

      mockLLMService.chat.mockResolvedValueOnce(mockResponse);

      const result = await queryService.optimizeQuery(query, queryType);

      expect(result.optimized).toBe('up');
      expect(result.improvements).toEqual([]);
    });
  });

  describe('suggestQueries', () => {
    it('should suggest related PromQL queries', async () => {
      const query = 'rate(http_requests_total[5m])';
      const queryType = 'promql';

      const mockResponse = {
        content: `rate(http_requests_total[10m])
sum by (status) (rate(http_requests_total[5m]))
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`,
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        model: 'gpt-4',
      };

      mockLLMService.chat.mockResolvedValueOnce(mockResponse);

      const suggestions = await queryService.suggestQueries(query, queryType);

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBe(3);
      expect(suggestions[0]).toContain('rate');
    });

    it('should respect custom count parameter', async () => {
      const query = 'up';
      const queryType = 'promql';

      const mockResponse = {
        content: `up{job="prometheus"}
up{job="node"}
up{job="grafana"}
up{job="alertmanager"}
up{job="pushgateway"}`,
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        model: 'gpt-4',
      };

      mockLLMService.chat.mockResolvedValueOnce(mockResponse);

      const suggestions = await queryService.suggestQueries(query, queryType, 2);

      expect(suggestions.length).toBe(2);
    });

    it('should filter empty lines from suggestions', async () => {
      const query = 'up';
      const queryType = 'promql';

      const mockResponse = {
        content: `up{job="prometheus"}

up{job="node"}`,
        usage: {
          promptTokens: 80,
          completionTokens: 40,
          totalTokens: 120,
        },
        model: 'gpt-4',
      };

      mockLLMService.chat.mockResolvedValueOnce(mockResponse);

      const suggestions = await queryService.suggestQueries(query, queryType);

      expect(suggestions.length).toBe(2);
      expect(suggestions).not.toContain('');
    });

    it('should use default count of 3', async () => {
      const query = 'up';
      const queryType = 'promql';

      const mockResponse = {
        content: `one
two
three
four
five`,
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        model: 'gpt-4',
      };

      mockLLMService.chat.mockResolvedValueOnce(mockResponse);

      const suggestions = await queryService.suggestQueries(query, queryType);

      expect(suggestions.length).toBe(3);
    });
  });
});
