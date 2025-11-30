# FAQ

Preguntas frecuentes y solución de problemas.

## Preguntas Generales

### ¿Qué es MCP Ethical Hacking?

MCP (Model Context Protocol) Ethical Hacking es un servidor que permite a LLMs ejecutar comandos, instalar herramientas, lanzar aplicaciones GUI y documentar auditorías en Notion.

### ¿Puedo usar esto en producción?

Sí, pero con precauciones de seguridad:
- Ejecutar en contenedor aislado
- Usar únicamente redes privadas
- Implementar autenticación
- Auditar todos los comandos
- Limitar a comandos específicos permitidos

### ¿Qué versiones de Node.js soporta?

Node.js 18.x o superior (LTS recomendado).

### ¿Funciona en Windows?

Windows Subsystem for Linux (WSL) 2 es la mejor opción. Native Windows tiene limitaciones.

### ¿Necesito Docker para ejecutarlo?

No es obligatorio. Funciona localmente si tienes Node.js 18+. Docker simplifica despliegue.

## Instalación y Configuración

### Error: "ENOENT: no such file or directory"

Asegúrate de estar en el directorio correcto:

```bash
cd mcp-ethical-hacking
npm install
```

### Error: "npm ERR! code E403"

Problema con permisos de npm:

```bash
# Cambiar propietario del directorio
sudo chown -R $USER ~/.npm

# O usar versión global de npm
npm install -g npm@latest
```

### ¿Cómo configuro la API Key de Notion?

1. Ir a https://www.notion.so/my-integrations
2. Crear nueva integración
3. Copiar "Internal Integration Token"
4. Configurar en variable de entorno:

```bash
export NOTION_API_KEY="secret_xxxxxxxxxxxxx"
```

5. Verificar:

```bash
echo $NOTION_API_KEY
```

### Error: "NOTION_API_KEY no configurada"

La variable de entorno no está establecida. Configurarla:

```bash
# Temporal (solo sesión actual)
export NOTION_API_KEY="tu-clave"

# Permanente (agregar a ~/.bashrc o ~/.zshrc)
echo 'export NOTION_API_KEY="tu-clave"' >> ~/.bashrc
source ~/.bashrc
```

### ¿Cómo obtengo el ID de base de datos Notion?

La URL de Notion tiene el formato:
```
https://www.notion.so/workspace/DATABASE_ID?v=VIEW_ID
```

El ID es la parte larga sin guiones después de `/`.

Ejemplo:
```
https://www.notion.so/workspace/a1b2c3d4e5f67890abcdef1234567890?v=xyz
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                              Este es el ID
```

## Ejecución de Comandos

### Error: "command not found"

La herramienta no está instalada:

```bash
# Buscar si existe
npm start  # Iniciar servidor

# En otra terminal
curl -X POST http://localhost:3000 \
  -d '{"name": "search_command", "arguments": {"query": "nmap"}}'
```

Si no aparece, instalar:

```bash
# Buscar paquete disponible
curl -X POST http://localhost:3000 \
  -d '{"name": "search_command", "arguments": {"query": "nmap"}}'

# Instalar
curl -X POST http://localhost:3000 \
  -d '{"name": "install_package", "arguments": {"package": "nmap"}}'
```

### Comando tarda demasiado

El timeout por defecto es 60 segundos. Aumentarlo:

```json
{
  "command": "nmap",
  "args": ["-sS", "-p", "1-65535", "target"],
  "timeoutMs": 300000
}
```

Máximo permitido: 300000 ms (5 minutos).

### ¿Cómo ejecutar comandos complejos?

Usar bash:

```json
{
  "command": "bash",
  "args": [
    "-c",
    "nmap target | grep open && echo 'Puertos encontrados'"
  ],
  "timeoutMs": 60000
}
```

### ¿Puedo ejecutar scripts personalizados?

Sí, guardar script y ejecutar:

```bash
# Crear script
cat > /tmp/my-script.sh << 'EOF'
#!/bin/bash
nmap -sV $1 | grep open
EOF

chmod +x /tmp/my-script.sh

# Ejecutar desde MCP
{
  "command": "bash",
  "args": ["/tmp/my-script.sh", "target"]
}
```

## Herramientas GUI

### Error: "display not found"

DISPLAY no está configurado. Solución:

```bash
# Encontrar display
echo $DISPLAY

# Si está vacío
export DISPLAY=:0

# O para X forwarding remoto
export DISPLAY=localhost:10.0
```

### Burp Suite no inicia

```bash
# Verificar si está instalado
check_gui_tool burpsuite

# Instalar si es necesario
install_package burpsuite-community

# Verificar Java
java -version

# Si Java no está instalado
install_package default-jre
```

### Wireshark requiere permisos

Ejecutar con sudo o agregar usuario a grupo:

```bash
sudo usermod -aG wireshark $USER
# Reiniciar sesión
```

### ¿Cómo monitorear procesos lanzados?

```bash
# Ver PID
ps aux | grep 12345

# Ver memoria
ps aux | grep 12345 | awk '{print $6}'

# Detener proceso
kill 12345

# Forzar detención
kill -9 12345
```

## Integración con Notion

### Error: "Invalid database_id"

El ID de base de datos es incorrecto. Obtenerlo correctamente:

```
https://www.notion.so/workspace/ID_AQUI?v=view
```

### Error: "parent_id not found"

La página o base de datos no existe o no tienes acceso.

1. Verificar URL de Notion
2. Verificar que la integración tiene acceso
3. Verificar API Key

### ¿Cómo dar acceso a una integración?

En Notion:
1. Abrir base de datos
2. Botón compartir (arriba derecha)
3. "Invite"
4. Buscar tu integración
5. Aceptar permisos

### Error: "403 Forbidden"

La integración no tiene permisos:

1. Ir a https://www.notion.so/my-integrations
2. Abrir la integración
3. Verificar "Associated integrations"
4. Compartir la base de datos con la integración

### ¿Puedo crear múltiples páginas en una petición?

No, una petición = una página. Para múltiples:

```bash
for i in {1..10}; do
  curl -X POST ... -d '{"title": "Page $i"}'
done
```

## Despliegue

### Docker no inicia

```bash
# Ver error
docker run -it mcp-ethical-hacking

# Ver logs
docker logs <container-id>

# Rebuild
docker build -t mcp-ethical-hacking:latest --no-cache .
```

### Kubernetes pod no inicia

```bash
# Ver estado
kubectl describe pod <pod-name> -n security

# Ver logs
kubectl logs <pod-name> -n security

# Port forward para debugging
kubectl port-forward <pod-name> 3000:3000 -n security
```

### Lambda timeout

Aumentar timeout en serverless.yml:

```yaml
functions:
  runCommand:
    timeout: 300
```

### Cloud Run no responde

```bash
# Ver logs
gcloud run logs read mcp-ethical-hacking --region us-central1

# Redeploy
gcloud run deploy mcp-ethical-hacking \
  --image gcr.io/PROJECT_ID/mcp-ethical-hacking \
  --region us-central1
```

## Seguridad

### ¿Cómo limitar comandos permitidos?

Editar server.js:

```javascript
const ALLOWED_COMMANDS = ['nmap', 'curl', 'dig'];

function isAllowed(cmd) {
  return ALLOWED_COMMANDS.includes(cmd);
}
```

### ¿Debo ejecutar como root?

No es recomendado. Crear usuario:

```bash
useradd -m -s /bin/bash mcp
sudo -u mcp npm start
```

### ¿Cómo auditar comandos?

Agregar logging:

```javascript
console.log(`[AUDIT] ${new Date().toISOString()} - ${command} ${args.join(' ')}`);
```

### ¿Puedo usar esto en red pública?

No es recomendado sin:
- Autenticación fuerte
- HTTPS/TLS
- Firewall
- Rate limiting
- Validación de entrada

## Performance

### Servidor lento

Opciones:

1. Aumentar memoria
2. Escalar horizontalmente
3. Usar async operations
4. Implementar caching

### Demasiadas conexiones concurrentes

Limitar concurrencia:

```javascript
const MAX_CONCURRENT = 5;
```

O en Kubernetes:

```yaml
resources:
  limits:
    memory: "512Mi"
    cpu: "500m"
```

## Errores Comunes

### "Command exceeded maximum buffer"

Aumentar maxBuffer:

```javascript
const MAX_BUFFER = 10 * 1024 * 1024; // 10MB
```

### "JSON parse error"

La respuesta no es JSON válido. Usar bash:

```json
{
  "command": "bash",
  "args": ["-c", "nmap ... | jq -R -s '.' "]
}
```

### "ENOENT: no such file"

Archivo no existe. Verificar ruta:

```bash
ls -la /tmp/file.txt
```

Usar ruta absoluta en lugar de relativa.

### "Permission denied"

Permisos insuficientes:

```bash
# Ver permisos
ls -la /tmp/file.txt

# Cambiar permisos
chmod +x /tmp/file.txt

# Cambiar propietario
sudo chown $USER:$USER /tmp/file.txt
```

## Soporte y Recursos

### Dónde reportar bugs

GitHub Issues: https://github.com/tu-repo/issues

### Documentación adicional

- MCP Spec: https://modelcontextprotocol.io/
- Node.js: https://nodejs.org/docs/
- Notion API: https://developers.notion.com/

### Comunidades

- GitHub Discussions
- Stack Overflow
- Reddit r/cybersecurity

### Solución de Problemas Avanzada

Para debugging profundo:

```bash
# Habilitar debug
DEBUG=* npm start

# Ver tráfico de red
tcpdump -i lo port 3000

# Monitorear archivos
lsof -i :3000

# Ver variables de entorno
env | grep MCP
```
