# 🚀 Guia Completo: Migração para Vercel

## 📋 Passo a Passo Detalhado

### **1. Criar Conta no Vercel**
```
1. Vá para: https://vercel.com
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub" (recomendado)
4. Autorize o Vercel a acessar seus repositórios
```

### **2. Preparar o Projeto**
```
✅ Arquivos já criados:
- vercel.json (configuração do Vercel)
- package.json.vercel (dependências otimizadas)
- Todos os dados do projeto mantidos
```

### **3. Fazer Upload para GitHub**
```
1. Criar repositório no GitHub:
   - Vá para github.com
   - Clique em "New repository"
   - Nome: "fundo-verde"
   - Descrição: "Plataforma de Sustentabilidade"
   - Público ou Privado (sua escolha)
   - Clique "Create repository"

2. Fazer upload dos arquivos:
   - Baixe todos os arquivos do Replit
   - Faça upload para o GitHub
   - Ou use Git commands (se souber)
```

### **4. Deploy no Vercel**
```
1. No Vercel Dashboard:
   - Clique "New Project"
   - Selecione seu repositório "fundo-verde"
   - Clique "Import"

2. Configurar Environment Variables:
   - DATABASE_URL: [sua URL do Supabase]
   - SESSION_SECRET: [qualquer string segura]
   - NODE_ENV: production
```

### **5. Migração dos Dados**
```
✅ Seus dados já estão seguros:
- Base de dados Supabase (não muda)
- 17 SDGs
- 3 projetos
- 12 empresas
- 15 usuários
- Todas as imagens e uploads
```

## 🔧 Configuração Técnica

### **Environment Variables no Vercel:**
```env
DATABASE_URL=postgresql://[seu-usuario]:[sua-senha]@[seu-host].supabase.co:5432/postgres
SESSION_SECRET=seu-secret-muito-seguro-aqui
NODE_ENV=production
```

### **Build Commands:**
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### **Estrutura de Arquivos:**
```
fundo-verde/
├── client/          # Frontend React
├── server/          # Backend Express
├── db/             # Database scripts
├── shared/         # Schemas compartilhados
├── docs/           # Documentação
├── vercel.json     # Configuração Vercel
├── package.json    # Dependências
└── README.md       # Documentação
```

## 📊 Comparação: Replit vs Vercel

| Aspecto | Replit | Vercel |
|---------|---------|---------|
| **Custo** | Pago para 24/7 | Gratuito |
| **Uptime** | 99% (pago) | 99.9% |
| **Velocidade** | Boa | Excelente |
| **SSL** | Incluído | Incluído |
| **Domínio** | .repl.co | .vercel.app |
| **Escalabilidade** | Limitada | Automática |
| **Backup** | Manual | Automático |

## 🎯 Benefícios da Migração

### **Imediatos:**
- ✅ Site funciona 24/7 gratuitamente
- ✅ Velocidade muito melhor
- ✅ SSL automático
- ✅ CDN global
- ✅ Backup automático

### **Longo Prazo:**
- ✅ Escalabilidade automática
- ✅ Monitoramento integrado
- ✅ Analytics detalhados
- ✅ Domínio personalizado fácil
- ✅ Suporte profissional

## 🗂️ Checklist de Migração

### **Antes da Migração:**
- [ ] Fazer backup dos dados
- [ ] Anotar URL do Supabase
- [ ] Criar conta no GitHub
- [ ] Criar conta no Vercel

### **Durante a Migração:**
- [ ] Upload dos arquivos
- [ ] Configurar environment variables
- [ ] Testar o deploy
- [ ] Verificar funcionalidades

### **Após a Migração:**
- [ ] Atualizar UptimeRobot com nova URL
- [ ] Testar todas as funcionalidades
- [ ] Informar clientes sobre nova URL
- [ ] Configurar domínio personalizado (opcional)

## 🔄 Processo de Backup

### **Dados Seguros:**
```
✅ Base de dados Supabase
   - Mantém todos os dados
   - Mesmo DATABASE_URL
   - Sem perda de informação

✅ Arquivos de upload
   - Copiar pasta uploads/
   - Manter estrutura
   - Funciona automaticamente

✅ Configurações
   - Exportar environment variables
   - Manter secrets seguros
   - Configurar no Vercel
```

## 🚀 URL Final

Após a migração, você terá:
```
https://fundo-verde.vercel.app
```

Ou com domínio personalizado:
```
https://fundoverde.co.ao
```

## 📞 Suporte

Se precisar de ajuda:
1. **Documentação Vercel:** https://vercel.com/docs
2. **Comunidade:** https://github.com/vercel/vercel/discussions
3. **Suporte direto:** support@vercel.com

## 🎉 Resultado Final

Sua plataforma Fundo Verde terá:
- ✅ Disponibilidade 24/7
- ✅ Velocidade otimizada
- ✅ Todos os dados preservados
- ✅ Custo zero
- ✅ Escalabilidade automática
- ✅ Backup automático
- ✅ Monitoramento incluído

## 🔧 Troubleshooting

### **Problema: Build falha**
```
Solução: Verificar package.json
Comando: npm run build
```

### **Problema: Environment variables**
```
Solução: Configurar no Vercel Dashboard
Ir em: Settings > Environment Variables
```

### **Problema: Database não conecta**
```
Solução: Verificar DATABASE_URL
Testar: npx drizzle-kit push
```