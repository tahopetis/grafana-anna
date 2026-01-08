# Changelog

All notable changes to the "Anna AI Assistant" Grafana plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.2] - 2026-01-08

### Fixed
- **Critical**: Fixed runtime error "Cannot read properties of undefined (reading 'startsWith')"
- Added defensive null/undefined checks to all string parsing operations
- Fixed in conversation manager, alert service, query service, and multi-datasource query service
- Plugin now handles undefined responses from LLM gracefully

## [0.2.1] - 2026-01-08

### Fixed
- **Critical**: Fixed build output filename from `module.mjs` to `module.js` to resolve Grafana plugin loading error "Plugin missing module.js"
- Plugin now loads correctly in Grafana instances

### Changed
- Enhanced plugin name from "Anna - AI Assistant" to "Anna AI Assistant" for better discoverability
- Improved plugin description to highlight key features and capabilities
- Updated author information and GitHub repository links to point to `tahopetis/grafana-anna`

## [0.2.0] - 2026-01-08

### Added
- **Phase 2 Complete**: All advanced features and production infrastructure implemented
- Query history with favorites and sharing capabilities
- Collaborative query annotations and team sharing
- ML-based anomaly detection with real-time monitoring
- Intelligent alerting with correlation analysis and runbook generation
- Dashboard intelligence with auto-optimization suggestions
- Collaboration features including shared workspaces and commenting
- Comprehensive internationalization (i18n) framework
- CI/CD pipeline with GitHub Actions
- Extensive testing infrastructure (67 unit tests, E2E tests)
- Complete documentation suite (API docs, architecture, developer guide)

### Infrastructure
- Production-ready build system with Vite
- TypeScript compilation with zero errors
- Optimized bundle size: 29.97 kB (7.09 kB gzipped)
- Comprehensive code quality tooling (ESLint, Prettier, Jest)

## [0.1.0] - 2026-01-08

### Added
- **MVP Release**: Initial release of Anna AI Assistant
- Natural language query interface for Prometheus and Loki
- Basic chat interface for data exploration
- Alert analysis and recommendations
- Simple dashboard suggestions
- Plugin registration and initialization

---

[Unreleased]: https://github.com/tahopetis/grafana-anna/compare/v0.2.2...HEAD
[0.2.2]: https://github.com/tahopetis/grafana-anna/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/tahopetis/grafana-anna/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/tahopetis/grafana-anna/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/tahopetis/grafana-anna/releases/tag/v0.1.0
