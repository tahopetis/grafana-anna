# Custom Grafana image with Anna AI Assistant plugin
# Build: docker build -f k8s/Dockerfile -t your-registry/grafana-anna:11.0.0-v1.0.0 .
FROM grafana/grafana:11.0.0

# Set labels
LABEL maintainer="your-email@example.com"
LABEL description="Grafana with Anna AI Assistant plugin v1.0.0"
LABEL version="1.0.0"

# Set working directory
WORKDIR /opt/grafana

# Copy plugin to Grafana plugins directory
COPY dist /var/lib/grafana/plugins/anna-ai-assistant

# Set permissions for the plugin
RUN chmod -R 755 /var/lib/grafana/plugins/anna-ai-assistant && \
    chown -R grafana:grafana /var/lib/grafana/plugins/anna-ai-assistant

# Verify plugin is present
RUN ls -la /var/lib/grafana/plugins/anna-ai-assistant/

# Expose Grafana port
EXPOSE 3000

# Default command
CMD ["/run.sh"]
