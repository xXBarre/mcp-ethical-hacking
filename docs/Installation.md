# Installation

Guía paso a paso para instalar y configurar MCP Ethical Hacking.

## Requisitos del Sistema

- Node.js 18.0.0 o superior
- npm o yarn
- Sistema operativo: Linux, macOS o Windows (con WSL2)
- Acceso a sudo (para instalar paquetes con apt-get)
- Opcional: Docker para ejecución en contenedores

## Verificar Requisitos

Antes de comenzar, verifica que tienes los requisitos instalados:

```bash
node --version   # Debe ser v18.0.0 o superior
npm --version    # Debe ser 8.0.0 o superior
```

## Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/xXBarre/mcp-ethical-hacking.git
cd mcp-ethical-hacking/src
```

## Paso 2: Instalar Dependencias

```bash
npm install
```

Este comando instalará:

- @modelcontextprotocol/sdk - SDK de MCP para Node.js
- @notionhq/client - Cliente oficial de Notion API

El proceso toma normalmente entre 30 segundos y 2 minutos.

## Paso 3: Configurar Variables de Entorno (Opcional)

Si deseas usar la integración con Notion, crea un archivo `.env` en la raíz del proyecto:

```bash
nano .env
```

Agrega la siguiente línea:

```
NOTION_API_KEY=secret_xxxxx
NODE_ENV=production
```

Para obtener tu NOTION_API_KEY:

1. Accede a https://www.notion.so/my-integrations
2. Haz clic en "New integration"
3. Asigna un nombre y selecciona el workspace
4. Haz clic en "Submit"
5. Copia el "Internal Integration Token"
6. Pégalo en tu archivo .env

## Paso 4: Iniciar el Servidor

### Modo Desarrollo

```bash
npm run dev   # desde /src
```

### Modo Producción

```bash
npm start     # desde /src
```

El servidor se iniciará y mostrará:

```
MCP Ethical Hacking server iniciado
```

## Paso 5: Verificar la Instalación

En otra terminal, prueba que el servidor está funcionando:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | npm start
```

Deberías recibir una respuesta JSON similar a:

```json
{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"mcp-ethical-hacking","version":"0.2.0"}}}
```

## Instalación con Docker

Si prefieres usar Docker, puedes construir y ejecutar un contenedor:

### Crear Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache nmap curl git wget bind-tools dnsutils

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production

CMD ["npm", "start"]
```

### Construir y Ejecutar

```bash
docker build -t mcp-ethical-hacking .

docker run -d \
  --name mcp-server \
  -e NOTION_API_KEY=secret_xxxxx \
  -v /tmp:/tmp \
  -m 512m \
  --cpus 1 \
  mcp-ethical-hacking
```

## Instalación en Modo Desarrollo

Para desarrollo local con recargas automáticas, instala nodemon:

```bash
npm install --save-dev nodemon
```

Luego agrega a `src/package.json`:

```json
"scripts": {
  "dev-watch": "nodemon --exec node server.js"
}
```

Ejecuta con:

```bash
npm run dev-watch   # desde /src
```

## Problemas Comunes

### Error: "node: command not found"

Instala Node.js desde https://nodejs.org/

```bash
# macOS con Homebrew
brew install node

# Linux (Ubuntu/Debian)
sudo apt-get install nodejs npm
```

### Error: "NOTION_API_KEY no configurada"

Este es un error informativo, no crítico. Solo afecta a las funciones de Notion:

```bash
export NOTION_API_KEY=tu_token_aqui
npm start
```

### Puerto ocupado

Si el puerto 3000 está ocupado, especifica otro:

```bash
PORT=3001 npm start
```

### Permisos denegados en sudo

Si tienes problemas con sudo al instalar paquetes:

```bash
sudo apt-get update
sudo apt-get install -y build-essential
```

## Verificación de Instalación

Ejecuta el comando de verificación completa:

```bash
npm start
```

Luego en otra terminal:

```bash
# Listar herramientas disponibles
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | npm start

# Buscar comando nmap
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_command","arguments":{"query":"nmap"}}}' | npm start
```

## Pasos Siguientes

Una vez instalado correctamente:

1. Lee la documentación de [Herramientas Disponibles](Tools)
2. Elige tu [Integración con LLM](LLM-Integration)
3. Consulta los [Ejemplos de Uso](Examples)

## Desinstalación

Para desinstalar completamente:

```bash
cd ..
rm -rf mcp-ethical-hacking
```

Para eliminar un contenedor Docker:

```bash
docker stop mcp-server
docker rm mcp-server
docker rmi mcp-ethical-hacking
```
