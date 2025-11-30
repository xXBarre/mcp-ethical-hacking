# Configuración de Wiki en GitHub

## Archivos de Wiki Disponibles

Este repositorio contiene todos los archivos markdown necesarios para la documentación. Los archivos están almacenados en la rama `main` pero necesitan ser habilitados como Wiki de GitHub.

### Páginas Disponibles

- **Home.md** - Introducción al proyecto
- **Installation.md** - Guía de instalación paso a paso
- **Tools.md** - Documentación de las 7 herramientas
- **LLM-Integration.md** - 5 métodos de integración con LLMs
- **Deployment.md** - 5 opciones de despliegue
- **Examples.md** - 5 casos de uso reales
- **Architecture.md** - Diseño técnico del servidor
- **Security.md** - Guía de seguridad y hardening
- **FAQ.md** - Preguntas frecuentes y troubleshooting
- **Wiki-Index.md** - Índice completo
- **_Sidebar.md** - Navegación estructurada
- **PROJECT_STATUS.md** - Estado del proyecto

## Paso 1: Habilitar Wiki

1. Ve al repositorio en GitHub
2. Haz clic en **Settings** (rueda de engranaje)
3. Busca la sección **Features** en la barra izquierda
4. Marca la casilla **Wikis**
5. Haz clic en **Save**

## Paso 2: Crear la Wiki

Tienes dos opciones:

### Opción A: Manual (Recomendado para comenzar)

1. Ve a la pestaña **Wiki** del repositorio
2. GitHub te pedirá crear la primera página
3. Copia el contenido de `Home.md` del repositorio
4. Pega en la página de wiki
5. Guarda
6. Repite para cada página

### Opción B: Script Automático

Si tienes GitHub CLI instalado:

```bash
# Clonar el repositorio con wiki
git clone https://github.com/xXBarre/mcp-ethical-hacking.git
cd mcp-ethical-hacking
git clone https://github.com/xXBarre/mcp-ethical-hacking.wiki.git wiki

# Copiar archivos a wiki
cp Home.md wiki/Home.md
cp Installation.md wiki/Installation.md
cp Tools.md wiki/Tools.md
cp LLM-Integration.md wiki/LLM-Integration.md
cp Deployment.md wiki/Deployment.md
cp Examples.md wiki/Examples.md
cp Architecture.md wiki/Architecture.md
cp Security.md wiki/Security.md
cp FAQ.md wiki/FAQ.md
cp Wiki-Index.md wiki/Wiki-Index.md
cp _Sidebar.md wiki/_Sidebar.md

# Push a wiki
cd wiki
git add .
git commit -m "Add complete wiki documentation"
git push
```

## Estructura de la Wiki

Después de crear las páginas, la estructura será:

```
Wiki Home
├── Home (página principal)
├── Installation
├── Tools
├── LLM-Integration
├── Deployment
├── Examples
├── Architecture
├── Security
├── FAQ
├── Wiki-Index
└── _Sidebar (navegación automática)
```

## Orden Recomendado de Creación

1. **Home** - Inicio y presentación
2. **Installation** - Cómo instalar
3. **Tools** - Qué herramientas disponibles
4. **Examples** - Ver en acción
5. **LLM-Integration** - Cómo integrar
6. **Deployment** - Cómo desplegar
7. **Architecture** - Cómo funciona
8. **Security** - Cómo asegurar
9. **FAQ** - Ayuda y troubleshooting
10. **Wiki-Index** - Índice navegable
11. **_Sidebar** - Actualizar al final para navegación

## Notas Importantes

- **Wiki es separado**: El wiki de GitHub es un repositorio distinto (`repo.wiki.git`)
- **No se sincroniza automáticamente**: Los cambios en `main` no afectan wiki
- **Es editable online**: Una vez creado, cualquiera con permisos puede editar
- **Tiene historial**: Git mantiene historial de cambios en wiki

## Alternativa: Usar README como documentación

Si no quieres crear wiki, el **README.md** ya contiene:
- Descripción del proyecto
- Links a todos los archivos .md
- Ejemplos de uso
- Guía de instalación

Acceso directo: https://github.com/xXBarre/mcp-ethical-hacking/blob/main/README.md

## Solución de Problemas

### "404 - page not found" cuando intento acceder a Home

Esto significa que la wiki no está creada aún. Sigue:
1. Habilita wikis en Settings
2. Crea la primera página (Home)
3. Las demás páginas estarán disponibles

### No veo la opción de Wikis en Settings

Asegúrate de tener permisos de administrador en el repositorio.

### Los links entre páginas no funcionan

Usa formato: `[Text](Page-Name)` sin extensión `.md`

## Comandos Git para Wiki

```bash
# Clonar wiki
git clone https://github.com/xXBarre/mcp-ethical-hacking.wiki.git

# Entrar a wiki
cd mcp-ethical-hacking.wiki

# Ver cambios
git log --oneline

# Actualizar
git pull

# Agregar cambios
git add .
git commit -m "Update pages"
git push
```

## Archivos de Referencia

Todos los archivos de wiki están disponibles en:
- Ubicación: Raíz del repositorio
- Formato: Markdown (.md)
- Tamaño total: 4,500+ líneas
- Ejemplos: 50+

## Verificación

Para verificar que el wiki está funcionando:

1. Ve a: `https://github.com/xXBarre/mcp-ethical-hacking/wiki`
2. Deberías ver la página Home
3. Los links en la barra lateral deberían funcionar
4. Puedes navegar entre páginas

---

**Próximo paso**: Habilita wikis en Settings y comienza con Home.md
