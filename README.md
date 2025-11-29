# MCP Ethical Hacking

Un servidor Model Context Protocol (MCP) que permite a LLMs como Claude ejecutar comandos, instalar herramientas, lanzar aplicaciones GUI y documentar auditorías en Notion de forma automática.

## Descripción del Proyecto

**MCP Ethical Hacking** es una plataforma que integra herramientas de seguridad informática con LLMs, permitiendo:

- Ejecutar reconocimientos de red
- Realizar análisis de seguridad web
- Analizar binarios y malware
- Realizar investigaciones forenses
- Automatizar workflows de auditoría
- Documentar hallazgos en Notion

El servidor implementa el protocolo JSON-RPC sobre stdin/stdout, lo que permite integración nativa con:
- Claude Desktop
- VS Code Copilot
- Open WebUI (Ollama)
- Interfaces CLI personalizadas
- Servidores HTTP REST

## Características Principales

### 7 Herramientas Disponibles

| Herramienta | Descripción |
|-------------|-------------|
| **run_command** | Ejecutar cualquier comando shell arbitrario |
| **search_command** | Buscar comandos y paquetes disponibles |
| **install_package** | Instalar paquetes del sistema (apt-get) |
| **launch_gui_tool** | Lanzar aplicaciones GUI (Burp Suite, OWASP ZAP, Wireshark, Ghidra, Volatility) |
| **check_gui_tool** | Verificar disponibilidad de herramientas |
| **notion_create_page** | Crear páginas en Notion con resultados |
| **notion_query_database** | Consultar bases de datos de Notion |

### 5 Métodos de Integración

1. **Claude Desktop** - Integración nativa MCP con soporte completo
2. **VS Code Copilot** - GitHub Copilot integrado en el editor
3. **Open WebUI** - Interfaz web auto-alojada con modelos locales
4. **CLI Personalizado** - Scripts y herramientas de línea de comandos
5. **Servidor HTTP** - API REST para integraciones remotas

### 5 Opciones de Despliegue

1. **Local** - Desarrollo en máquina local
2. **Docker** - Contenedor aislado y reproducible
3. **Kubernetes** - Orquestación a escala
4. **AWS Lambda** - Ejecución serverless
5. **Google Cloud Run** - Serverless gestionado

## Casos de Uso

### 1. Reconocimiento de Red
Ejecutar escaneos nmap, enumerar servicios, identificar vulnerabilidades conocidas y documentar hallazgos automáticamente en Notion.

**Documentación**: [Reconocimiento de Red](Examples#caso-1-reconocimiento-de-red)

### 2. Testing de Aplicaciones Web
Analizar aplicaciones web, lanzar Burp Suite para análisis profundo, identificar XSS, SQL Injection, CSRF y otros vulnerabilidades.

**Documentación**: [Testing Web](Examples#caso-2-testing-web)

### 3. Análisis de Malware
Analizar binarios sospechosos, extraer strings, usar Ghidra para análisis estático y identificar comportamientos maliciosos.

**Documentación**: [Análisis Binario](Examples#caso-3-análisis-binario)

### 4. Investigación Forense
Analizar volcados de memoria con Volatility, investigar procesos sospechosos y recopilar evidencia.

**Documentación**: [Auditoría Forense](Examples#caso-4-auditoría-forense)

### 5. Automatización de Auditorías
Orquestar pipelines completos de auditoría con múltiples pasos, agregación de resultados y reportes automáticos.

**Documentación**: [Pipeline Automático](Examples#caso-5-pipeline-automático)

## Comenzar Rápidamente

### Instalación (2 minutos)

```bash
# Clonar repositorio
git clone https://github.com/xXBarre/mcp-ethical-hacking.git
cd mcp-ethical-hacking

# Instalar dependencias
npm install

# Configurar API Key de Notion (opcional)
export NOTION_API_KEY="tu-clave-aqui"

# Iniciar servidor
npm start
```

**Documentación completa**: [Guía de Instalación](Installation)

### Primeros Pasos

1. **Para entender el proyecto**: [Inicio](Home)
2. **Para instalar localmente**: [Instalación](Installation)
3. **Para ver todas las herramientas**: [Herramientas](Tools)
4. **Para integrar con tu LLM**: [Integraciones](LLM-Integration)
5. **Para ver ejemplos reales**: [Ejemplos](Examples)

## Documentación Completa

### Guías de Referencia

- **[Home](Home)** - Introducción y descripción del proyecto
- **[Installation](Installation)** - Guía paso a paso de instalación
- **[Tools](Tools)** - Documentación completa de las 7 herramientas con ejemplos JSON-RPC
- **[Architecture](Architecture)** - Diseño técnico, flujos y componentes internos

### Integración y Despliegue

- **[LLM-Integration](LLM-Integration)** - Cómo integrar con Claude Desktop, VS Code, Ollama, CLI y HTTP
- **[Deployment](Deployment)** - Despliegue en Local, Docker, Kubernetes, AWS Lambda, Google Cloud Run

### Aprendizaje y Soporte

- **[Examples](Examples)** - 5 casos de uso reales con workflows completos
- **[Security](Security)** - Guía de hardening y mejores prácticas de seguridad
- **[FAQ](FAQ)** - Preguntas frecuentes y solución de problemas
- **[Architecture](Architecture)** - Detalles técnicos de la implementación

### Referencias

- **[Wiki-Index](Wiki-Index)** - Índice completo con todos los enlaces
- **[_Sidebar](_Sidebar)** - Navegación estructurada del wiki

## Arquitectura Técnica

```
LLM (Claude, etc.)
        ↓ JSON-RPC
    MCP Server
        ↓
    ├─ Command Execution (run_command)
    ├─ Package Management (install_package)
    ├─ Tool Launcher (launch_gui_tool)
    ├─ Notion Integration (notion_create_page)
    └─ Database Queries (notion_query_database)
        ↓
    System Resources
        ├─ Shell Commands (nmap, curl, etc.)
        ├─ GUI Tools (Burp, ZAP, Wireshark, Ghidra, Volatility)
        └─ Notion API
```

**Documentación técnica completa**: [Architecture](Architecture)

## Ejemplos de Uso

### Ejemplo 1: Escaneo de Puertos

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "run_command",
    "arguments": {
      "command": "nmap",
      "args": ["-sV", "-p", "1-1000", "example.com"],
      "timeoutMs": 120000
    }
  }
}
```

### Ejemplo 2: Instalar Herramientas

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "install_package",
    "arguments": {
      "package": "nmap"
    }
  }
}
```

### Ejemplo 3: Lanzar Burp Suite

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "launch_gui_tool",
    "arguments": {
      "tool": "burpsuite",
      "config": {
        "project": "/tmp/audit.burp"
      }
    }
  }
}
```

### Ejemplo 4: Crear Reporte en Notion

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "notion_create_page",
    "arguments": {
      "parent_id": "abc123xyz",
      "title": "Auditoría - example.com - 2025-01-15",
      "content": "# Hallazgos\n\n## XSS en formulario\n- Severidad: Alta"
    }
  }
}
```

**Más ejemplos**: [EXAMPLES.md](EXAMPLES.md) y [Examples](Examples)

## Requisitos

- **Node.js**: 18.x LTS o superior
- **npm**: 8.x o superior
- **Dependencias**:
  - `@modelcontextprotocol/sdk` (0.7.0)
  - `@notionhq/client` (3.0.0)

## Configuración

### Variables de Entorno

```bash
# API Key de Notion (requerido para integración Notion)
export NOTION_API_KEY="secret_xxxxxxxxxxxxx"

# Modo de desarrollo (opcional)
export NODE_ENV="development"
```

**Documentación de configuración**: [Installation](Installation#configuración)

## Seguridad

⚠️ **Importante**: Este servidor ejecuta comandos arbitrarios. Solo usar en entornos seguros.

Características de seguridad incluidas:
- Control de acceso
- Restricción de comandos
- Aislamiento de procesos
- Auditoría de acciones
- Encriptación TLS

**Guía completa de seguridad**: [Security](Security)

## Estadísticas del Proyecto

- **Líneas de código**: 370+
- **Líneas de documentación**: 4,500+
- **Páginas wiki**: 12
- **Herramientas**: 7
- **Integraciones**: 5
- **Despliegues**: 5
- **Casos de uso**: 5
- **Ejemplos**: 50+
- **Plantillas**: 200+

## Licencia

MIT License - Ver [LICENSE](LICENSE) para detalles

## Contribuciones

¿Quieres contribuir? Ver [CONTRIBUTING.md](CONTRIBUTING.md)

## Estado del Proyecto

- **Versión**: 0.2.0
- **Status**: Production Ready
- **Última actualización**: Noviembre 29, 2025

**Estado completo**: [PROJECT_STATUS.md](PROJECT_STATUS.md)

## Enlaces Útiles

- **Repositorio**: https://github.com/xXBarre/mcp-ethical-hacking
- **Especificación MCP**: https://modelcontextprotocol.io/
- **Documentación Node.js**: https://nodejs.org/docs/
- **API de Notion**: https://developers.notion.com/

## Soporte

- **Documentación**: Ver [Wiki completa](Wiki-Index)
- **Ejemplos**: [Casos de uso reales](Examples)
- **Problemas**: Abrir [GitHub Issues](https://github.com/xXBarre/mcp-ethical-hacking/issues)
- **Preguntas**: Ver [FAQ](FAQ)

---

**Comienza ahora**: [Guía de Instalación](Installation)

**¿Necesitas ayuda?**: Consulta la [Documentación Completa](Wiki-Index)
