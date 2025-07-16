# Como Manter a Base de Dados Supabase Sempre Ativa

## 🎯 Problema
O Supabase no plano gratuito "hiberna" a base de dados após 7 dias de inatividade. Embora os dados nunca sejam perdidos, a primeira consulta após a hibernação pode demorar alguns segundos.

## ✅ Soluções Implementadas

### 1. Sistema Automático Interno
**Já configurado na aplicação:**
- ✅ Ping automático a cada 5 minutos
- ✅ Health check endpoint: `/health`
- ✅ Logs de monitoramento no console

### 2. Endpoint de Health Check
```bash
curl https://your-project-name.repl.co/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-16T15:45:37.621Z",
  "database": "active"
}
```

### 3. Serviços Externos Gratuitos

#### A. UptimeRobot (Recomendado)
- **Limite**: 50 monitores gratuitos
- **Frequência**: A cada 5 minutos
- **Setup**: 
  1. Cadastre-se em https://uptimerobot.com
  2. Crie um monitor HTTP/HTTPS
  3. URL: `https://your-project-name.repl.co/health`
  4. Intervalo: 5 minutos

#### B. StatusCake
- **Limite**: 10 monitores gratuitos
- **Frequência**: A cada 5 minutos
- **Setup**: Similar ao UptimeRobot

#### C. Pingdom
- **Limite**: 1 monitor gratuito
- **Frequência**: A cada 1 minuto
- **Setup**: Similar ao UptimeRobot

### 4. Cron Job Local (Opcional)
```bash
# Adicionar ao crontab
*/5 * * * * curl -s https://your-project-name.repl.co/health > /dev/null 2>&1
```

## 🔧 Configuração Manual

### Passo 1: Obter URL do Projeto
1. Vá para o seu projeto no Replit
2. Clique em "Run" se não estiver rodando
3. A URL aparecerá no formato: `https://your-project-name.repl.co`

### Passo 2: Configurar Monitor Externo
1. Escolha um serviço (UptimeRobot recomendado)
2. Configure para monitorar: `https://your-project-name.repl.co/health`
3. Defina intervalo de 5 minutos

### Passo 3: Verificar Funcionamento
```bash
# Teste o endpoint
curl https://your-project-name.repl.co/health

# Deve retornar JSON com status "ok"
```

## 📊 Monitoramento

### Logs da Aplicação
```
🔄 Database keepalive ping enviado
🔄 Sistema de keepalive do banco iniciado (ping a cada 5 minutos)
```

### Verificação Manual
```bash
# Verificar se o banco está ativo
curl -s https://your-project-name.repl.co/api/sdgs | head -n 1

# Deve retornar dados JSON dos SDGs
```

## ⚠️ Dicas Importantes

1. **Não exagere na frequência**: 5 minutos é suficiente
2. **Use apenas o endpoint /health**: Não sobrecarregue APIs de dados
3. **Configure notificações**: Use alertas dos serviços para saber se algo parar
4. **Monitore o consumo**: Verifique se não está ultrapassando limites

## 🔄 Status Atual

✅ **Sistema interno funcionando**
✅ **Endpoint /health disponível**
✅ **Ping automático a cada 5 minutos**
✅ **Logs de monitoramento ativos**

## 🎯 Próximos Passos

1. Configure um monitor externo (UptimeRobot recomendado)
2. Substitua `your-project-name` pela URL real do seu projeto
3. Teste o endpoint `/health` regularmente
4. Configure alertas para ser notificado se algo parar

## 📝 Suporte

Se precisar de ajuda, verifique:
- Logs do console da aplicação
- Resposta do endpoint `/health`
- Status dos monitores externos
- Conexão com a base de dados Supabase