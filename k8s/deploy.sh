#!/bin/bash
# Deploy Anna AI Assistant plugin to Kubernetes (ConfigMap + Init Container method)

set -e

NAMESPACE="grafana"
PLUGIN_DIR="dist"
CONFIGMAP_NAME="anna-ai-assistant-plugin"

echo "🚀 Deploying Anna AI Assistant plugin to Kubernetes..."

# Check if dist directory exists
if [ ! -d "${PLUGIN_DIR}" ]; then
  echo "❌ Error: ${PLUGIN_DIR} directory not found. Run 'npm run build' first."
  exit 1
fi

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
  echo "❌ Error: kubectl not found. Please install kubectl."
  exit 1
fi

# Create namespace if it doesn't exist
echo "📦 Creating namespace: ${NAMESPACE}"
kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

# Create ConfigMap from dist directory
echo "📦 Creating ConfigMap: ${CONFIGMAP_NAME}"
kubectl create configmap "${CONFIGMAP_NAME}" \
  --from-file="${PLUGIN_DIR}/" \
  --namespace="${NAMESPACE}" \
  --dry-run=client -o yaml | kubectl apply -f -

# Deploy Kubernetes manifests
echo "📦 Applying Kubernetes manifests..."
for file in k8s/*.yaml; do
  if [[ ! "$file" =~ "helm-values" ]]; then
    echo "  Applying $file..."
    kubectl apply -f "$file"
  fi
done

# Wait for deployment to be ready
echo "⏳ Waiting for Grafana deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s \
  deployment/grafana -n "${NAMESPACE}"

echo "✅ Deployment successful!"
echo ""
echo "🔗 Access Grafana:"
if kubectl get svc grafana -n "${NAMESPACE}" &> /dev/null; then
  SERVICE_IP=$(kubectl get svc grafana -n "${NAMESPACE}" -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
  if [ -n "$SERVICE_IP" ]; then
    echo "   URL: http://${SERVICE_IP}:3000"
  else
    echo "   Port-forward: kubectl port-forward svc/grafana 3000:3000 -n ${NAMESPACE}"
    echo "   Then: http://localhost:3000"
  fi
fi
echo ""
echo "🔑 Default credentials: admin / admin"
echo ""
echo "📖 Plugin access: http://your-grafana-url/a/anna-ai-assistant"
