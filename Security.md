# Security

Consideraciones de seguridad para desplegar MCP Ethical Hacking en producción.

## Resumen Ejecutivo

MCP Ethical Hacking ejecuta comandos arbitrarios. Debe ser desplegado:
- En redes privadas únicamente
- Con autenticación fuerte
- En contenedores aislados
- Con auditoría completa
- Con restricciones de comandos

## Modelo de Amenazas

### Atacante Externo

**Riesgo**: Acceso no autorizado al servidor

**Mitigación**:
- Firewall (solo redes privadas)
- Autenticación requerida
- HTTPS/TLS obligatorio
- Rate limiting

### Atacante Interno Comprometido

**Riesgo**: Uso malicioso de comandos

**Mitigación**:
- Limitar comandos permitidos
- Ejecutar con usuario no-root
- Aislar procesos
- Auditar todas las acciones

### Escalada de Privilegios

**Riesgo**: Sudo sin contraseña

**Mitigación**:
- Nunca ejecutar npm con sudo
- Usar usuario dedicado
- Evitar NOPASSWD en sudoers

## Control de Acceso

### Autenticación

Implementar autenticación básica:

```javascript
// middleware.js
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const [type, token] = auth.split(' ');
  
  if (type !== 'Bearer' || !verifyToken(token)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  next();
}

function verifyToken(token) {
  return token === process.env.API_TOKEN;
}
```

### Autorización

Limitar herramientas por usuario:

```javascript
const TOOL_PERMISSIONS = {
  'user1': ['run_command', 'search_command'],
  'admin': ['run_command', 'install_package', 'launch_gui_tool']
};

function canAccessTool(user, tool) {
  const allowed = TOOL_PERMISSIONS[user] || [];
  return allowed.includes(tool);
}
```

## Restricción de Comandos

### Whitelist de Comandos

Permitir solo comandos seguros:

```javascript
const ALLOWED_COMMANDS = [
  'nmap',
  'curl',
  'dig',
  'whois',
  'strings',
  'file',
  'hexdump',
  'netstat',
  'ss',
  'grep',
  'awk',
  'sed'
];

function isCommandAllowed(command) {
  return ALLOWED_COMMANDS.includes(command);
}

async function handleRunCommand(args) {
  if (!isCommandAllowed(args.command)) {
    throw new Error(`Comando no permitido: ${args.command}`);
  }
  
  return runShell(args.command, args.args, args);
}
```

### Blacklist de Argumentos

Bloquear argumentos peligrosos:

```javascript
const DANGEROUS_PATTERNS = [
  '&&',
  '||',
  ';',
  '|',
  '$(',
  '`',
  '>/dev/null',
  '2>&1'
];

function validateArgs(args) {
  for (const arg of args) {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (arg.includes(pattern)) {
        throw new Error(`Patrón peligroso detectado: ${pattern}`);
      }
    }
  }
}
```

## Aislamiento de Procesos

### Ejecutar como Usuario No-Root

```bash
# Crear usuario dedicado
useradd -m -s /bin/bash -d /home/mcp mcp

# Cambiar propiedad
chown -R mcp:mcp /opt/mcp-server

# Ejecutar como usuario
sudo -u mcp npm start
```

### Contenedor Aislado

```dockerfile
# Usar imagen base mínima
FROM node:18-alpine

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Cambiar propiedad
COPY --chown=nodejs:nodejs . .

# Ejecutar como usuario
USER nodejs

CMD ["npm", "start"]
```

### Límites de Recursos

En Docker:

```bash
docker run -d \
  --memory 512m \
  --cpus 1.0 \
  --ulimit nofile=1024:2048 \
  mcp-ethical-hacking
```

En Kubernetes:

```yaml
resources:
  limits:
    memory: "512Mi"
    cpu: "1"
    ephemeral-storage: "1Gi"
  requests:
    memory: "256Mi"
    cpu: "500m"
```

## Cifrado

### HTTPS/TLS

En Express:

```javascript
const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

const options = {
  key: fs.readFileSync('/etc/ssl/private/key.pem'),
  cert: fs.readFileSync('/etc/ssl/certs/cert.pem')
};

https.createServer(options, app).listen(3000);
```

En Kubernetes:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mcp-tls
spec:
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: security
    ports:
    - protocol: TCP
      port: 3000
```

### Secretos

Nunca hardcodear en código:

```bash
# Usar variables de entorno
export NOTION_API_KEY=$(aws secretsmanager get-secret-value \
  --secret-id mcp-notion-key \
  --query SecretString \
  --output text)
```

## Auditoría y Logging

### Auditar Todos los Comandos

```javascript
function auditCommand(command, args, user, success, error) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    command,
    args,
    user,
    success,
    error: error?.message || null
  };
  
  console.error(JSON.stringify(logEntry));
  
  // Enviar a servicio de logging centralizado
  sendToLogService(logEntry);
}
```

### Centralizar Logs

Usar ELK Stack o similar:

```javascript
const winston = require('winston');
const ElasticsearchTransport = require('winston-elasticsearch');

const logger = winston.createLogger({
  transports: [
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: 'http://elasticsearch:9200' },
      index: 'mcp-logs'
    })
  ]
});
```

### Alertas

```javascript
function checkSuspiciousActivity(logEntry) {
  // Alertar si comando falló múltiples veces
  if (!logEntry.success && consecutiveFailures > 5) {
    alert(`Múltiples fallos: ${logEntry.command}`);
  }
  
  // Alertar si comando sospechoso
  if (SUSPICIOUS_COMMANDS.includes(logEntry.command)) {
    alert(`Comando sospechoso: ${logEntry.command}`);
  }
}
```

## Rate Limiting

### Por Usuario

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requests
  keyGenerator: (req) => req.user.id,
  message: 'Demasiadas peticiones'
});

app.use(limiter);
```

### Por Herramienta

```javascript
const toolLimits = {
  'run_command': { calls: 10, window: 60000 },
  'install_package': { calls: 2, window: 300000 }
};

function checkRateLimit(tool, userId) {
  const limit = toolLimits[tool];
  if (!limit) return true;
  
  const key = `${userId}:${tool}`;
  const count = callCounter.get(key) || 0;
  
  if (count >= limit.calls) {
    return false;
  }
  
  callCounter.set(key, count + 1);
  return true;
}
```

## Validación de Entrada

### Validar Todos los Inputs

```javascript
function validateRequest(request) {
  const schema = {
    jsonrpc: 'string',
    id: 'number|string',
    method: 'string',
    params: 'object'
  };
  
  for (const [key, type] of Object.entries(schema)) {
    if (typeof request[key] !== type.split('|')[0]) {
      throw new Error(`Invalid ${key}`);
    }
  }
}
```

### Sanitizar Argumentos

```javascript
function sanitizeArgs(args) {
  // Remover caracteres peligrosos
  const sanitized = args.map(arg => {
    return arg.replace(/[;&|`$()]/g, '');
  });
  
  return sanitized;
}
```

## Política de Contraseñas

### Para Credenciales Almacenadas

1. Mínimo 32 caracteres
2. Cambiar cada 90 días
3. No reutilizar anteriores
4. Hash con bcrypt (mínimo 12 rounds)

```javascript
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
```

## Incident Response

### Plan de Respuesta

1. Detectar anomalía
2. Aislar servidor
3. Preservar logs
4. Investigar
5. Remediar
6. Documentar
7. Post-mortem

### Isolamiento Rápido

```bash
# Bloquear acceso
sudo iptables -D INPUT -p tcp --dport 3000 -j ACCEPT

# Detener servidor
sudo systemctl stop mcp-server

# Preservar logs
sudo tar czf /archive/mcp-logs-$(date +%s).tar.gz /var/log/mcp/
```

## Compliance

### GDPR

- No procesar datos personales
- Si lo hace: DPIA, Data Protection Officer
- Derecho al olvido

### HIPAA

- Encriptación end-to-end
- Auditoría detallada
- Control de acceso estricto

### SOC 2

- Acceso controlado
- Cambios monitoreados
- Backups regulares
- Disaster recovery

## Checklist de Seguridad Producción

- [ ] Firewall configurado (solo red privada)
- [ ] Autenticación habilitada
- [ ] HTTPS/TLS obligatorio
- [ ] Usuario no-root
- [ ] Límites de recursos
- [ ] Whitelist de comandos
- [ ] Rate limiting habilitado
- [ ] Auditoría centralizada
- [ ] Logs rotativos
- [ ] Alertas configuradas
- [ ] Secrets en variables de entorno
- [ ] Backups regulares
- [ ] Disaster recovery plan
- [ ] Políticas de acceso documentadas
- [ ] Training de seguridad completado

## Recursos

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CIS Benchmarks: https://www.cisecurity.org/
- Node.js Security: https://nodejs.org/en/docs/guides/security/
- Docker Security: https://docs.docker.com/engine/security/

## Soporte Seguridad

Reportar vulnerabilidades a:
```
security@example.com
```

No reportar públicamente hasta que sea patcheado.
Respuesta esperada en 7 días.
Coordinación de disclosure responsable.
