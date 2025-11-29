# Estructura del Proyecto

## Raíz del Repositorio

### Archivos de Configuración
- `package.json` - Dependencias y scripts de npm
- `package-lock.json` - Versiones exactas de dependencias
- `.gitignore` - Archivos ignorados por git

### Servidor Principal
- `src/server.js` - Implementación del servidor MCP (370+ líneas)

### Documentación (Wiki)
- `README.md` - Punto de entrada principal
- `Home.md` - Introducción al proyecto
- `Installation.md` - Guía de instalación
- `Tools.md` - Documentación de 7 herramientas
- `LLM-Integration.md` - 5 métodos de integración con LLM
- `Deployment.md` - 5 opciones de despliegue
- `Examples.md` - 5 casos de uso reales
- `Architecture.md` - Diseño técnico
- `Security.md` - Hardening de seguridad
- `FAQ.md` - Preguntas frecuentes
- `Wiki-Index.md` - Índice completo
- `_Sidebar.md` - Navegación del wiki

### Archivos de Referencia
- `EXAMPLES.md` - Ejemplos JSON-RPC
- `DELIVERY-SUMMARY.md` - Resumen de entrega

## Estadísticas

- Total de archivos: 18
- Líneas de documentación: 4,500+
- Líneas de código: 370+
- Total de tamaño: ~200 KB

## Instrucciones de Uso

### Instalación Local
```bash
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
