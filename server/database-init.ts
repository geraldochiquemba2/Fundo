import { db } from '@db';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
  console.log('🗄️ Verificando conexão com o banco de dados...');
  
  try {
    // Teste de conexão simples
    await db.execute(sql`SELECT 1`);
    console.log('✅ Banco de dados conectado com sucesso!');
    
    // Verificar se as tabelas existem
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'companies', 'sdgs', 'projects')
    `);
    
    if (result.rows.length < 4) {
      console.log('⚠️ Algumas tabelas não foram encontradas. Execute npm run db:push para criar o schema.');
    } else {
      console.log('✅ Todas as tabelas principais estão presentes no banco.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com o banco de dados:', error);
    console.log('💡 Dica: Execute npm run db:push para configurar o banco de dados.');
    return false;
  }
}

export async function ensureDatabaseReady() {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    const isReady = await initializeDatabase();
    if (isReady) {
      return true;
    }
    
    retries++;
    console.log(`🔄 Tentativa ${retries}/${maxRetries} de conexão com o banco...`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2 segundos
  }
  
  console.error('❌ Não foi possível estabelecer conexão com o banco após múltiplas tentativas.');
  return false;
}