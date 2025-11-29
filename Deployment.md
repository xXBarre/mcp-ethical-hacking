# Deployment

Guías para desplegar MCP Ethical Hacking en diferentes entornos.

## Opciones de Despliegue

1. Local (Desarrollo)
2. Docker (Contenedorizado)
3. Kubernetes (Orquestación)
4. AWS Lambda (Serverless)
5. Google Cloud Run (Serverless)

## Despliegue Local

### Requisitos

- Node.js 18+
- npm
- Linux, macOS o WSL en Windows

### Pasos

1. Clonar repositorio

```bash
git clone https://github.com/tu-usuario/mcp-ethical-hacking.git
cd mcp-ethical-hacking
```

2. Instalar dependencias

```bash
npm install
```

3. Configurar variables de entorno

```bash
export NOTION_API_KEY="tu-clave-notion"
```

4. Iniciar servidor

```bash
npm start
```

5. Verificar funcionamiento

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | npm start
```

### Modo Desarrollo

```bash
npm run dev
```

Proporciona logs detallados y reinicio automático.

## Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY src ./src

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
```

### Construcción

```bash
docker build -t mcp-ethical-hacking:latest .
```

### Ejecución

```bash
docker run -d \
  --name mcp-server \
  -e NOTION_API_KEY="tu-clave" \
  -p 3000:3000 \
  -v /tmp:/tmp \
  mcp-ethical-hacking:latest
```

### Docker Compose

```yaml
version: '3.8'

services:
  mcp-server:
    build: .
    container_name: mcp-ethical-hacking
    environment:
      NOTION_API_KEY: ${NOTION_API_KEY}
      NODE_ENV: production
    ports:
      - "3000:3000"
    volumes:
      - /tmp:/tmp
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Iniciar con Docker Compose

```bash
docker-compose up -d
```

## Kubernetes

### Manifesto Deployment (deployment.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-ethical-hacking
  namespace: security
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mcp-server
  template:
    metadata:
      labels:
        app: mcp-server
    spec:
      containers:
      - name: mcp-server
        image: mcp-ethical-hacking:latest
        imagePullPolicy: Always
        env:
        - name: NOTION_API_KEY
          valueFrom:
            secretKeyRef:
              name: mcp-secrets
              key: notion-api-key
        - name: NODE_ENV
          value: "production"
        ports:
        - containerPort: 3000
          name: http
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Service (service.yaml)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mcp-service
  namespace: security
spec:
  selector:
    app: mcp-server
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

### Secret (secret.yaml)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mcp-secrets
  namespace: security
type: Opaque
stringData:
  notion-api-key: "tu-clave-notion"
```

### Despliegue

```bash
# Crear namespace
kubectl create namespace security

# Crear secret
kubectl apply -f secret.yaml

# Desplegar
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Verificar
kubectl get pods -n security
kubectl logs -n security -f deployment/mcp-ethical-hacking
```

## AWS Lambda

### Estructura del Proyecto

```
lambda-project/
├── src/
│   └── server.js
├── package.json
├── index.js
└── serverless.yml
```

### Handler (index.js)

```javascript
const { spawn } = require('child_process');

exports.handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    const mcp = spawn('node', ['src/server.js']);

    let output = '';
    let error = '';

    mcp.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcp.stderr.on('data', (data) => {
      error += data.toString();
    });

    const request = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: event.tool
    }) + '\n';

    mcp.stdin.write(request);
    mcp.stdin.end();

    const timeout = setTimeout(() => {
      mcp.kill();
      reject(new Error('Timeout'));
    }, 30000);

    mcp.on('close', (code) => {
      clearTimeout(timeout);
      try {
        const result = JSON.parse(output);
        resolve({
          statusCode: 200,
          body: JSON.stringify(result)
        });
      } catch (e) {
        reject({
          statusCode: 500,
          body: JSON.stringify({ error: output || error })
        });
      }
    });
  });
};
```

### Configuración Serverless (serverless.yml)

```yaml
service: mcp-ethical-hacking

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NOTION_API_KEY: ${ssm:notion-api-key}

functions:
  runCommand:
    handler: index.handler
    timeout: 60
    memorySize: 512
    events:
      - http:
          path: execute
          method: post

plugins:
  - serverless-offline
```

### Despliegue

```bash
# Instalar Serverless Framework
npm install -g serverless

# Configurar credenciales AWS
serverless config credentials --provider aws --key xxx --secret yyy

# Desplegar
serverless deploy

# Verificar
serverless logs -f runCommand
```

## Google Cloud Run

### Dockerfile

```dockerfile
FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY src ./src

ENV PORT=8080
ENV NODE_ENV=production

CMD ["npm", "start"]
```

### Cloud Build (cloudbuild.yaml)

```yaml
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'gcr.io/$PROJECT_ID/mcp-ethical-hacking', '.']

- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'gcr.io/$PROJECT_ID/mcp-ethical-hacking']

- name: 'gcr.io/cloud-builders/gke-deploy'
  args:
  - run
  - --filename=k8s/
  - --image=gcr.io/$PROJECT_ID/mcp-ethical-hacking
  - --location=us-central1
  - --cluster=production
```

### Despliegue Local para Testing

```bash
# Instalar Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Autenticarse
gcloud auth login

# Configurar proyecto
gcloud config set project PROJECT_ID

# Construir imagen
gcloud builds submit --tag gcr.io/PROJECT_ID/mcp-ethical-hacking

# Desplegar a Cloud Run
gcloud run deploy mcp-ethical-hacking \
  --image gcr.io/PROJECT_ID/mcp-ethical-hacking \
  --platform managed \
  --region us-central1 \
  --set-env-vars NOTION_API_KEY=tu-clave \
  --memory 512Mi \
  --timeout 3600
```

### Verificación

```bash
gcloud run services describe mcp-ethical-hacking --region us-central1

# Obtener URL
gcloud run services describe mcp-ethical-hacking --region us-central1 --format='value(status.url)'
```

## Monitoreo y Logs

### Docker

```bash
# Ver logs
docker logs -f mcp-server

# Ver stats
docker stats mcp-server
```

### Kubernetes

```bash
# Ver logs
kubectl logs -n security -f deployment/mcp-ethical-hacking

# Ver eventos
kubectl get events -n security

# Port forward
kubectl port-forward -n security svc/mcp-service 3000:80
```

### CloudWatch (AWS)

```bash
# Ver logs en tiempo real
aws logs tail /aws/lambda/runCommand --follow

# Ver métricas
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=runCommand \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-02T00:00:00Z \
  --period 300 \
  --statistics Average
```

## Variables de Entorno por Entorno

### Desarrollo Local

```bash
export NOTION_API_KEY="dev_key_xxx"
export NODE_ENV="development"
export DEBUG="*"
```

### Producción Docker

```bash
NOTION_API_KEY=prod_key_xxx
NODE_ENV=production
LOG_LEVEL=info
```

### Producción Kubernetes

```yaml
- name: NOTION_API_KEY
  valueFrom:
    secretKeyRef:
      name: mcp-secrets
      key: notion-api-key
- name: NODE_ENV
  value: "production"
```

### Producción AWS

```bash
aws ssm put-parameter \
  --name notion-api-key \
  --value "prod_key_xxx" \
  --type SecureString
```

## Escalabilidad

### Consideraciones

- run_command: 60s timeout máximo, ajustable a 300s
- Memoria: 256Mi-512Mi por instancia
- Máximo 5 conexiones concurrentes por instancia

### Escalar Horizontalmente

**Kubernetes:**
```bash
kubectl scale deployment mcp-ethical-hacking --replicas=5 -n security
```

**AWS Lambda:**
Las invocaciones se escalan automáticamente. Configurar límites:

```bash
aws lambda put-function-concurrency \
  --function-name runCommand \
  --reserved-concurrent-executions 100
```

## Seguridad en Producción

1. Usar secretos para API keys
2. Habilitar HTTPS/TLS
3. Restringir comandos permitidos
4. Implementar autenticación
5. Usar redes privadas
6. Auditar logs
7. Limitar recursos

### Ejemplo: Restricción de Comandos

```javascript
const ALLOWED_COMMANDS = [
  'nmap', 'curl', 'dig', 'whois',
  'strings', 'file', 'hexdump',
  'netstat', 'ss'
];

function isAllowedCommand(cmd) {
  return ALLOWED_COMMANDS.includes(cmd);
}
```

## Troubleshooting

### Contenedor no inicia

```bash
docker logs mcp-server
```

### Pod no está Ready

```bash
kubectl describe pod <pod-name> -n security
```

### Timeouts en Lambda

Aumentar timeout en serverless.yml:
```yaml
timeout: 300
```

### Errores de Permisos

Ejecutar con usuario no-root:
```dockerfile
RUN useradd -m appuser
USER appuser
```
