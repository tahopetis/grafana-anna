# Anna AI Assistant - User Guide

**Version:** 1.0.0 (MVP)
**Last Updated:** January 8, 2026

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Features](#features)
   - [Natural Language Querying](#natural-language-querying)
   - [Anomaly Detection](#anomaly-detection)
   - [Alert Intelligence](#alert-intelligence)
   - [Dashboard Generation](#dashboard-generation)
4. [Configuration](#configuration)
5. [Tips & Best Practices](#tips--best-practices)
6. [Troubleshooting](#troubleshooting)
7. [Limitations](#limitations)

---

## Introduction

**Anna** is an AI-powered assistant for Grafana that helps you monitor, diagnose, and optimize your systems through natural language interaction. Anna democratizes observability by making complex querying, anomaly detection, alert analysis, and dashboard creation accessible to everyone.

### What Can Anna Do?

- **Convert natural language to queries** - Ask questions in plain English, get PromQL/LogQL queries
- **Detect anomalies** - Automatically identify unusual patterns in your metrics and logs
- **Analyze alerts** - Get intelligent insights, correlations, and remediation suggestions
- **Generate dashboards** - Describe what you want to monitor, Anna creates the dashboard

---

## Getting Started

### Prerequisites

Before using Anna, ensure you have:

1. **Grafana 11.0.0 or higher** installed
2. **grafana-llm-app plugin** (version 0.22.0 or higher) installed and configured
3. **An active LLM provider** (OpenAI, Anthropic, Azure OpenAI, etc.) configured in grafana-llm-app

### Installation

1. **Install the Plugin**
   ```bash
   # Copy the dist directory to your Grafana plugins directory
   cp -r dist /var/lib/grafana/plugins/anna-ai-assistant
   ```

   Or install via Grafana CLI:
   ```bash
   grafana-cli plugins install anna-ai-assistant
   ```

2. **Restart Grafana**
   ```bash
   sudo systemctl restart grafana-server
   ```

3. **Access Anna**
   - Navigate to **Plugins** → **Anna - AI Assistant** in Grafana
   - Or go directly to: `http://your-grafana-url/a/anna-ai-assistant`

### First-Time Setup

1. **Configure LLM Provider**
   - Go to **Configuration** → **Plugin ** → **grafana-llm-app**
   - Add your LLM provider credentials (API key, endpoint, etc.)
   - Test the connection to ensure it's working

2. **Start Chatting**
   - Navigate to the **Chat** page
   - Start asking questions in natural language!

---

## Features

### Natural Language Querying

Convert everyday language into powerful PromQL and LogQL queries with explanations.

#### How to Use

1. Go to the **Chat** page
2. Type your question in the input field
3. Anna will generate the query and explain what it does

#### Example Queries

**CPU Usage:**
```
You: "Show me CPU usage for the last hour"
Anna: PromQL: rate(process_cpu_seconds_total[5m])
Explanation: Calculates the per-second average rate of CPU usage over 5-minute intervals
```

**Memory Trends:**
```
You: "What's the memory trend for my application?"
Anna: PromQL: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100
Explanation: Shows percentage of used memory
```

**Error Logs:**
```
You: "Find all ERROR logs in the last 15 minutes"
Anna: LogQL: {job="myapp"} |= "ERROR" | line format "{{.timestamp}} {{.message}}"
Explanation: Searches for log lines containing "ERROR" in the last 15 minutes
```

**Request Rate:**
```
You: "Show the request rate per minute"
Anna: PromQL: rate(http_requests_total[1m]) * 60
Explanation: Calculates requests per second and converts to per-minute rate
```

#### Tips

- **Be specific about time ranges**: "in the last hour", "for the past 24 hours"
- **Mention the metric name**: "CPU usage", "memory consumption", "request count"
- **Specify aggregation**: "per minute", "average over 5 minutes", "maximum value"
- **Ask for explanations**: "Explain this query", "What does this do?"

---

### Anomaly Detection

Automatically detect and explain unusual patterns in your metrics and logs.

#### How to Use

1. Navigate to the **Anomalies** page
2. Select your data source and metric
3. Configure detection parameters:
   - **Time Range**: How far back to look
   - **Threshold**: How many standard deviations to consider anomalous
   - **Sensitivity**: Lower = more sensitive, Higher = fewer false positives
4. Click **"Detect Anomalies"**
5. Review detected anomalies with AI-generated explanations

#### Detection Methods

**Statistical Anomaly Detection:**
- Uses Z-score analysis to identify outliers
- Compares current values to historical patterns
- Flags metrics that deviate beyond the threshold

**Example Output:**
```
⚠️ Anomaly Detected: CPU usage spike
- Time: 2026-01-08 14:30:15
- Value: 87.3% (normally 45-55%)
- Deviation: +3.2 standard deviations
- Explanation: Unusual CPU spike detected, possibly due to:
  * Increased application load
  * Background process execution
  * Resource contention
  * Potential performance issue requiring investigation
```

#### Interpreting Results

- **High Deviation (>3σ)**: Strong anomaly, investigate immediately
- **Medium Deviation (2-3σ)**: Moderate anomaly, monitor closely
- **Low Deviation (<2σ)**: Minor variation, likely normal

#### Best Practices

- Start with **lower sensitivity** (2.5-3.0) to reduce false positives
- **Adjust time range** based on your metric's natural patterns
- **Review multiple metrics** to get context
- **Set up alerts** for critical anomalies

---

### Alert Intelligence

Analyze, correlate, and get actionable insights from your Grafana alerts.

#### How to Use

1. Go to the **Alerts** page
2. View your active alerts with AI-powered analysis
3. Click on any alert to see:
   - Detailed analysis
   - Correlated alerts
   - Remediation suggestions
4. Use filters to find specific alerts

#### Alert Analysis Features

**Automatic Correlation:**
```
🔗 Related Alerts Detected:
- High CPU Usage (api-server)
- High Memory Usage (api-server)
- Database Slow Queries (postgres-db)
- Suggestion: These alerts may be related - investigate database performance first
```

**Remediation Suggestions:**
```
💡 Remediation Steps:
1. Check database connection pool settings
2. Review slow query logs
3. Consider adding indexes to frequently queried columns
4. Scale database resources if needed
5. Review application code for N+1 query problems
```

**Alert Context:**
```
📊 Alert Context:
- Triggered: 5 times in the last hour
- Severity: Warning
- Affected Labels: env=production, service=api, region=us-east-1
- First Seen: 2026-01-08 14:00:00
- Last Seen: 2026-01-08 14:55:23
```

#### Using Filters

- **By Severity**: Critical, Warning, Info
- **By State**: Firing, Resolved, Pending
- **By Label**: environment, service, region
- **By Time Range**: Last hour, 24 hours, 7 days

#### Best Practices

- **Act on Critical alerts first**
- **Review correlated alerts together** for root cause analysis
- **Document repeated issues** for future prevention
- **Adjust alert thresholds** based on AI recommendations

---

### Dashboard Generation

Create comprehensive Grafana dashboards from natural language descriptions.

#### How to Use

1. Navigate to the **Dashboards** page
2. Describe your dashboard requirements
3. Anna generates:
   - Panel configurations
   - Queries
   - Visualizations
   - Layout suggestions
4. Preview and customize
5. Import to Grafana

#### Example Prompts

**Application Monitoring:**
```
You: "Create a dashboard for monitoring my web application"
Anna: Generated dashboard with:
- Request rate panel (timeseries)
- Error rate panel (timeseries)
- Response time panel (heatmap)
- Status code distribution (pie chart)
- Top 5 slow endpoints (table)
```

**Infrastructure Monitoring:**
```
You: "I need a dashboard for server infrastructure"
Anna: Generated dashboard with:
- CPU usage per host (timeseries)
- Memory utilization (gauge)
- Disk I/O (barchart)
- Network traffic (timeseries)
- System load (stat panel)
```

**Custom Dashboards:**
```
You: "Create an e-commerce dashboard tracking orders, revenue, and user activity"
Anna: Generated dashboard with:
- Orders per minute (timeseries)
- Revenue trends (stat panel with sparkline)
- Active users (gauge)
- Conversion rate (single stat)
- Top products (table)
- Geographic distribution (geomap)
```

#### Panel Types Generated

- **Time Series**: Trends over time
- **Gauge**: Single value with min/max
- **Stat**: Key metrics with sparklines
- **Bar Chart**: Categorical comparisons
- **Pie Chart**: Distributions
- **Heatmap**: Density and patterns
- **Table**: Tabular data with sorting
- **Logs Panel**: Log data with search

#### Customization

After generation, you can:
- Adjust panel positions
- Modify queries
- Change visualization types
- Add custom colors
- Set thresholds and alerts
- Add variables for dynamic dashboards

#### Tips for Best Results

- **Be specific**: "monitor web application API performance" vs vague "make a dashboard"
- **Mention metrics**: "CPU, memory, disk usage" vs "system metrics"
- **Specify use case**: "for DevOps team" vs generic dashboard
- **Include time context**: "last 24 hours", "real-time monitoring"
- **Reference standards**: "like the default Grafana dashboard"

---

## Configuration

### LLM Provider Settings

Access via **Configuration** → **Settings**

**Supported Providers:**
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Azure OpenAI
- Google AI (Gemini)
- Local LLMs (via API)

**Settings:**
- **API Key**: Your provider's API key
- **Model**: Which model to use
- **Temperature**: Response randomness (0.0 - 1.0, default 0.7)
  - Lower = more focused, deterministic
  - Higher = more creative, varied
- **Max Tokens**: Maximum response length

### Plugin Settings

**Conversation History:**
- Stored locally in your browser
- Retained for 30 days by default
- Can be cleared manually

**Query Settings:**
- Default time range: Last 6 hours
- Default step interval: Auto
- Max query complexity: Medium

**Anomaly Detection:**
- Default threshold: 2.5 standard deviations
- Default sensitivity: Medium
- Max data points: 10,000

---

## Tips & Best Practices

### For Better Query Results

1. **Use complete sentences**: "Show me the average response time for the last hour" (better than "avg response time")

2. **Provide context**: Include relevant labels, time ranges, and data sources

3. **Be specific about aggregation**: "average over 5 minutes" vs "average"

4. **Ask follow-up questions**: "Refine that query to filter only errors"

5. **Request explanations**: "Explain what this PromQL query does"

### For Anomaly Detection

1. **Start with default settings**, then adjust based on your data

2. **Use appropriate time ranges**: Short-term for recent issues, long-term for trends

3. **Monitor sensitivity**: Too sensitive = many false positives, not sensitive enough = missed issues

4. **Correlate with other metrics**: Don't rely on a single metric

5. **Document known anomalies**: Help Anna learn your patterns

### For Alert Management

1. **Set up alert rules**: Don't wait for alerts to fire

2. **Use severity levels**: Prioritize Critical > Warning > Info

3. **Review correlations**: Related alerts often share root causes

4. **Act on suggestions**: Anna's remediation tips are based on best practices

5. **Track alert frequency**: Repeated alerts indicate systemic issues

### For Dashboard Creation

1. **Start simple**: Create basic dashboards first, then enhance

2. **Focus on key metrics**: Don't overcrowd panels

3. **Use consistent time ranges**: Across all panels for easier correlation

4. **Leverage variables**: Make dashboards reusable across environments

5. **Iterate and refine**: Customize after import to match your needs

---

## Troubleshooting

### Common Issues

**"LLM provider not configured"**
- **Solution**: Go to grafana-llm-app settings and configure your LLM provider

**"No data sources available"**
- **Solution**: Add data sources in Grafana Configuration → Data Sources

**"Query returned no results"**
- **Solutions**:
  - Check if the metric exists in your data source
  - Verify time range contains data
  - Ensure data source is accessible
  - Try simplifying the query

**"Anomaly detection found no anomalies"**
- **Solutions**:
  - Adjust sensitivity (lower = more sensitive)
  - Increase time range
  - Check if metric has enough variation
  - Verify the metric is being collected

**"Dashboard generation failed"**
- **Solutions**:
  - Be more specific in your description
  - Ensure metric names exist in your data source
  - Check LLM provider connection
  - Try a simpler request first

**"Plugin page not loading"**
- **Solutions**:
  - Refresh the page
  - Check browser console for errors (F12)
  - Verify plugin is installed correctly
  - Check Grafana logs: `journalctl -u grafana-server`

### Getting Help

- **GitHub Issues**: [Report bugs or feature requests](https://github.com/yourusername/grafana-anna/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/yourusername/grafana-anna/discussions)
- **Documentation**: Check the [README](README.md) for technical details

---

## Limitations

### Current MVP Limitations (Version 1.0.0)

**Query Capabilities:**
- Single data source queries only (no cross-source queries)
- Basic PromQL/LogQL generation (complex queries may need manual refinement)
- No query optimization suggestions
- No query history/favorites

**Anomaly Detection:**
- Statistical methods only (no ML-based detection)
- No predictive capabilities
- Single metric analysis (no multi-metric correlation)
- No automated alerting on anomalies

**Alert Intelligence:**
- Basic correlation logic (rule-based)
- No advanced grouping or deduplication
- No automatic runbook generation
- Limited to Grafana alerts (no external sources)

**Dashboard Generation:**
- Simple dashboard structures only
- Limited template library
- No dashboard recommendations
- No versioning or change tracking

**General:**
- No collaboration features (sharing, permissions)
- No multi-language support (English only)
- No accessibility features (planned for Phase 2)
- No mobile optimization
- No offline mode

### Planned Improvements (Phase 2)

See the [README Roadmap](README.md#phase-2---production-enhancement-planned) for upcoming features including:
- Advanced query capabilities
- ML-based anomaly detection
- Intelligent alert grouping
- Dashboard intelligence
- Collaboration features
- Comprehensive testing
- Full documentation suite

---

## Keyboard Shortcuts

**Chat Page:**
- `Ctrl/Cmd + Enter`: Send message
- `Ctrl/Cmd + k`: Clear conversation
- `↑` / `↓`: Navigate message history

**Dashboard Navigation:**
- `g + c`: Go to Chat page
- `g + a`: Go to Alerts page
- `g + n`: Go to Anomalies page
- `g + d`: Go to Dashboards page
- `g + s`: Go to Settings

**General:**
- `Esc`: Close modal or panel
- `?`: Show keyboard shortcuts

---

## FAQ

**Q: Does Anna store my data?**
A: Conversation history is stored locally in your browser. No data is sent to external servers except to your configured LLM provider for query processing.

**Q: Is Anna free?**
A: Yes, Anna is open-source (Apache 2.0 license). However, you'll need an LLM provider account (e.g., OpenAI API) which may have costs.

**Q: Can I use Anna with multiple Grafana instances?**
A: Yes, install Anna on each Grafana instance. Configuration is per-instance.

**Q: What LLM models work best?**
A: GPT-4 and Claude 3 Opus provide the best results. GPT-3.5 and Claude 3 Haiku are faster and more cost-effective for simpler queries.

**Q: Can Anna access all my Grafana data?**
A: Anna only accesses data sources and metrics that you have permission to view in Grafana. It respects Grafana's RBAC.

**Q: How do I improve query accuracy?**
A: Be specific, provide context, use complete sentences, and iterate with follow-up questions.

---

## Version History

**v1.0.0 (January 8, 2026) - MVP Release**
- ✅ Natural Language Querying
- ✅ Anomaly Detection (statistical)
- ✅ Alert Intelligence
- ✅ Dashboard Generation
- ✅ Type-safe implementation
- ✅ Complete feature set

---

## Support & Feedback

We'd love to hear from you!

- **Report Issues**: [GitHub Issues](https://github.com/yourusername/grafana-anna/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/grafana-anna/discussions)
- **Contributions**: See [CONTRIBUTING.md](CONTRIBUTING.md) (coming in Phase 2)

---

**Made with ❤️ by the Grafana community**

*Anna is your intelligent companion for observability. Let's make monitoring accessible to everyone!*
