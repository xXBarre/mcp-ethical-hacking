# LLM Integration

Guías para integrar MCP Ethical Hacking con diferentes plataformas de LLM.

## Visión General

MCP Ethical Hacking puede integrarse con:

1. Claude Desktop
2. VS Code Copilot
3. Open WebUI con Ollama
4. Interfaces CLI personalizadas
5. Servidores web

## Claude Desktop

Claude Desktop es la forma más completa de integrar con Claude.

### Requisitos

- Claude Desktop instalado
- Node.js 18+
- npm

### Pasos de Configuración

1. Copiar la configuración a la carpeta de Claude Desktop

```bash
# En macOS
mkdir -p ~/.config/Claude
cp config.json ~/.config/Claude/claude_desktop_config.json

# En Windows
mkdir %APPDATA%\Claude
copy config.json %APPDATA%\Claude\claude_desktop_config.json

# En Linux
mkdir -p ~/.config/Claude
cp config.json ~/.config/Claude/claude_desktop_config.json
```

2. Crear archivo config.json

```json
{
  "mcpServers": {
    "mcp-ethical-hacking": {
      "command": "node",
      "args": ["/ruta/a/mcp-ethical-hacking/src/server.js"],
      "env": {
        "NOTION_API_KEY": "tu-clave-notion-aqui"
      }
    }
  }
}
```

3. Reiniciar Claude Desktop

4. Verificar que aparezca la herramienta en los ajustes de Claude

### Uso en Claude

Una vez configurado, puedes usar el servidor con prompts como:

```
Ejecuta un escaneo nmap en 127.0.0.1 para identificar puertos abiertos.
Guarda los resultados en Notion en la base de datos de auditorías.
```

Claude tendrá acceso automático a todas las herramientas sin necesidad de configuración adicional.

## VS Code Copilot

Integración con GitHub Copilot en VS Code.

### Requisitos

- VS Code con GitHub Copilot instalado
- Node.js 18+
- npm

### Pasos de Configuración

1. Crear archivo .vscode/settings.json

```json
{
  "github.copilot.advanced": {
    "codeGenerationTasks": true,
    "codeAnalysis": true
  },
  "copilot.serverUrl": "http://localhost:3000",
  "copilot.enable": {
    "plainText": true,
    "markdown": true,
    "yaml": true
  }
}
```

2. Iniciar servidor MCP en terminal

```bash
npm start
```

3. En otra terminal, iniciar proxy para VS Code

```bash
node proxy.js
```

### Uso en VS Code

En el editor, escribir comentarios para que Copilot genere comandos:

```javascript
// Escanear puertos en 192.168.1.1 con nmap
// Documento los hallazgos en Notion

// Copilot sugerirá:
const scanResult = await runCommand('nmap', ['-sV', '192.168.1.1']);
const notion = await createNotion('vuln_db', 'Scan Results', scanResult);
```

## Open WebUI con Ollama

Ejecutar localmente con modelos open source.

### Requisitos

- Docker
- Ollama
- Open WebUI
- Node.js 18+

### Pasos de Configuración

1. Iniciar Ollama

```bash
ollama serve
```

2. En otra terminal, descargar modelo (e.j. Llama 2)

```bash
ollama pull llama2
```

3. Iniciar Open WebUI en Docker

```bash
docker run -d -p 3000:8080 \
  -e OLLAMA_API_BASE_URL=http://localhost:11434/api \
  --name open-webui \
  ghcr.io/open-webui/open-webui:latest
```

4. Acceder a http://localhost:3000

5. Agregar servidor MCP en configuración de Open WebUI

```
Settings > Models > Add Custom Model
URL: http://localhost:3001 (puerto MCP)
API Key: (opcional)
```

### Uso

Usar la interfaz web de Open WebUI para consultar con acceso a herramientas MCP.

## CLI personalizado

Crear script CLI para ejecutar comandos contra el servidor MCP.

### Requisitos

- Node.js 18+
- npm
- curl

### Script CLI (cli.js)

```javascript
#!/usr/bin/env node

const readline = require('readline');
const { exec } = require('child_process');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Uso: ./cli.js <comando> [argumentos]');
  console.log('Comandos: run_command, install_package, search_command, ...');
  process.exit(1);
}

const command = args[0];
const restArgs = args.slice(1);

const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: command,
    arguments: parseArguments(restArgs)
  }
};

function parseArguments(args) {
  const result = {};
  let currentKey = null;

  for (const arg of args) {
    if (arg.startsWith('--')) {
      currentKey = arg.slice(2);
      result[currentKey] = true;
    } else if (arg.startsWith('-')) {
      currentKey = arg.slice(1);
      result[currentKey] = true;
    } else {
      if (currentKey) {
        result[currentKey] = arg;
      } else {
        if (!result.positional) result.positional = [];
        result.positional.push(arg);
      }
    }
  }

  return result;
}

// Enviar al servidor MCP
const json = JSON.stringify(request) + '\n';

exec('npm start', (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
  console.log(stdout);
});
```

### Uso CLI

```bash
chmod +x cli.js

./cli.js run_command --command nmap --args "-sV" "127.0.0.1"

./cli.js search_command --query nmap

./cli.js install_package --package curl
```

## Servidor HTTP/SSE/WS integrado

El servidor unificado (`src/server.js`) expone REST + SSE + WebSocket sin procesos adicionales.

### Iniciar

```bash
cd mcp-ethical-hacking/src
npm start   # o npm run dev
```

### Endpoints

- `GET /`           → Info del servidor y herramientas
- `GET /health`     → Estado y uptime
- `GET /tools`      → Lista de herramientas
- `POST /call`      → Ejecutar herramienta (JSON-RPC compatible)
- `POST /execute`   → Alias de `/call`
- `GET /sse`        → Stream SSE (soporta JSONL si se pide `format=jsonl` o header `application/jsonl+model-context-stream`)
- `WS /ws`          → WebSocket MCP

### Ejemplo REST

```bash
curl -X POST http://localhost:3000/call \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "run_command",
      "arguments": { "command": "whoami" }
    },
    "id": 1,
    "jsonrpc": "2.0"
  }'
```

### Ejemplo WebSocket

Conectar a `ws://localhost:3000/ws` y enviar:

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"run_command","arguments":{"command":"uname","args":["-a"]}}}
```

### Ejemplo SSE / JSONL

- SSE: `curl -N http://localhost:3000/sse`
- JSONL stream: `curl -N -H "Accept: application/jsonl+model-context-stream" http://localhost:3000/sse?format=jsonl`

## Configuración de Variables de Entorno

### Para Notion

Obtener API Key de Notion:

1. Ir a https://www.notion.so/my-integrations
2. Crear nueva integración
3. Copiar API Key
4. Configurar variable de entorno

```bash
export NOTION_API_KEY="secret_xxxxxxxxxxxxx"
```

### Para Seguridad

Configurar restricciones de comandos:

```bash
export ALLOWED_COMMANDS="nmap,curl,dig,strings,file"
```

## Solución de Problemas

### Claude Desktop no ve las herramientas

1. Verificar que el puerto está disponible
2. Revisar logs de Claude Desktop
3. Reiniciar Claude Desktop
4. Verificar archivo config.json

### Timeout en comandos largos

Aumentar timeoutMs:

```json
{
  "timeoutMs": 300000
}
```

### Herramientas GUI no se lanzan

1. Verificar que la herramienta está instalada: check_gui_tool
2. Verificar permisos: ls -la /opt/
3. Verificar pantalla: export DISPLAY=:0
4. Ejecutar con permisos: sudo npm start

### Errores de Notion

1. Verificar API Key: echo $NOTION_API_KEY
2. Verificar permisos en base de datos
3. Verificar formato de parent_id
4. Revisar logs del servidor

## Casos de Uso por Plataforma

### Claude Desktop

- Mejor para: Análisis profundos, reportes detallados
- Ventaja: Mejor contexto y entendimiento de LLM
- Uso: Auditorías completas con documentación automática

### VS Code Copilot

- Mejor para: Desarrollo de scripts
- Ventaja: Integración directa en editor
- Uso: Generar payloads, scripts de explotación

### Open WebUI

- Mejor para: Deployments locales sin cloud
- Ventaja: Control total de datos
- Uso: Laboratorios de seguridad privados

### CLI

- Mejor para: Automatización
- Ventaja: Fácil de integrar en scripts
- Uso: Escaneos programados

### HTTP

- Mejor para: Servicios y APIs
- Ventaja: Acceso remoto
- Uso: Orquestación distribuida
