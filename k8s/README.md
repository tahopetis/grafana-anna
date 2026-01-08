# Kubernetes Deployment Guide - Anna AI Assistant

This directory contains Kubernetes manifests and deployment scripts for deploying Anna AI Assistant plugin to a Kubernetes-based Grafana installation.

## Quick Start

### Option 1: ConfigMap + Init Container (Testing/Development)

```bash
# 1. Build the plugin
npm run build

# 2. Deploy to Kubernetes
chmod +x k8s/deploy.sh
./k8s/deploy.sh

# 3. Access Grafana
kubectl port-forward svc/grafana 3000:3000 -n grafana
# Open http://localhost:3000
```

### Option 2: Custom Docker Image (Production)

```bash
# 1. Build the plugin
npm run build

# 2. Build and push custom image
chmod +x k8s/build-and-push.sh
# Edit k8s/build-and-push.sh to set your registry
./k8s/build-and-push.sh

# 3. Deploy using Helm
helm install grafana grafana/grafana -f k8s/helm-values.yaml
```

## Deployment Methods

### Method 1: ConfigMap + Init Container

**Files:**
- `01-configmap-plugin.yaml` - Plugin ConfigMap
- `02-deployment-with-init-container.yaml` - Grafana deployment with init container

**Pros:**
- ✅ Quick and easy
- ✅ No custom image needed
- ✅ Easy to update plugin

**Cons:**
- ❌ ConfigMap size limitations (large plugins may exceed limits)
- ❌ Init container runs on every pod restart

**Best for:** Testing, development, small deployments

### Method 2: Custom Docker Image

**Files:**
- `Dockerfile` - Multi-stage build with plugin
- `build-and-push.sh` - Build and push script
- `helm-values.yaml` - Helm chart values

**Pros:**
- ✅ Production-ready
- ✅ Plugin baked into image
- ✅ Faster pod startup
- ✅ Version-controlled images

**Cons:**
- ❌ Requires custom image registry
- ❌ Need to rebuild image for plugin updates

**Best for:** Production deployments, large-scale installations

### Method 3: Sidecar Container

**Pros:**
- ✅ Automatic plugin updates
- ✅ Separates concerns

**Cons:**
- ❌ More complex setup
- ❌ Additional resource overhead

## Manifests Overview

| File | Description |
|------|-------------|
| `00-namespace.yaml` | Grafana namespace |
| `01-configmap-plugin.yaml` | Plugin ConfigMap |
| `02-deployment-with-init-container.yaml` | Grafana deployment with init container |
| `03-service.yaml` | Grafana service |
| `04-ingress.yaml` | Ingress configuration (optional) |
| `Dockerfile` | Custom Grafana image with plugin |
| `helm-values.yaml` | Helm chart values |
| `build-and-push.sh` | Build and push script |
| `deploy.sh` | Deploy script (ConfigMap method) |

## Configuration

### Environment Variables

Edit `02-deployment-with-init-container.yaml`:

```yaml
env:
- name: GF_SECURITY_ADMIN_USER
  value: "admin"
- name: GF_SECURITY_ADMIN_PASSWORD
  value: "your-secure-password"
- name: GF_SERVER_ROOT_URL
  value: "https://grafana.yourdomain.com"
```

### Resources

Adjust resource limits based on your needs:

```yaml
resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 2Gi
```

### Persistence

For production, enable persistent storage:

```yaml
volumes:
- name: data
  persistentVolumeClaim:
    claimName: grafana-data
```

## Verification

### Check plugin installation:

```bash
# List plugin files
kubectl exec -it deployment/grafana -n grafana -- \
  ls -la /var/lib/grafana/plugins/anna-ai-assistant/

# Check Grafana logs
kubectl logs -f deployment/grafana -n grafana

# Verify plugin is loaded
kubectl exec -it deployment/grafana -n grafana -- \
  grafana-cli plugins ls | grep anna
```

### Test the plugin:

1. Open Grafana: `http://your-grafana-url`
2. Navigate to: **Configuration** → **Plugins**
3. Find: **Anna - AI Assistant**
4. Click to open and start using

## Troubleshooting

### Plugin not appearing

```bash
# Check if plugin files exist
kubectl exec -it deployment/grafana -n grafana -- \
  ls -la /var/lib/grafana/plugins/anna-ai-assistant/

# Check Grafana logs for errors
kubectl logs -f deployment/grafana -n grafana | grep -i anna

# Verify ConfigMap
kubectl describe configmap anna-ai-assistant-plugin -n grafana
```

### Permission errors

```bash
# Check file permissions
kubectl exec -it deployment/grafana -n grafana -- \
  ls -la /var/lib/grafana/plugins/

# Fix permissions in init container
chmod -R 755 /plugins/anna-ai-assistant
```

### ConfigMap too large

If you get "ConfigMap is too large" error, use the custom image method instead.

### Pod not starting

```bash
# Check pod status
kubectl get pods -n grafana

# Describe pod
kubectl describe pod -l app=grafana -n grafana

# Check init container logs
kubectl logs -f deployment/grafana -c install-anna-plugin -n grafana
```

## Updating the Plugin

### ConfigMap Method:

```bash
# Rebuild plugin
npm run build

# Update ConfigMap
kubectl create configmap anna-ai-assistant-plugin \
  --from-file=dist/ \
  --namespace=grafana \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart Grafana pods
kubectl rollout restart deployment/grafana -n grafana
```

### Custom Image Method:

```bash
# Rebuild plugin
npm run build

# Build and push new image
./k8s/build-and-push.sh

# Update deployment (or Helm values)
kubectl set image deployment/grafana \
  grafana=your-registry/grafana-anna:11.0.0-v1.0.0 \
  -n grafana
```

## Security Considerations

1. **Change default credentials** - Update admin password in production
2. **Use RBAC** - Configure proper role-based access control
3. **Enable TLS** - Use HTTPS with Ingress or Service
4. **Limit resources** - Set appropriate CPU/memory limits
5. **Network policies** - Restrict network access
6. **Secret management** - Use Kubernetes Secrets for sensitive data

## Production Checklist

- [ ] Changed default admin password
- [ ] Configured persistent storage
- [ ] Set appropriate resource limits
- [ ] Enabled TLS/HTTPS
- [ ] Configured RBAC
- [ ] Set up monitoring and logging
- [ ] Configured backup strategy
- [ ] Configured LLM provider credentials
- [ ] Tested plugin functionality
- [ ] Set up high availability (replicas > 1)

## Next Steps

After deployment:

1. Configure LLM provider in grafana-llm-app
2. Test natural language querying
3. Set up anomaly detection
4. Configure alert intelligence
5. Create dashboards

See [USER_GUIDE.md](../USER_GUIDE.md) for detailed usage instructions.
