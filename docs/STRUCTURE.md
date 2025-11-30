# Estructura del Proyecto

## Raíz del Repositorio

### Carpeta `src/`
- `package.json` / `package-lock.json` - Dependencias y scripts de npm
- `server.js` - Implementación del servidor MCP (stdin/stdout + HTTP/SSE + WS)
- `node_modules/` (tras `npm install` dentro de `src/`)

### Documentación
- Todos los `.md` viven en `docs/` (README, Installation, Architecture, Tools, Examples, FAQ, etc.)

## Estadísticas

- Líneas de documentación: 4,500+
- Líneas de código: 370+

## Instrucciones de Uso

### Instalación Local
```bash
cd src
npm install
npm start
```

### Despliegue con Docker
```bash
docker build -t mcp-ethical-hacking .
docker run -e NOTION_API_KEY=tu-clave mcp-ethical-hacking
```

### Lectura de Documentación
- Comenzar con `README.md`
- Seguir con `Installation.md`
- Explorar `Tools.md` para herramientas disponibles
- Ver `Examples.md` para casos de uso
