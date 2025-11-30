# Architecture

Descripción técnica de la arquitectura y diseño del servidor MCP.

## Visión General

El servidor MCP Ethical Hacking implementa el protocolo Model Context Protocol utilizando JSON-RPC sobre stdin/stdout.

### Componentes Principales

```
LLM (Claude, etc.)
        |
        | JSON-RPC requests
        v
MCP Server (Node.js)
        |
        +--- Command Execution Engine
        +--- Tool Registry
        +--- Notion Integration
        +--- GUI Tool Launcher
        +--- Request Router
        |
        v
System Resources
        |
        +--- Shell Commands
        +--- GUI Applications
        +--- Notion API
```

## Flujo de Solicitudes

### 1. Inicialización

```
LLM envía:
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {}
}

Servidor responde:
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    },
    "serverInfo": {
      "name": "mcp-ethical-hacking",
      "version": "0.2.0"
    }
  }
}
```

### 2. Listar Herramientas

```
LLM envía:
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}

Servidor responde:
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "run_command",
        "description": "Ejecutar comando",
        "inputSchema": { ... }
      },
      ...
    ]
  }
}
```

### 3. Ejecutar Herramienta

```
LLM envía:
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "run_command",
    "arguments": {
      "command": "nmap",
      "args": ["-sV", "target"]
    }
  }
}

Servidor responde:
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Nmap output..."
      }
    ]
  }
}
```

## Implementación del Servidor

### Estructura de Archivos

```
mcp-ethical-hacking/
├── docs/                 # Toda la documentación (.md)
└── src/
    ├── package.json      # Dependencias y scripts
    ├── package-lock.json # Versionado de deps
    ├── server.js         # Servidor MCP unificado
    └── node_modules/     # (tras npm install)
```

### Módulos Principales

#### 1. Inicialización (server.js)

```javascript
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  processRequest(JSON.parse(line));
});
```

#### 2. Router de Requests

```javascript
async function processRequest(request) {
  const { method, params, id } = request;
  
  switch (method) {
    case 'initialize':
      return handleInitialize(id);
    case 'tools/list':
      return handleToolsList(id);
    case 'tools/call':
      return handleToolCall(params, id);
    default:
      return sendError(id, 'Method not found');
  }
}
```

#### 3. Ejecución de Comandos

```javascript
function runShell(command, args, opts) {
  return new Promise((resolve, reject) => {
    const childProcess = execFile(command, args, {
      timeout: opts.timeoutMs || 60000,
      maxBuffer: 10 * 1024 * 1024,
      cwd: opts.cwd || process.cwd()
    }, (error, stdout, stderr) => {
      if (error && !error.killed) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}
```

#### 4. Herramientas GUI

```javascript
function launchGuiTool(tool, config) {
  const toolPaths = {
    burpsuite: '/opt/BurpSuitePro/burpsuite.jar',
    zap: '/opt/ZAP/zap.sh',
    wireshark: 'wireshark',
    ghidra: '/opt/ghidra/ghidra_gui.sh',
    volatility: 'volatility3'
  };
  
  const childProcess = spawn('java', ['-jar', toolPaths[tool]], {
    detached: true,
    stdio: 'ignore'
  });
  
  return childProcess.pid;
}
```

#### 5. Integración Notion

```javascript
const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

async function createNotion(parentId, title, content) {
  const page = await notion.pages.create({
    parent: { database_id: parentId },
    properties: {
      title: [{ text: { content: title } }]
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ text: { content } }]
        }
      }
    ]
  });
  
  return page;
}
```

## Diagrama de Arquitectura Detallada

```
stdin/stdout (JSON-RPC)
    |
    v
readline Interface
    |
    v
Request Parser
    |
    +---> Validate Schema
    |     |
    |     v
    |     dispatch to handler
    |
    v
Handler Router
    |
    +---> initialize
    |
    +---> tools/list
    |     |
    |     v
    |     Generate tool schemas
    |
    +---> tools/call
          |
          +---> run_command
          |     |
          |     v
          |     execFile()
          |
          +---> install_package
          |     |
          |     v
          |     execFile(apt-get)
          |
          +---> search_command
          |     |
          |     v
          |     which + apt-cache
          |
          +---> launch_gui_tool
          |     |
          |     v
          |     spawn() + detached
          |
          +---> check_gui_tool
          |     |
          |     v
          |     execFile(which)
          |
          +---> notion_create_page
          |     |
          |     v
          |     notion.pages.create()
          |
          +---> notion_query_database
                |
                v
                notion.databases.query()
    
    v
Response Formatter
    |
    v
JSON Serialization
    |
    v
stdout (JSON-RPC Response)
```

## Gestión de Errores

### Niveles de Error

1. Validation Error (400)
   - Schema inválido
   - Parámetros faltantes

2. Execution Error (500)
   - Comando no encontrado
   - Timeout
   - Permiso denegado

3. API Error (500)
   - Notion API error
   - Network error

### Formato de Error

```javascript
function sendError(id, message, code) {
  const response = {
    jsonrpc: '2.0',
    id,
    error: {
      code: code || -32603,
      message
    }
  };
  console.log(JSON.stringify(response));
}
```

## Seguridad

### Princípios de Seguridad

1. Validación de entrada
2. Aislamiento de procesos
3. Límites de recursos
4. Auditoría de acciones
5. Aislamiento de secretos

### Implementación de Validación

```javascript
function validateToolCall(params) {
  if (!params.name) {
    throw new Error('Tool name required');
  }
  
  if (!AVAILABLE_TOOLS[params.name]) {
    throw new Error('Unknown tool');
  }
  
  const schema = AVAILABLE_TOOLS[params.name].inputSchema;
  
  // Validar contra schema
  validateAgainstSchema(params.arguments, schema);
}
```

### Límites de Recursos

```javascript
const LIMITS = {
  MAX_BUFFER: 10 * 1024 * 1024,      // 10MB
  MAX_TIMEOUT: 300000,                // 5min
  MAX_ARGS: 50,
  MAX_OUTPUT: 1024 * 1024             // 1MB
};
```

### Variables de Entorno Seguras

```javascript
// Secretos nunca se loguean
const apiKey = process.env.NOTION_API_KEY;
if (!apiKey) {
  console.error('ERROR: NOTION_API_KEY not set');
  process.exit(1);
}

// Usar sin exponerlos
const notion = new Client({ auth: apiKey });
```

## Performance

### Optimizaciones

1. **Command Execution**: execFile vs spawn
   - execFile: Para comandos simples (más rápido)
   - spawn: Para procesos largos (menos memoria)

2. **Buffer Management**: Limitar salida
   - maxBuffer: 10MB default
   - Stream large outputs

3. **Timeouts**: Prevenir cuelgues
   - Default: 60 segundos
   - Máximo: 300 segundos

4. **Concurrency**: Procesar múltiples requests
   - Async/await no bloqueante
   - No limitar conexiones

### Benchmark Típico

```
initialize:           1ms
tools/list:          5-10ms
run_command:         Variable (según comando)
  - echo:            10ms
  - nmap:            30-120s
  - curl:            100-500ms
```

## Escalabilidad

### Horizontal Scaling

Para múltiples servidores:

```
Load Balancer
    |
    +---> MCP Server 1
    +---> MCP Server 2
    +---> MCP Server 3
```

### Stateless Design

El servidor es stateless:
- Sin conexiones persistentes
- Sin almacenamiento local
- Sin dependencias entre requests

Permite scaling horizontal sin sincronización.

## Monitoreo

### Métricas Clave

1. Request/Response Times
2. Error Rates
3. Tool Usage Statistics
4. Resource Utilization
5. Concurrent Connections

### Instrumentación

```javascript
const metrics = {
  requestCount: 0,
  errorCount: 0,
  avgResponseTime: 0,
  toolUsage: {}
};

function recordMetric(toolName, duration, success) {
  metrics.requestCount++;
  metrics.toolUsage[toolName] = (metrics.toolUsage[toolName] || 0) + 1;
  if (!success) metrics.errorCount++;
}
```

## Extensibilidad

### Agregar Nueva Herramienta

1. Crear handler en server.js:

```javascript
async function handleNewTool(args) {
  // Implementación
}
```

2. Registrar en AVAILABLE_TOOLS:

```javascript
const AVAILABLE_TOOLS = {
  new_tool: {
    description: "...",
    inputSchema: { ... }
  }
};
```

3. Agregar caso en processRequest:

```javascript
case 'new_tool':
  return handleNewTool(params.arguments);
```

## Compatibilidad

### Versiones Soportadas

- Node.js: 18.x, 20.x, 22.x (LTS)
- MCP SDK: 0.7.0
- Notion SDK: 3.0.0

### Cambios de Versión

El servidor mantiene compatibilidad con versiones anteriores de MCP.

## Roadmap

### Próximas Características

1. Autenticación y autorización
2. Rate limiting
3. Request queuing
4. WebSocket support
5. Plugin system
6. Better error messages
7. Prometheus metrics
8. GraphQL support

## Referencias

- MCP Protocol: https://modelcontextprotocol.io/
- Node.js Child Process: https://nodejs.org/api/child_process.html
- Notion SDK: https://github.com/makenotion/notion-sdk-js
