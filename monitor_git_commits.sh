#!/bin/bash

# Configuração
REPO_DIR="/Users/wilsonclaudianodacosta/Downloads/ACADEMIA APP"
LAST_COMMIT_FILE="$REPO_DIR/.git_monitor_last_commit"
TELEGRAM_TARGET="Will Wilson Claudiano da Costa" # Nome ou ID do usuário/grupo no OpenClaw config

cd "$REPO_DIR" || exit 1

# Pega o hash do último commit atual
CURRENT_COMMIT=$(git rev-parse HEAD)

# Verifica se é a primeira execução ou se houve mudança
if [ ! -f "$LAST_COMMIT_FILE" ]; then
    echo "$CURRENT_COMMIT" > "$LAST_COMMIT_FILE"
    echo "Monitoramento iniciado. Commit atual: $CURRENT_COMMIT"
    exit 0
fi

LAST_COMMIT=$(cat "$LAST_COMMIT_FILE")

if [ "$CURRENT_COMMIT" != "$LAST_COMMIT" ]; then
    # Houve novos commits!
    # Pega os detalhes dos commits novos
    NEW_COMMITS=$(git log --pretty=format:"• %h - %s (%an)" "$LAST_COMMIT"..HEAD)
    
    # Prepara a mensagem
    MESSAGE="🚀 *Novos Commits Detectados (Antigravity/Equipe)*%0A%0A$NEW_COMMITS"
    
    # Envia via OpenClaw CLI (assumindo que o comando 'openclaw' esteja no PATH ou acessível)
    # Como o comando 'openclaw' não está no PATH do agente, vou tentar o caminho absoluto ou apenas logar por enquanto.
    # Mas como o objetivo é enviar Telegram, vou usar a ferramenta 'message' do agente se eu pudesse chamar ferramentas daqui.
    # Como este é um script bash externo, ele precisa de acesso à API do OpenClaw ou similar.
    
    # WORKAROUND: Vou salvar um arquivo de "evento" que o OpenClaw pode ler via Cron ou Heartbeat.
    echo "$MESSAGE" > "$REPO_DIR/.openclaw_pending_notification.txt"

    # Atualiza o arquivo de controle
    echo "$CURRENT_COMMIT" > "$LAST_COMMIT_FILE"
fi
