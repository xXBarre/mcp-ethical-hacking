# Home

Bienvenido a la wiki de MCP Ethical Hacking, un servidor Model Context Protocol diseñado para automatizar flujos de ciberseguridad, análisis de vulnerabilidades y tareas de CTF (Capture The Flag).

## Que es MCP Ethical Hacking

MCP Ethical Hacking es un servidor que implementa el protocolo Model Context Protocol (MCP), permitiendo que modelos de lenguaje como Claude, GPT o LLMs locales ejecuten de forma segura tareas de seguridad informática:

- Ejecutar comandos de reconocimiento (nmap, whois, dig, etc)
- Instalar herramientas necesarias automáticamente
- Lanzar aplicaciones GUI para análisis interactivo (Burp Suite, OWASP ZAP, Wireshark)
- Integrar resultados directamente en Notion para documentación

## Características Principales

- Sin whitelist: permite ejecutar cualquier comando disponible en el sistema
- Soporte para herramientas GUI: lanza aplicaciones como Burp Suite, OWASP ZAP en background
- Integración con Notion: crea y consulta páginas y bases de datos automáticamente
- Seguridad por sandbox: diseñado para ejecutarse en entornos aislados
- Documentación exhaustiva: guías para múltiples ambientes de LLM
- Soporte multiplataforma: Linux, macOS, Windows (con WSL)

## Comenzar

Consulta la sección [Installation](Installation) para configurar el servidor en tu entorno.

Una vez instalado, puedes integrarlo con:

- Claude Desktop
- VS Code con GitHub Copilot
- Ollama con Open WebUI
- Cualquier cliente MCP personalizado
- Línea de comandos directamente

## Roadmap

- [x] Ejecutar comandos arbitrarios
- [x] Instalar paquetes del sistema
- [x] Lanzar herramientas GUI
- [x] Integración con Notion
- [x] Documentación completa
- [ ] Soporte para webhooks
- [ ] Sistema de permisos granulares
- [ ] Almacenamiento en caché de resultados

## Seguridad

Este servidor está diseñado explícitamente para entornos aislados. NO lo despliegues en:

- Servidores de producción
- Máquinas conectadas a internet sin protección
- Sistemas compartidos con datos sensibles

Se recomienda ejecutar siempre en:

- Contenedores Docker con límites de recursos
- Máquinas virtuales descartables
- Entornos de sandbox dedicados

## Contribuir

Este proyecto está abierto a contribuciones. Por favor:

1. Revisa las issues abiertas
2. Realiza un fork del repositorio
3. Crea una rama para tu característica
4. Realiza commits descriptivos
5. Abre un Pull Request

## Licencia

MIT

## Contacto

Para preguntas o reportes de bugs, abre un issue en el repositorio.
