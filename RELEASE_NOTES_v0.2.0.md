# Release v0.2.0 - Phase 2 Complete

Anna v0.2.0 is a major release that completes Phase 2 of the production enhancement roadmap, bringing advanced ML capabilities, intelligent alerting, dashboard intelligence, and collaboration features to your Grafana instance.

## 🚀 What's New

### Advanced Query Capabilities
- **Multi-datasource query support** - Query across Prometheus, Loki, and other datasources seamlessly
- **Query history and favorites** - Save, tag, and organize your frequently used queries
- **Collaborative query sharing** - Share queries with team members with granular permissions
- **Query optimization suggestions** - AI-powered recommendations to improve query performance

### ML-Based Anomaly Detection
- **Isolation Forest** - Unsupervised anomaly detection algorithm
- **Autoencoder** - Neural network-based anomaly detection
- **LSTM** - Long Short-Term Memory for predictive time-series anomaly detection
- **Prophet** - Seasonality detection and forecasting
- **Real-time anomaly alerting** - Instant notifications when anomalies are detected

### Intelligent Alerting
- **Alert grouping and deduplication** - Reduce alert noise with smart grouping
- **Advanced correlation** - Service-aware, topology-aware, and temporal correlation
- **Alert noise reduction** - Suppression rules to minimize false positives
- **Automatic runbook suggestions** - LLM-powered remediation recommendations

### Dashboard Intelligence
- **Role-based recommendations** - Dashboards recommended based on user role
- **Optimization suggestions** - AI-powered dashboard performance improvements
- **Template library** - Pre-built templates for infrastructure, applications, and databases
- **Dashboard versioning** - Track changes and restore previous versions

### Collaboration Features
- **RBAC permission system** - Owner, Editor, and Viewer roles
- **Knowledge base** - Searchable and categorized knowledge repository
- **Team workspaces** - Collaborate in dedicated team spaces
- **Comprehensive audit logging** - Track all actions for compliance

### Internationalization
- **Multi-language support** - English and Spanish translations included
- **Locale-aware formatting** - Numbers, dates, and currencies formatted by locale
- **Easy language switching** - User-selectable language preference

### Documentation
- **Architecture documentation** - Complete system architecture overview
- **API reference** - Comprehensive API documentation
- **Developer guide** - Onboarding and coding guidelines
- **Contributing guide** - Contribution workflow and standards
- **User guide** - End-user documentation
- **K8s deployment guide** - Kubernetes deployment instructions

### Testing & Infrastructure
- **67 passing unit tests** - Comprehensive test coverage
- **Integration tests** - 2 test suites covering conversation flow and query execution
- **E2E tests** - Playwright-based end-to-end testing
- **CI/CD pipeline** - GitHub Actions for automated testing and building
- **Security scanning** - Automated security vulnerability detection
- **Kubernetes manifests** - Production-ready K8s deployment configuration

## 📊 Build Statistics

- **90+ TypeScript/TSX files** (~12,000+ lines of code)
- **20+ service modules** for business logic
- **5 application pages** (Chat, Alerts, Anomalies, Dashboards, Settings)
- **TypeScript compilation**: Clean (0 errors)
- **Test coverage**: 67 unit tests + 2 integration suites + 1 E2E suite
- **Build size**: 29.97 kB (7.10 kB gzipped)

## 🔧 Installation

### From Archive
```bash
# Download the release archive
wget https://github.com/tahopetis/grafana-anna/releases/download/v0.2.0/anna-ai-assistant-v0.2.0.tar.gz

# Extract to Grafana plugins directory
cd /path/to/grafana/plugins/
tar -xzf anna-ai-assistant-v0.2.0.tar.gz
```

### From Source
```bash
git clone https://github.com/tahopetis/grafana-anna.git
cd grafana-anna
git checkout v0.2.0
npm install --legacy-peer-deps
npm run build

# Copy dist/ to your Grafana plugins directory
cp -r dist/ /path/to/grafana/plugins/anna-ai-assistant
```

## ⚙️ Configuration

After installation:
1. Restart Grafana server
2. Navigate to **Configuration** → **Plugins** → **Anna - AI Assistant**
3. Enable the plugin
4. Configure your LLM provider in the **grafana-llm-app** settings
5. Access Anna from the navigation menu

## 🐛 Bug Fixes

- Fixed TypeScript compilation errors
- Improved type safety across all components
- Enhanced error handling and user feedback
- Optimized bundle size for faster loading

## ⚠️ Breaking Changes

None. This release is backward compatible with v0.1.0.

## 📝 Migration Notes

No migration required. Simply upgrade the plugin and restart Grafana.

## 🙏 Acknowledgments

Thank you to all contributors and users who provided feedback during Phase 2 development!

## 📄 License

Apache License 2.0

## 🔗 Links

- **Documentation**: [README.md](https://github.com/tahopetis/grafana-anna/blob/main/README.md)
- **Issues**: [GitHub Issues](https://github.com/tahopetis/grafana-anna/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tahopetis/grafana-anna/discussions)

---

**Full Changelog**: https://github.com/tahopetis/grafana-anna/compare/v0.1.0...v0.2.0
