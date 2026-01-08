// Dashboard generation service

import { LLMService } from '../llm/llmService';
import { getPromptTemplate } from '../llm/promptTemplates';
import type { DashboardGenerationRequest, GeneratedDashboard, DashboardPanel } from '../../types/features';
import type { LLMPrompt } from '../../types/llm';

export class DashboardService {
  private llm: LLMService;

  constructor(llm: LLMService) {
    this.llm = llm;
  }

  /**
   * Generates a dashboard from a natural language description
   */
  async generateDashboard(request: DashboardGenerationRequest): Promise<GeneratedDashboard> {
    const template = getPromptTemplate('dashboardGeneration');
    if (!template) {
      throw new Error('Dashboard generation template not found');
    }

    const prompt: LLMPrompt = {
      system: template.systemPrompt,
      user: `Create a dashboard based on this description:
${request.description}

Datasources: ${request.datasourceIds.join(', ')}
Number of panels: ${request.panelCount || 6}

Provide:
1. Dashboard title
2. Panel definitions (title, type, query, description)
3. Suggested layout
4. Variables if applicable`,
    };

    try {
      const response = await this.llm.chat(prompt);
      return this.parseDashboardResponse(response.content, request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Suggests improvements for an existing dashboard
   */
  async suggestImprovements(dashboardJson: string): Promise<string[]> {
    const prompt: LLMPrompt = {
      system: 'You are an expert in Grafana dashboard design and observability best practices.',
      user: `Review this dashboard and suggest improvements:
\`\`\`json
${dashboardJson.slice(0, 5000)}
\`\`\`

Provide 3-5 specific suggestions for improvement, one per line.`,
    };

    try {
      const response = await this.llm.chat(prompt);
      return response.content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 5);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates a panel based on a description
   */
  async generatePanel(
    description: string,
    datasourceId: string,
    panelType: DashboardPanel['type'] = 'graph'
  ): Promise<DashboardPanel> {
    const prompt: LLMPrompt = {
      system: 'You are an expert in creating Grafana panels. Provide PromQL/LogQL queries and configurations.',
      user: `Create a ${panelType} panel for: ${description}

Datasource: ${datasourceId}

Provide:
1. Panel title
2. Query (PromQL or LogQL)
3. Description of what the panel shows`,
    };

    try {
      const response = await this.llm.chat(prompt);
      return this.parsePanelResponse(response.content, datasourceId, panelType);
    } catch (error) {
      throw error;
    }
  }

  private parseDashboardResponse(content: string, request: DashboardGenerationRequest): GeneratedDashboard {
    // Extract title
    const titleMatch = content.match(/(?:Title|Dashboard|Name):\s*(.+?)(?:\n|$)/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Generated Dashboard';

    // Extract description
    const description = request.description;

    // Extract panels
    const panels: DashboardPanel[] = [];
    const panelRegex = /(?:Panel|Visualization)\s*\d?\s*:?\s*\n([\s\S]*?)(?=(?:Panel|Visualization)\s*\d?\s*:?|\n\n|$)/gi;
    const panelMatches = content.matchAll(panelRegex);

    let panelIndex = 0;
    for (const match of panelMatches) {
      if (panels.length >= (request.panelCount || 6)) break;

      const panelText = match[1];
      const panel = this.parsePanelBlock(panelText, request.datasourceIds[0], panelIndex++);
      if (panel) {
        panels.push(panel);
      }
    }

    // If no panels were extracted, generate default panels
    if (panels.length === 0) {
      for (let i = 0; i < (request.panelCount || 6); i++) {
        panels.push({
          title: `Panel ${i + 1}`,
          type: 'graph',
          query: 'up',
          datasourceId: request.datasourceIds[0],
          description: 'Generated panel',
        });
      }
    }

    return {
      title,
      description,
      tags: ['generated', 'ai'],
      panels,
    };
  }

  private parsePanelBlock(text: string, datasourceId: string, index: number): DashboardPanel | null {
    // Extract title
    const titleMatch = text.match(/(?:Title|Name):\s*(.+?)(?:\n|$)/i);
    const title = titleMatch ? titleMatch[1].trim() : `Panel ${index + 1}`;

    // Extract type
    const typeMatch = text.match(/(?:Type|Visualization):\s*(.+?)(?:\n|$)/i);
    const type = this.parsePanelType(typeMatch ? typeMatch[1].trim() : 'graph');

    // Extract query
    const queryMatch = text.match(/(?:Query|PromQL|LogQL):\s*```(?:promql|logql)?\n([\s\S]*?)```/i);
    const query = queryMatch ? queryMatch[1].trim() : 'up';

    // Extract description
    const descMatch = text.match(/(?:Description|Shows):\s*(.+?)(?:\n|$)/i);
    const description = descMatch ? descMatch[1].trim() : '';

    return {
      title,
      type,
      query,
      datasourceId,
      description,
    };
  }

  private parsePanelResponse(content: string, datasourceId: string, defaultType: DashboardPanel['type']): DashboardPanel {
    // Extract title
    const titleMatch = content.match(/(?:Title|Name):\s*(.+?)(?:\n|$)/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Generated Panel';

    // Extract query
    const queryMatch = content.match(/(?:Query|PromQL|LogQL):\s*```(?:promql|logql)?\n([\s\S]*?)```/i);
    const query = queryMatch ? queryMatch[1].trim() : 'up';

    // Extract description
    const descMatch = content.match(/(?:Description|Shows):\s*(.+?)(?:\n|$)/i);
    const description = descMatch ? descMatch[1].trim() : content.slice(0, 200);

    return {
      title,
      type: defaultType,
      query,
      datasourceId,
      description,
    };
  }

  private parsePanelType(type: string): DashboardPanel['type'] {
    const normalizedType = type.toLowerCase();
    const typeMap: Record<string, DashboardPanel['type']> = {
      graph: 'graph',
      timeseries: 'graph',
      table: 'table',
      stat: 'stat',
      singlestat: 'stat',
      heatmap: 'heatmap',
      logs: 'logs',
      log: 'logs',
    };

    return typeMap[normalizedType] || 'graph';
  }
}
