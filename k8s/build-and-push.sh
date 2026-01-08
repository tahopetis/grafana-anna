#!/bin/bash
# Build and push custom Grafana image with Anna AI Assistant plugin

set -e

# Configuration
REGISTRY="your-registry"
IMAGE_NAME="grafana-anna"
GRAFANA_VERSION="11.0.0"
ANNA_VERSION="1.0.0"
FULL_TAG="${REGISTRY}/${IMAGE_NAME}:${GRAFANA_VERSION}-v${ANNA_VERSION}"
LATEST_TAG="${REGISTRY}/${IMAGE_NAME}:latest"

echo "🔨 Building custom Grafana image with Anna AI Assistant plugin..."
echo "Image: ${FULL_TAG}"

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "❌ Error: dist directory not found. Run 'npm run build' first."
  exit 1
fi

# Build the image
echo "📦 Building Docker image..."
docker build -f k8s/Dockerfile -t "${FULL_TAG}" -t "${LATEST_TAG}" .

# Push to registry
echo "⬆️  Pushing image to registry..."
docker push "${FULL_TAG}"
docker push "${LATEST_TAG}"

echo "✅ Successfully built and pushed image:"
echo "   ${FULL_TAG}"
echo "   ${LATEST_TAG}"
echo ""
echo "📝 Update k8s/helm-values.yaml to use:"
echo "   image:"
echo "     repository: ${REGISTRY}/${IMAGE_NAME}"
echo "     tag: ${GRAFANA_VERSION}-v${ANNA_VERSION}"
