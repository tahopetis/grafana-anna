# Anna - AI Assistant for Grafana

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Grafana](https://img.shields.io/badge/Grafana-11.0.0+-orange.svg)](https://grafana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

> Your intelligent Grafana companion for querying, anomaly detection, alert intelligence, and dashboard generation

## 🌟 Overview

**Anna** is an AI-powered assistant plugin for Grafana that democratizes observability by making monitoring, alerting, and dashboarding accessible through natural language interaction.

### Key Features

- 🗣️ **Natural Language Querying** - Convert natural language to PromQL, LogQL with explanations
- 🔍 **Anomaly Detection** - Automatically detect and explain anomalies in metrics and logs
- 🚨 **Alert Intelligence** - Smart alert analysis, correlation, and remediation suggestions
- 📊 **Dashboard Generation** - AI-powered dashboard creation from descriptions
- 🔐 **Self-Hosted First** - Designed for on-premise deployments with secure credential management
- 🤖 **Flexible LLM Support** - Uses grafana-llm-app with custom provider configuration option

## 🎯 Vision

Make every Grafana user an observability expert by providing an AI assistant that understands your infrastructure, speaks your query languages, and helps you monitor, diagnose, and optimize systems through natural conversation.

## 📋 Prerequisites

- **Node.js** 18 or higher
- **Grafana** 11.0.0 or higher
- **grafana-llm-app** plugin (>= 0.22.0)
- **Docker** and **Docker Compose** (for local development)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/grafana-anna.git
cd grafana-anna
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Environment

```bash
# Start Grafana with Docker Compose
docker-compose up -d

# Build the plugin in watch mode
npm run watch
```

### 4. Access Grafana

1. Open your browser and navigate to: http://localhost:3000
2. Login with:
   - **Username**: `admin`
   - **Password**: `admin`
3. Navigate to **Plugins** → **Anna - AI Assistant**
4. Configure your LLM provider in the grafana-llm-app settings
5. Start chatting with Anna!

## 🏗️ Project Structure

```
grafana-anna/
├── src/
│   ├── components/          # React components
│   │   ├── chat/            # Chat interface
│   │   ├── query/           # Query visualization
│   │   ├── alerts/          # Alert UI
│   │   ├── anomaly/         # Anomaly detection UI
│   │   ├── dashboard/       # Dashboard generation
│   │   └── common/          # Shared components
│   ├── pages/               # Plugin pages
│   │   ├── ChatPage.tsx
│   │   ├── ConfigPage.tsx
│   │   ├── AlertsPage.tsx
│   │   ├── AnomaliesPage.tsx
│   │   └── DashboardsPage.tsx
│   ├── services/            # Business logic
│   │   ├── llm/             # LLM integration
│   │   ├── mcp/             # MCP client
│   │   ├── conversation/    # Conversation management
│   │   └── features/        # Feature modules
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilities
│   ├── hooks/               # React hooks
│   ├── styles/              # CSS/styles
│   ├── module.ts            # Plugin entry point
│   └── plugin.json          # Plugin manifest
├── provisioning/            # Dev configuration
├── tests/                   # Unit and E2E tests
├── docs/                    # Documentation
└── docker-compose.yaml      # Dev environment
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run watch        # Build in watch mode

# Building
npm run build        # Build for production

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run typecheck    # Run TypeScript type check
```

### Architecture

Anna is built as a **Grafana App Plugin** with the following architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                         GRAFANA INSTANCE                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ANNA PLUGIN (App Plugin)                    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Chat UI │ Config UI │ Dashboard UI │ Alert UI           │  │
│  │  LLM Integration Layer (@grafana/llm)                    │  │
│  │  MCP Client Layer (Model Context Protocol)               │  │
│  │  Feature Modules (Query, Anomaly, Alert, Dashboard)      │  │
│  │  Conversation Manager (Context, History, State)          │  │
│  └──────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│              DEPENDENCY: grafana-llm-app                        │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
              LLM Providers (OpenAI, Anthropic, etc.)
```

### Key Dependencies

- **@grafana/llm** - LLM SDK for Grafana
- **@grafana/experimental** - Experimental features
- **@grafana/ui** - Grafana UI components
- **grafana-llm-app** - LLM provider management

## 🔐 Security

- **No credential storage** - Anna delegates all credential management to grafana-llm-app
- **RBAC integration** - Respects Grafana user roles and permissions
- **Input validation** - Validates all user input before processing
- **No data retention** - Conversation history stored locally in browser

## 📚 Documentation

- [Architecture Overview](docs/architecture.md) - Detailed system architecture
- [API Documentation](docs/api.md) - API reference
- [User Guide](docs/user-guide.md) - User documentation
- [Developer Guide](docs/developer-guide.md) - Developer documentation

## 🗺️ Roadmap

### MVP (Current)
- ✅ Natural Language Querying
- ✅ Anomaly Detection
- ✅ Alert Intelligence
- ✅ Dashboard Generation

### Phase 2 (Future)
- Advanced query capabilities (multi-datasource, optimization)
- Enhanced anomaly detection (ML-based, predictive)
- Intelligent alerting (grouping, deduplication)
- Dashboard intelligence (recommendations, optimization)
- Collaboration features (sharing, knowledge base)

### Phase 3+ (Future)
- Multi-model support (fine-tuned, local models)
- Advanced analytics (usage insights, capacity planning)
- Integration ecosystem (PagerDuty, Jira, Slack)
- Customization (prompts, knowledge bases, extensions)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

Apache License 2.0 - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with [Grafana Plugin Tools](https://grafana.com/developers/plugin-tools/)
- LLM integration powered by [@grafana/llm](https://www.npmjs.com/package/@grafana/llm)
- Inspired by [grafana-llmexamples-app](https://github.com/grafana/grafana-llmexamples-app)

## 📧 Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/grafana-anna/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/grafana-anna/discussions)

## 🌟 Star us on GitHub!

If you find Anna useful, please consider giving us a star on GitHub!

---

Made with ❤️ by the Grafana community
