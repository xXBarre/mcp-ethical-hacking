#!/usr/bin/env node

/**
 * MCP Client Adapter - Convierte stdin/stdout MCP a WebSocket
 * Permite que LM Studio use el servidor MCP vía WebSocket
 */

import { WebSocket } from 'ws';
import readline from 'readline';

const WS_URL = process.env.WS_URL || 'ws://192.168.1.109:3000/ws';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let ws;
let messageId = 0;

function connect() {
  console.error(`[MCP-WS] Conectando a ${WS_URL}...`);
  
  ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.error('[MCP-WS] Conectado al servidor WebSocket');
    
    // Enviar initialize
    const initMsg = {
      jsonrpc: '2.0',
      id: ++messageId,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'LM Studio MCP Client',
          version: '1.0.0'
        }
      }
    };
    ws.send(JSON.stringify(initMsg));
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      process.stdout.write(JSON.stringify(message) + '\n');
    } catch (error) {
      console.error('[MCP-WS] Error parseando mensaje:', error.message);
    }
  });

  ws.on('error', (error) => {
    console.error('[MCP-WS] WebSocket error:', error.message);
    process.exit(1);
  });

  ws.on('close', () => {
    console.error('[MCP-WS] Desconectado del servidor');
    process.exit(0);
  });
}

// Leer mensajes de stdin y enviarlos al WebSocket
rl.on('line', (line) => {
  if (!line.trim()) return;
  
  try {
    const message = JSON.parse(line);
    console.error(`[MCP-WS] Enviando: ${message.method || message.action}`);
    ws.send(JSON.stringify(message));
  } catch (error) {
    console.error('[MCP-WS] Error parseando entrada:', error.message);
  }
});

rl.on('close', () => {
  if (ws) ws.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  if (ws) ws.close();
  process.exit(0);
});

// Conectar al servidor
connect();
