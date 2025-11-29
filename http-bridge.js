#!/usr/bin/env node

/**
 * MCP HTTP Bridge
 * Expone el servidor MCP como una API REST HTTP
 * Permite conectar cualquier LLM vía HTTP
 */

import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const MCP_SERVER_PATH = path.join(__dirname, 'src', 'server.js');

// Estado global
let mcpProcess = null;
let requestQueue = [];
let isProcessing = false;

/**
 * Inicia el proceso MCP
 */
function startMCPServer() {
  return new Promise((resolve, reject) => {
    console.log('[MCP] Iniciando servidor MCP...');
    
    mcpProcess = spawn('node', [MCP_SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    mcpProcess.on('error', (err) => {
      console.error('[MCP] Error:', err);
      reject(err);
    });

    mcpProcess.on('exit', (code) => {
      console.log(`[MCP] Servidor terminado con código ${code}`);
      mcpProcess = null;
    });

    // Esperar a que el servidor esté listo
    setTimeout(() => {
      console.log('[MCP] Servidor MCP iniciado correctamente');
      resolve();
    }, 1000);
  });
}

/**
 * Envía una petición JSON-RPC al servidor MCP
 */
function sendToMCP(jsonrpc) {
  return new Promise((resolve, reject) => {
    if (!mcpProcess) {
      return reject(new Error('MCP server no está disponible'));
    }

    let response = '';
    let errorOutput = '';

    const onData = (data) => {
      response += data.toString();
      
      try {
        const result = JSON.parse(response);
        mcpProcess.stdout.removeListener('data', onData);
        mcpProcess.stderr.removeListener('data', onStderr);
        resolve(result);
      } catch (e) {
        // Esperando más datos
      }
    };

    const onStderr = (data) => {
      errorOutput += data.toString();
    };

    mcpProcess.stdout.once('data', onData);
    mcpProcess.stderr.on('data', onStderr);

    // Enviar request JSON-RPC
    mcpProcess.stdin.write(JSON.stringify(jsonrpc) + '\n');

    // Timeout
    setTimeout(() => {
      mcpProcess.stdout.removeListener('data', onData);
      mcpProcess.stderr.removeListener('data', onStderr);
      reject(new Error('Timeout esperando respuesta del MCP'));
    }, 30000);
  });
}

/**
 * Crea el servidor HTTP
 */
function createHTTPServer() {
  const server = http.createServer(async (req, res) => {
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Pre-flight CORS
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Rutas disponibles
    if (req.url === '/' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'ok',
        server: 'MCP Ethical Hacking HTTP Bridge',
        version: '1.0.0',
        endpoints: {
          'GET /': 'Este endpoint',
          'GET /health': 'Estado del servidor',
          'GET /tools': 'Listar herramientas disponibles',
          'POST /call': 'Ejecutar una herramienta (JSON-RPC)',
          'POST /execute': 'Alias para /call'
        },
        examples: {
          execute_command: {
            url: 'POST /call',
            body: {
              method: 'run_command',
              params: { command: 'echo "hola"' }
            }
          },
          list_tools: {
            url: 'POST /call',
            body: {
              method: 'list_tools'
            }
          }
        }
      }, null, 2));
      return;
    }

    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: mcpProcess ? 'running' : 'stopped',
        mcp_server: 'MCP Ethical Hacking',
        port: PORT,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    if (req.url === '/tools' && req.method === 'GET') {
      const tools = [
        { name: 'run_command', description: 'Ejecutar comando shell' },
        { name: 'search_command', description: 'Buscar comandos' },
        { name: 'install_package', description: 'Instalar paquetes' },
        { name: 'launch_gui_tool', description: 'Lanzar herramienta GUI' },
        { name: 'check_gui_tool', description: 'Verificar herramienta GUI' },
        { name: 'notion_create_page', description: 'Crear página en Notion' },
        { name: 'notion_query_database', description: 'Consultar Notion' }
      ];
      res.writeHead(200);
      res.end(JSON.stringify({ tools }, null, 2));
      return;
    }

    if ((req.url === '/call' || req.url === '/execute') && req.method === 'POST') {
      let body = '';

      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          
          // Construir request JSON-RPC
          const jsonrpc = {
            jsonrpc: '2.0',
            id: Math.random().toString(36),
            method: data.method || 'unknown',
            params: data.params || {}
          };

          console.log(`\n[HTTP REQUEST] ${new Date().toISOString()}`);
          console.log(`  Method: ${jsonrpc.method}`);
          console.log(`  Params: ${JSON.stringify(jsonrpc.params).substring(0, 100)}${JSON.stringify(jsonrpc.params).length > 100 ? '...' : ''}`);
          
          // Enviar al MCP
          const result = await sendToMCP(jsonrpc);
          
          console.log(`  ✓ Exitoso - Response enviada`);
          
          res.writeHead(200);
          res.end(JSON.stringify(result, null, 2));
        } catch (error) {
          console.error(`  ✗ Error: ${error.message}`);
          res.writeHead(400);
          res.end(JSON.stringify({
            error: error.message,
            code: 'EXECUTION_ERROR'
          }, null, 2));
        }
      });

      req.on('error', (error) => {
        console.error('[HTTP] Error en request:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Request error' }));
      });
      return;
    }

    // 404
    res.writeHead(404);
    res.end(JSON.stringify({
      error: 'Not Found',
      endpoint: req.url,
      method: req.method
    }));
  });

  return server;
}

/**
 * Inicia todo
 */
async function main() {
  try {
    // Iniciar servidor MCP
    await startMCPServer();

    // Crear y iniciar servidor HTTP
    const server = createHTTPServer();
    
    server.listen(PORT, () => {
      console.log(`\n${'='.repeat(65)}`);
      console.log(`╔${'═'.repeat(63)}╗`);
      console.log(`║ 🌐 MCP HTTP BRIDGE - INICIADO CORRECTAMENTE              ║`);
      console.log(`╚${'═'.repeat(63)}╝`);
      console.log(`\n📡 Servidor HTTP activo en: http://localhost:${PORT}`);
      console.log(`\n📍 Endpoints disponibles:\n`);
      console.log(`   GET  http://localhost:${PORT}/              Info del servidor`);
      console.log(`   GET  http://localhost:${PORT}/health        Estado del servidor`);
      console.log(`   GET  http://localhost:${PORT}/tools         Listar herramientas\n`);
      console.log(`   POST http://localhost:${PORT}/call          Ejecutar herramienta`);
      console.log(`   POST http://localhost:${PORT}/execute       Alias para /call\n`);
      console.log(`📚 Ejemplos de uso:\n`);
      console.log(`   # Verificar estado`);
      console.log(`   curl http://localhost:${PORT}/health\n`);
      console.log(`   # Ejecutar comando`);
      console.log(`   curl -X POST http://localhost:${PORT}/call \\`);
      console.log(`     -H "Content-Type: application/json" \\`);
      console.log(`     -d '{"method":"run_command","params":{"command":"echo hola"}}'\n`);
      console.log(`${'='.repeat(65)}`);
      console.log(`✓ Escuchando en puerto ${PORT}...`);
      console.log(`✓ MCP Server conectado`);
      console.log(`${'='.repeat(65)}\n`);
    });

    // Manejo de señales
    process.on('SIGINT', () => {
      console.log('\n[INFO] Cerrando servidor...');
      server.close();
      if (mcpProcess) {
        mcpProcess.kill();
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('[FATAL] Error iniciando:', error);
    process.exit(1);
  }
}

main();
