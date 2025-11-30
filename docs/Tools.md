# Tools

Documentación completa de todas las herramientas disponibles en MCP Ethical Hacking.

## Resumen de Herramientas

El servidor proporciona 7 herramientas principales:

1. run_command - Ejecutar comandos
2. search_command - Buscar binarios
3. install_package - Instalar paquetes
4. launch_gui_tool - Lanzar herramientas GUI
5. check_gui_tool - Verificar herramientas disponibles
6. notion_create_page - Crear en Notion
7. notion_query_database - Consultar Notion

## run_command

Ejecuta cualquier comando o binario disponible en el sistema sin restricciones.

### Parámetros

- command (string, requerido): Nombre del binario a ejecutar
- args (array): Argumentos para el comando
- cwd (string): Directorio de trabajo
- timeoutMs (integer): Timeout en milisegundos (default: 60000, max: 300000)

### Ejemplo: Ejecutar nmap

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "run_command",
    "arguments": {
      "command": "nmap",
      "args": ["-sV", "-p", "1-1000", "127.0.0.1"],
      "timeoutMs": 120000
    }
  }
}
```

### Ejemplo: Ejecutar script bash

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "run_command",
    "arguments": {
      "command": "bash",
      "args": ["-c", "whoami && pwd && ls -la"],
      "timeoutMs": 30000
    }
  }
}
```

### Salida

La herramienta devuelve:

```json
{
  "content": [
    {"type": "text", "text": "stdout content here"},
    {"type": "text", "text": "[stderr]\nstderr content here"}
  ]
}
```

### Casos de Uso

- Ejecutar herramientas de reconocimiento (nmap, dig, whois)
- Ejecutar análisis estáticos (file, strings, hexdump)
- Ejecutar scripts personalizados
- Consultar servicios del sistema

## search_command

Busca comandos instalados en el sistema y paquetes disponibles en apt-cache.

### Parámetros

- query (string, requerido): Nombre del comando o palabra clave
- limit (integer): Máximo de resultados (default: 10, max: 20)

### Ejemplo: Buscar nmap

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "search_command",
    "arguments": {
      "query": "nmap",
      "limit": 5
    }
  }
}
```

### Salida

```
which: /usr/bin/nmap

apt-cache:
nmap - The Network Mapper. Network exploration tool and security scanner.
zenmap - graphical network scanner
```

### Casos de Uso

- Verificar si una herramienta está instalada
- Encontrar alternativas disponibles
- Explorar paquetes relacionados

## install_package

Instala paquetes del sistema usando apt-get.

### Parámetros

- package (string, requerido): Nombre del paquete apt
- extraArgs (array): Argumentos adicionales para apt-get

### Ejemplo: Instalar curl

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "install_package",
    "arguments": {
      "package": "curl"
    }
  }
}
```

### Ejemplo: Instalar múltiples paquetes

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "install_package",
    "arguments": {
      "package": "build-essential",
      "extraArgs": ["git", "wget"]
    }
  }
}
```

### Advertencia de Seguridad

Esta herramienta ejecuta apt-get install con privilegios de sudo. Solo úsala en entornos controlados.

### Casos de Uso

- Instalar herramientas de reconocimiento (nmap, curl, dig)
- Instalar herramientas de análisis (strings, binutils, jq)
- Instalar dependencias necesarias

## launch_gui_tool

Lanza herramientas con interfaz gráfica en segundo plano. El LLM recibe el PID y puede controlarlo.

### Herramientas Soportadas

- burpsuite: Burp Suite Community Edition
- zap: OWASP ZAP
- wireshark: Wireshark (analizador de paquetes)
- ghidra: Ghidra (análisis binario)
- volatility: Volatility (análisis de volcados de memoria)
- custom: Cualquier comando personalizado

### Parámetros

- tool (string, requerido): Herramienta a lanzar
- args (array): Argumentos para la herramienta
- config (object): Configuración específica

### Ejemplo: Lanzar Burp Suite

```json
{
  "jsonrpc": "2.0",
  "id": 6,
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

### Ejemplo: Lanzar OWASP ZAP en puerto específico

```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "launch_gui_tool",
    "arguments": {
      "tool": "zap",
      "config": {
        "port": 8090
      }
    }
  }
}
```

### Ejemplo: Lanzar Wireshark

```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "tools/call",
  "params": {
    "name": "launch_gui_tool",
    "arguments": {
      "tool": "wireshark"
    }
  }
}
```

### Salida

```
Herramienta 'burpsuite' lanzada con PID 12345

Comandos útiles:
- Para verificar: ps aux | grep 12345
- Para detener: kill 12345
```

### Casos de Uso

- Lanzar Burp Suite para análisis web interactivo
- Lanzar OWASP ZAP para escaneo automatizado
- Capturar tráfico con Wireshark
- Análisis binario con Ghidra
- Análisis forense con Volatility

## check_gui_tool

Verifica si una herramienta GUI está disponible en el sistema.

### Parámetros

- tool (string, requerido): Nombre de la herramienta

### Ejemplo: Verificar Burp Suite

```json
{
  "jsonrpc": "2.0",
  "id": 9,
  "method": "tools/call",
  "params": {
    "name": "check_gui_tool",
    "arguments": {
      "tool": "burpsuite"
    }
  }
}
```

### Salida si está instalada

```
Burp Suite está en: /opt/BurpSuitePro/burpsuite.jar
```

### Salida si NO está instalada

```
burpsuite no encontrado.

Para instalarlo, usa: apt-get install burpsuite-community
```

### Casos de Uso

- Verificar disponibilidad antes de lanzar
- Ofrecer opciones de instalación automática
- Validar entorno antes de análisis

## notion_create_page

Crea una página en Notion con resultados de auditoría. Requiere NOTION_API_KEY configurada.

### Parámetros

- parent_id (string, requerido): ID de la base de datos o página padre
- title (string, requerido): Título de la página
- content (string): Contenido en markdown
- properties (object): Propiedades adicionales de la base de datos

### Ejemplo: Crear reporte de vulnerabilidades

```json
{
  "jsonrpc": "2.0",
  "id": 10,
  "method": "tools/call",
  "params": {
    "name": "notion_create_page",
    "arguments": {
      "parent_id": "abc123xyz789",
      "title": "Auditoria - example.com - 2025-01-15",
      "content": "# Hallazgos\n\n## XSS en formulario\n- Severidad: Alta\n- Ubicación: /contact.php\n- CVSS: 7.1",
      "properties": {
        "Status": "In Progress",
        "Priority": "High",
        "Target": "example.com"
      }
    }
  }
}
```

### Salida

```
Página creada
URL: https://notion.so/page-abc123xyz789
ID: abc123xyz789
```

### Casos de Uso

- Documentar hallazgos de auditoría
- Crear reportes automáticos
- Registrar vulnerabilidades encontradas
- Compartir resultados con el equipo

## notion_query_database

Consulta una base de datos en Notion. Requiere NOTION_API_KEY configurada.

### Parámetros

- database_id (string, requerido): ID de la base de datos
- filter (object): Filtro opcional para los resultados

### Ejemplo: Obtener todas las auditorías completadas

```json
{
  "jsonrpc": "2.0",
  "id": 11,
  "method": "tools/call",
  "params": {
    "name": "notion_query_database",
    "arguments": {
      "database_id": "abc123xyz789",
      "filter": {
        "property": "Status",
        "select": {
          "equals": "Done"
        }
      }
    }
  }
}
```

### Ejemplo: Obtener auditorías de alta prioridad

```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "method": "tools/call",
  "params": {
    "name": "notion_query_database",
    "arguments": {
      "database_id": "abc123xyz789",
      "filter": {
        "property": "Priority",
        "select": {
          "equals": "High"
        }
      }
    }
  }
}
```

### Salida

```
3 registros:

[
  {
    "id": "page-123",
    "title": "Auditoria - api.example.com",
    "properties": {
      "Status": "Done",
      "Priority": "High"
    }
  },
  ...
]
```

### Casos de Uso

- Recuperar auditorías anteriores
- Generar reportes históricos
- Validar estado de vulnerabilidades
- Coordinar con el equipo

## Patrones de Uso Comunes

### Pipeline de Reconocimiento

```
1. search_command("nmap") - Verificar disponibilidad
2. install_package("nmap") - Instalar si es necesario
3. run_command("nmap", ["-sV", target]) - Ejecutar escaneo
4. notion_create_page() - Documentar resultados
```

### Análisis Web Completo

```
1. check_gui_tool("burpsuite")
2. launch_gui_tool("burpsuite")
3. run_command("curl", [target]) - Reconocimiento inicial
4. notion_create_page() - Registrar hallazgos
```

### Auditoría Forense

```
1. check_gui_tool("volatility")
2. launch_gui_tool("volatility")
3. run_command("volatility3", ["-f", "dump.bin", "imageinfo"])
4. notion_create_page() - Documentar análisis
```
