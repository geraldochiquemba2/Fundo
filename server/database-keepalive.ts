import { db } from "@db";
import { sql } from "drizzle-orm";

// Função para manter o banco de dados ativo
export async function keepDatabaseAlive() {
  try {
    // Fazer uma consulta simples para manter a conexão ativa
    await db.execute(sql`SELECT 1`);
    console.log("🔄 Database keepalive ping enviado");
  } catch (error) {
    console.error("❌ Erro no keepalive ping:", error);
  }
}

// Função para iniciar o sistema de keepalive
export function startDatabaseKeepalive() {
  // Ping a cada 5 minutos para manter o banco ativo
  setInterval(keepDatabaseAlive, 5 * 60 * 1000);
  console.log("🔄 Sistema de keepalive do banco iniciado (ping a cada 5 minutos)");
}

// Ping inicial
keepDatabaseAlive();