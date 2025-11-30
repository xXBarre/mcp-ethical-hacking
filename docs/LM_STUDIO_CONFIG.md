# Configuración de LM Studio para MCP Ethical Hacking

## Opción 1: Conexión vía SSH (Recomendado)

En **LM Studio** → **Settings** → **MCP Servers** → **Add Server**:

```json
{
  "name": "MCP Ethical Hacking",
  "disabled": false,
  "command": "ssh",
  "args": [
    "-i", "/ruta/a/tu/clave/privada",
    "barre@192.168.1.109",
    "cd /home/barre/tools/mcp/mcp-ethical-hacking && npm start"
  ],
  "env": {}
}
```

**Requisitos:**
- SSH server corriendo en Linux (generalmente ya está)
- Clave SSH configurada o usar contraseña

**Para usar contraseña en lugar de clave:** Reemplaza la opción `-i` por `-o PasswordAuthentication=yes`

---

## Opción 2: Usar WSL (Windows Subsystem for Linux)

Si tienes WSL con Node.js instalado:

```json
{
  "name": "MCP Ethical Hacking",
  "disabled": false,
  "command": "wsl",
  "args": [
    "bash",
    "-c",
    "cd /home/barre/tools/mcp/mcp-ethical-hacking && npm start"
  ],
  "env": {}
}
```

---

## Opción 3: HTTP Bridge (SSE)

Si el SSH no funciona, usa el HTTP bridge con SSE:

**En Linux:**
```bash
npm run http
```

**En LM Studio:**
```json
{
  "name": "MCP Ethical Hacking HTTP",
  "disabled": false,
  "command": "node",
  "args": [
    "-e",
    "fetch('http://192.168.1.109:3000/sse').then(r => r.body.getReader().read())"
  ],
  "env": {}
}
```

---

## Verificar que funciona

Después de configurar, en LM Studio deberías ver:
- "MCP Ethical Hacking" conectado
- 7 herramientas disponibles:
  - run_command
  - search_command
  - install_package
  - launch_gui_tool
  - check_gui_tool
  - notion_create_page
  - notion_query_database

---

## Troubleshooting

**Error: "SSH connection refused"**
- Verifica que SSH está corriendo: `sudo systemctl status ssh`
- Verifica la IP: `hostname -I` en Linux

**Error: "Invalid content type"**
- Usa la Opción 1 (SSH) en lugar de HTTP
- HTTP no es compatible con LM Studio MCP

**Error: "npm not found"**
- En Linux: Instala Node.js: `sudo apt install nodejs npm`
- En Windows: Usa WSL en lugar de SSH directo
