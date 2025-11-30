#!/usr/bin/env node

import { execFile, spawn } from "node:child_process";
import http from "node:http";
import os from "node:os";
import { promisify } from "node:util";
import readline from "node:readline";
import process from "node:process";
import { WebSocketServer } from "ws";

const execFileAsync = promisify(execFile);
const HTTP_PORT = Number(process.env.PORT) || 3000;
const HTTP_HOST = process.env.HOST || "0.0.0.0";
const SERVER_NAME = "mcp-ethical-hacking";
const SERVER_VERSION = "0.2.0";

// Inicializar cliente de Notion si existe token
let notionClient = null;
if (process.env.NOTION_API_KEY) {
  try {
    const { Client } = await import("@notionhq/client");
    notionClient = new Client({ auth: process.env.NOTION_API_KEY });
  } catch (e) {
    console.error("Advertencia: No se pudo inicializar cliente de Notion");
  }
}

async function runShell(command, args = [], opts = {}) {
  const { cwd, timeout = 60_000, env = {} } = opts;
  const { stdout, stderr } = await execFileAsync(command, args, {
    cwd,
    timeout,
    maxBuffer: 10 * 1024 * 1024,
    env: { ...process.env, ...env }
  });
  return { stdout, stderr };
}

function text(value) {
  return { type: "text", text: value };
}

const tools = [
  {
    name: "run_command",
    description: "Ejecuta cualquier comando/binario para tareas de bug bounty/CTF.",
    inputSchema: {
      type: "object",
      properties: {
        command: { type: "string" },
        args: { type: "array", items: { type: "string" } },
        cwd: { type: "string" },
        timeoutMs: { type: "integer", default: 60000 }
      },
      required: ["command"]
    }
  },
  {
    name: "search_command",
    description: "Busca comandos instalados y paquetes disponibles.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer", default: 10 }
      },
      required: ["query"]
    }
  },
  {
    name: "install_package",
    description: "Instala un paquete vía apt-get.",
    inputSchema: {
      type: "object",
      properties: {
        package: { type: "string" },
        extraArgs: { type: "array", items: { type: "string" } }
      },
      required: ["package"]
    }
  },
  {
    name: "launch_gui_tool",
    description: "Lanza herramientas GUI (Burp Suite, OWASP ZAP, Wireshark, Ghidra, Volatility).",
    inputSchema: {
      type: "object",
      properties: {
        tool: { type: "string", enum: ["burpsuite", "zap", "wireshark", "ghidra", "volatility", "custom"] },
        args: { type: "array", items: { type: "string" } },
        config: { type: "object" }
      },
      required: ["tool"]
    }
  },
  {
    name: "check_gui_tool",
    description: "Verifica si una herramienta GUI está disponible.",
    inputSchema: {
      type: "object",
      properties: {
        tool: { type: "string" }
      },
      required: ["tool"]
    }
  },
  {
    name: "notion_create_page",
    description: "Crea una página en Notion con resultados.",
    inputSchema: {
      type: "object",
      properties: {
        parent_id: { type: "string" },
        title: { type: "string" },
        content: { type: "string" },
        properties: { type: "object" }
      },
      required: ["parent_id", "title"]
    }
  },
  {
    name: "notion_query_database",
    description: "Consulta una base de datos en Notion.",
    inputSchema: {
      type: "object",
      properties: {
        database_id: { type: "string" },
        filter: { type: "object" }
      },
      required: ["database_id"]
    }
  }
];

async function handleRunCommand(args) {
  const { command, cwd, timeoutMs = 60_000 } = args;
  const cmdArgs = Array.isArray(args.args) ? args.args : [];

  const { stdout, stderr } = await runShell(command, cmdArgs, { cwd, timeout: timeoutMs });
  const content = [];
  if (stdout) content.push(text(stdout));
  if (stderr) content.push(text(`[stderr]\n${stderr}`));
  return { content };
}

async function handleSearchCommand(args) {
  const query = String(args.query ?? "").trim();
  const limit = Math.min(Math.max(Number(args.limit) || 10, 1), 20);
  if (!query) throw new Error("query es obligatorio");

  const results = [];

  try {
    const { stdout } = await runShell("which", [query]);
    if (stdout.trim()) results.push(`which: ${stdout.trim()}`);
  } catch {}

  try {
    const { stdout } = await runShell("apt-cache", ["search", query]);
    const lines = stdout.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, limit);
    if (lines.length) results.push("apt-cache:\n" + lines.join("\n"));
  } catch {}

  if (results.length === 0) {
    return { content: [text("Sin resultados")] };
  }
  return { content: [text(results.join("\n\n"))] };
}

async function handleInstallPackage(args) {
  const pkg = String(args.package ?? "").trim();
  const extraArgs = Array.isArray(args.extraArgs) ? args.extraArgs : [];

  if (!pkg) throw new Error("package es obligatorio");

  const installArgs = ["install", "-y", pkg, ...extraArgs];
  const { stdout, stderr } = await runShell("apt-get", installArgs, { timeout: 300_000 });
  const content = [];
  if (stdout) content.push(text(stdout));
  if (stderr) content.push(text(`[stderr]\n${stderr}`));
  return { content };
}

async function handleLaunchGuiTool(args) {
  const { tool, args: toolArgs = [], config = {} } = args;

  const toolPaths = {
    burpsuite: ["/opt/burp/burpsuite", "burpsuite", "java -jar /opt/BurpSuitePro/burpsuite.jar"],
    zap: ["zaproxy", "owasp-zap"],
    wireshark: ["wireshark"],
    ghidra: ["ghidra", "ghidraRun", "/opt/ghidra/ghidraRun"],
    volatility: ["volatility3", "volatility"]
  };

  const paths = toolPaths[tool] || [tool];
  let cmd = null;

  for (const p of paths) {
    try {
      const { stdout } = await runShell("which", [p]);
      if (stdout.trim()) {
        cmd = stdout.trim();
        break;
      }
    } catch {}
  }

  if (!cmd && tool === "custom") {
    cmd = toolArgs[0];
    toolArgs.splice(0, 1);
  }

  if (!cmd) {
    throw new Error(`Herramienta '${tool}' no encontrada.`);
  }

  let finalArgs = [...toolArgs];
  if (tool === "burpsuite" && config.project) {
    finalArgs.push("--project", config.project);
  }
  if (tool === "zap" && config.port) {
    finalArgs.push("-port", config.port.toString());
  }

  const childProcess = spawn(cmd, finalArgs, {
    detached: true,
    stdio: "ignore"
  });

  const pid = childProcess.pid;
  childProcess.unref();

  return {
    content: [
      text(
        `✓ Herramienta '${tool}' lanzada con PID ${pid}\n\nComandos útiles:\n- Para verificar: ps aux | grep ${pid}\n- Para detener: kill ${pid}`
      )
    ]
  };
}

async function handleCheckGuiTool(args) {
  const { tool } = args;

  const toolInstallMap = {
    burpsuite: "burpsuite-community | burpsuite-pro",
    zap: "zaproxy",
    wireshark: "wireshark",
    ghidra: "ghidra",
    volatility: "volatility3"
  };

  try {
    const { stdout } = await runShell("which", [tool]);
    if (stdout.trim()) {
      return { content: [text(`✓ ${tool} está en: ${stdout.trim()}`)] };
    }
  } catch {}

  const info = toolInstallMap[tool] || tool;
  return { content: [text(`✗ ${tool} no encontrado. Instalar: apt-get install ${info}`)] };
}

async function handleNotionCreatePage(args) {
  if (!notionClient) {
    throw new Error("NOTION_API_KEY no configurada");
  }

  const { parent_id, title, content = "", properties = {} } = args;

  if (!parent_id || !title) {
    throw new Error("parent_id y title obligatorios");
  }

  const pageData = {
    parent: { database_id: parent_id },
    properties: {
      title: [{ text: { content: title } }],
      ...properties
    },
    children: []
  };

  if (content) {
    const paragraphs = content.split("\n").filter((l) => l.trim());
    pageData.children = paragraphs.map((p) => ({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: p } }]
      }
    }));
  }

  const response = await notionClient.pages.create(pageData);
  return { content: [text(`✓ Página creada\nURL: ${response.url}\nID: ${response.id}`)] };
}

async function handleNotionQueryDatabase(args) {
  if (!notionClient) {
    throw new Error("NOTION_API_KEY no configurada");
  }

  const { database_id, filter = {} } = args;

  if (!database_id) {
    throw new Error("database_id obligatorio");
  }

  const response = await notionClient.databases.query({
    database_id,
    filter: Object.keys(filter).length > 0 ? filter : undefined
  });

  const results = response.results.map((page) => ({
    id: page.id,
    title: page.properties.title?.title?.[0]?.plain_text || "Sin título",
    properties: Object.entries(page.properties).reduce((acc, [key, val]) => {
      acc[key] = val[val.type]?.plain_text || JSON.stringify(val);
      return acc;
    }, {})
  }));

  return { content: [text(`${results.length} registros:\n\n${JSON.stringify(results, null, 2)}`)] };
}

async function processRequest(request) {
  const { jsonrpc, id, method, params } = request;

  try {
    if (method === "initialize") {
      return {
        jsonrpc,
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: {
            name: SERVER_NAME,
            version: SERVER_VERSION
          }
        }
      };
    }

    if (method === "tools/list") {
      return {
        jsonrpc,
        id,
        result: { tools }
      };
    }

    if (method === "tools/call") {
      const { name, arguments: args } = params || {};

      let result;
      switch (name) {
        case "run_command":
          result = await handleRunCommand(args);
          break;
        case "search_command":
          result = await handleSearchCommand(args);
          break;
        case "install_package":
          result = await handleInstallPackage(args);
          break;
        case "launch_gui_tool":
          result = await handleLaunchGuiTool(args);
          break;
        case "check_gui_tool":
          result = await handleCheckGuiTool(args);
          break;
        case "notion_create_page":
          result = await handleNotionCreatePage(args);
          break;
        case "notion_query_database":
          result = await handleNotionQueryDatabase(args);
          break;
        default:
          throw new Error(`Tool '${name}' no encontrada`);
      }

      return {
        jsonrpc,
        id,
        result
      };
    }

    return {
      jsonrpc,
      id,
      error: { code: -32601, message: "Method not found" }
    };
  } catch (error) {
    return {
      jsonrpc,
      id,
      error: { code: -32603, message: error.message }
    };
  }
}

function normalizeRpcRequest(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Request inválido");
  }

  if (payload.jsonrpc) {
    return payload;
  }

  const id = payload.id ?? Math.random().toString(36).slice(2);

  if (payload.method === "resources/list_tools") {
    return { jsonrpc: "2.0", id, method: "tools/list", params: {} };
  }

  if (payload.method && payload.params !== undefined) {
    return { jsonrpc: "2.0", id, method: payload.method, params: payload.params };
  }

  if (payload.method === "call_tool" || payload.action === "call_tool") {
    return {
      jsonrpc: "2.0",
      id,
      method: "tools/call",
      params: {
        name: payload.params?.name || payload.name,
        arguments: payload.params?.arguments || payload.arguments || {}
      }
    };
  }

  if (payload.name) {
    return {
      jsonrpc: "2.0",
      id,
      method: "tools/call",
      params: { name: payload.name, arguments: payload.arguments || payload.params || {} }
    };
  }

  throw new Error("Formato de request no soportado");
}

async function handleRpc(payload) {
  const rpcRequest = normalizeRpcRequest(payload);
  return processRequest(rpcRequest);
}

function logIntro() {
  console.error(`
╔════════════════════════════════════════════════════════════════╗
║       MCP ETHICAL HACKING SERVER - INICIADO                    ║
╚════════════════════════════════════════════════════════════════╝

Información del Servidor:
   • Protocolo: JSON-RPC 2.0 (stdin/stdout), HTTP, SSE y WebSocket
   • Entrada: stdin / HTTP / WS
   • Salida: stdout / HTTP / WS

Herramientas Disponibles (7):
   1. run_command           - Ejecutar comandos shell
   2. search_command        - Buscar comandos y herramientas
   3. install_package       - Instalar paquetes
   4. launch_gui_tool       - Lanzar aplicaciones GUI
   5. check_gui_tool        - Verificar herramientas disponibles
   6. notion_create_page    - Crear páginas en Notion
   7. notion_query_database - Consultar bases de datos Notion

HTTP/WS:
   • URL base: http://${HTTP_HOST === "0.0.0.0" ? "0.0.0.0" : HTTP_HOST}:${HTTP_PORT}
   • Endpoints: /, /health, /tools, /call, /execute, /sse, /ws

Conexión: ${process.env.NOTION_API_KEY ? "NOTION CONECTADO" : "NOTION NO CONFIGURADO (opcional)"}
════════════════════════════════════════════════════════════════
  Servidor listo. Esperando solicitudes...
════════════════════════════════════════════════════════════════
`);
}

function startStdioRpc() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  let requestCount = 0;

  rl.on("line", async (line) => {
    if (!line.trim()) return;

    try {
      requestCount++;
      const request = JSON.parse(line);
      const response = await processRequest(request);

      if (response.result) {
        console.error(`[STDIN #${requestCount}] OK - ${request.method || "unknown"}`);
      } else {
        console.error(`[STDIN #${requestCount}] ERROR - ${response.error?.message}`);
      }

      console.log(JSON.stringify(response));
    } catch (error) {
      console.error(`[STDIN] ERROR: ${error.message}`);
      console.log(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32603, message: error.message }
        })
      );
    }
  });
}

function sendJsonlHandshake(res) {
  const sendJSON = (obj) => res.write(JSON.stringify(obj) + "\n");
  sendJSON({
    type: "model",
    protocol_version: "2024-11-05",
    server_info: {
      name: SERVER_NAME,
      version: SERVER_VERSION
    }
  });
  sendJSON({ type: "tools/list", tools });
  const ping = setInterval(() => sendJSON({ type: "ping" }), 15000);
  res.on("close", () => clearInterval(ping));
}

function setupSse(res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "X-Accel-Buffering": "no"
  });

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent("ready", { status: "ready", tools: tools.length });
  sendEvent("tools", tools);

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 25000);

  res.on("close", () => clearInterval(heartbeat));
}

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk.toString()));
    req.on("end", () => {
      try {
        const parsed = data ? JSON.parse(data) : {};
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function createHttpServer() {
  return http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method === "GET" && req.url && req.url.startsWith("/sse")) {
      const wantsJsonl =
        req.url.includes("format=jsonl") ||
        (req.headers.accept || "").includes("application/jsonl+model-context-stream");

      if (wantsJsonl) {
        res.writeHead(200, {
          "Content-Type": "application/jsonl+model-context-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive"
        });
        sendJsonlHandshake(res);
      } else {
        setupSse(res);
      }
      return;
    }

    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          {
            server: SERVER_NAME,
            version: SERVER_VERSION,
            protocol: "MCP JSON-RPC 2.0",
            endpoints: {
              "/": "Info",
              "/health": "Estado",
              "/tools": "Lista de herramientas",
              "/call": "Ejecutar herramienta (JSON-RPC compatible)",
              "/execute": "Alias de /call",
              "/sse": "Handshake SSE/JSONL",
              "/ws": "WebSocket MCP"
            },
            tools: tools.map((t) => ({ name: t.name, description: t.description }))
          },
          null,
          2
        )
      );
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
      return;
    }

    if (req.method === "GET" && req.url === "/tools") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ tools }, null, 2));
      return;
    }

    if (req.method === "POST" && (req.url === "/call" || req.url === "/execute")) {
      try {
        const body = await readJsonBody(req);

        const rpcPayload = body.jsonrpc
          ? body
          : body.method || body.name
            ? {
                jsonrpc: "2.0",
                id: body.id ?? Math.random().toString(36).slice(2),
                method:
                  body.method === "initialize" || body.method === "tools/list" || body.method === "tools/call"
                    ? body.method
                    : "tools/call",
                params:
                  body.method === "initialize" || body.method === "tools/list"
                    ? body.params || {}
                    : { name: body.name || body.method, arguments: body.arguments || body.params || {} }
              }
            : null;

        if (!rpcPayload) {
          throw new Error("Formato de request no soportado");
        }

        const response = await handleRpc(rpcPayload);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response, null, 2));
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }

    if (req.method === "GET" && req.url === "/ws") {
      res.writeHead(426, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Usa WebSocket en ws://<host>/ws" }));
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  });
}

function attachWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    const clientId = Math.random().toString(36).slice(2);
    console.error(`[WS] Cliente conectado: ${clientId}`);

    ws.send(
      JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/list",
        params: { tools }
      })
    );

    ws.on("message", async (data) => {
      try {
        const payload = JSON.parse(data);
        const response = await handleRpc(payload);
        ws.send(JSON.stringify(response));
      } catch (error) {
        ws.send(
          JSON.stringify({
            jsonrpc: "2.0",
            id: null,
            error: { code: -32700, message: error.message }
          })
        );
      }
    });

    ws.on("close", () => {
      console.error(`[WS] Cliente desconectado: ${clientId}`);
    });

    ws.on("error", (error) => {
      console.error(`[WS] Error: ${error.message}`);
    });
  });

  return wss;
}

function logHttpAddresses() {
  const interfaces = os.networkInterfaces();
  const hosts = new Set(["127.0.0.1"]);
  Object.values(interfaces)
    .flat()
    .filter(Boolean)
    .forEach((addr) => {
      if (addr.family === "IPv4" && !addr.internal) {
        hosts.add(addr.address);
      }
    });

  console.error(`HTTP/WS escuchando en:`);
  Array.from(hosts).forEach((ip) => {
    console.error(`  http://${ip}:${HTTP_PORT}`);
  });
}

async function main() {
  logIntro();

  // RPC via stdin/stdout
  if (process.env.DISABLE_STDIN !== "1") {
    startStdioRpc();
  }

  // HTTP + WebSocket en un mismo servidor
  const server = createHttpServer();
  attachWebSocket(server);

  server.listen(HTTP_PORT, HTTP_HOST, () => {
    console.error(`Servidor HTTP/SSE/WS listo en ${HTTP_HOST}:${HTTP_PORT}`);
    logHttpAddresses();
  });

  process.on("SIGINT", () => {
    console.error("\nCerrando servidor...");
    server.close(() => process.exit(0));
  });
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
