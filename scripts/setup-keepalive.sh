#!/bin/bash

# Script para configurar keepalive da base de dados Supabase
# Este script configura um cron job para manter o banco ativo

echo "🔧 Configurando keepalive para manter a base de dados Supabase ativa..."

# URL do seu projeto Replit (substitua pelo seu)
HEALTH_ENDPOINT="https://your-project-name.repl.co/health"

# Configurar cron job para executar a cada 5 minutos
# Adiciona uma entrada no crontab se não existir
CRON_JOB="*/5 * * * * curl -s $HEALTH_ENDPOINT > /dev/null 2>&1"

# Verificar se o cron job já existe
if ! crontab -l 2>/dev/null | grep -q "$HEALTH_ENDPOINT"; then
    # Adicionar o cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ Cron job configurado para executar a cada 5 minutos"
else
    echo "ℹ️ Cron job já existe"
fi

echo "🔄 Status atual do cron:"
crontab -l 2>/dev/null | grep -E "(curl|health)" || echo "Nenhum cron job encontrado"

echo ""
echo "📋 Instruções para uso:"
echo "1. Substitua 'your-project-name' pela URL real do seu projeto Replit"
echo "2. Execute este script: bash scripts/setup-keepalive.sh"
echo "3. Verifique se está funcionando: curl https://your-project-name.repl.co/health"
echo ""
echo "🌐 Serviços externos gratuitos recomendados:"
echo "- UptimeRobot (https://uptimerobot.com) - 50 monitores gratuitos"
echo "- StatusCake (https://www.statuscake.com) - 10 monitores gratuitos"
echo "- Pingdom (https://www.pingdom.com) - 1 monitor gratuito"