# Ejemplos de Uso - MCP Ethical Hacking

## 1. Ejecutar comando nmap

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "run_command",
    "arguments": {
      "command": "nmap",
      "args": ["-sV", "-p", "1-1000", "localhost"],
      "timeoutMs": 60000
    }
  }
}' | npm start
```

## 2. Buscar herramienta instalada

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "search_command",
    "arguments": {
      "query": "nmap",
      "limit": 5
    }
  }
}' | npm start
```

## 3. Instalar paquete

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "install_package",
    "arguments": {
      "package": "curl"
    }
  }
}' | npm start
```

## 4. Verificar si Burp Suite está disponible

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "check_gui_tool",
    "arguments": {
      "tool": "burpsuite"
    }
  }
}' | npm start
```

## 5. Lanzar OWASP ZAP

```bash
echo '{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "launch_gui_tool",
    "arguments": {
      "tool": "zap",
      "args": [],
      "config": {
        "port": 8090
      }
    }
  }
}' | npm start
```

## 6. Crear página en Notion (requiere NOTION_API_KEY)

```bash
NOTION_API_KEY="secret_..." npm start <<EOF
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "notion_create_page",
    "arguments": {
      "parent_id": "abc123xyz789",
      "title": "Auditoría de Seguridad",
      "content": "# Hallazgos\n\n## XSS en /contact\nSeveridad: Alta"
    }
  }
}
EOF
```

## 7. Consultar base de datos en Notion

```bash
NOTION_API_KEY="secret_..." npm start <<EOF
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "notion_query_database",
    "arguments": {
      "database_id": "abc123xyz789"
    }
  }
}
EOF
```

---

## Integración con Claude Desktop

1. Guardar el servidor en: `/home/usuario/mcp-ethical-hacking`

2. Configurar `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ethical-hacking": {
      "command": "node",
      "args": ["/home/usuario/mcp-ethical-hacking/src/server.js"],
      "env": {
        "NOTION_API_KEY": "secret_tu_token"
      }
    }
  }
}
```

3. Reiniciar Claude Desktop

4. Usar en conversaciones:
- "Realiza un nmap a localhost"
- "¿Está instalado Burp Suite?"
- "Instala curl"
- "Lanza Wireshark"

---

## Integración con VS Code

1. Instalar extensión de GitHub Copilot

2. Agregar en `.vscode/settings.json`:

```json
{
  "modelContextProtocol.servers": {
    "ethical-hacking": {
      "command": "node",
      "args": ["/ruta/a/mcp-ethical-hacking/src/server.js"]
    }
  }
}
```

3. Usar en Copilot Chat

---

## Docker Compose

```yaml
version: '3.8'

services:
  mcp-server:
    build: .
    environment:
      - NODE_ENV=production
      - NOTION_API_KEY=${NOTION_API_KEY}
    volumes:
      - /tmp:/tmp
```

```bash
docker-compose up -d
```

---

## Casos de Uso Avanzados

### Auditoría Web Automatizada

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "run_command",
    "arguments": {
      "command": "bash",
      "args": ["-c", "nmap -sV target.com && curl -I https://target.com && whois target.com"]
    }
  }
}
```

### Pipeline de Reconocimiento

1. `search_command` para verificar herramientas disponibles
2. `install_package` para instalar lo que falte
3. `run_command` para ejecutar escaneos
4. `launch_gui_tool` para análisis interactivo
5. `notion_create_page` para documentar hallazgos

