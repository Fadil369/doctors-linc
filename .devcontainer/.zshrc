# Path to oh-my-zsh installation
export ZSH="$HOME/.oh-my-zsh"

# Theme
ZSH_THEME="robbyrussell"

# Plugins
plugins=(git docker docker-compose npm node typescript vscode)

source $ZSH/oh-my-zsh.sh

# Custom prompt
PROMPT='🏥 %{$fg[cyan]%}doctors-linc%{$reset_color%} %{$fg[yellow]%}%~%{$reset_color%} $(git_prompt_info)
%{$fg[green]%}➜%{$reset_color%} '

# Aliases
alias ll='ls -lah'
alias gs='git status'
alias gd='git diff'
alias gl='git log --oneline --graph --decorate'
alias dc='docker-compose'
alias npm-dev='npm run dev'
alias npm-test='npm test'
alias db-connect='psql postgresql://postgres:postgres@localhost:5432/doctors_linc'

# Environment
export NODE_ENV=development
export EDITOR=vim

# Node.js optimization
export NODE_OPTIONS="--max-old-space-size=4096"

# Helpful functions
function ocr-test() {
    echo "🔍 Running OCR test on $1..."
    npm run ocr:test -- --image="$1"
}

function db-reset() {
    echo "🔄 Resetting database..."
    psql postgresql://postgres:postgres@localhost:5432/postgres -c "DROP DATABASE IF EXISTS doctors_linc;"
    psql postgresql://postgres:postgres@localhost:5432/postgres -c "CREATE DATABASE doctors_linc;"
    psql postgresql://postgres:postgres@localhost:5432/doctors_linc -f .devcontainer/init-db.sql
    echo "✅ Database reset complete!"
}

function show-env() {
    echo "📋 Environment Variables:"
    echo "  NODE_ENV: $NODE_ENV"
    echo "  DATABASE_URL: $DATABASE_URL"
    echo "  REDIS_URL: $REDIS_URL"
}

# Welcome message
echo ""
echo "🏥 Welcome to Doctors-Linc Development Environment!"
echo "📚 Type 'show-env' to see environment variables"
echo "🔧 Type 'db-reset' to reset the database"
echo ""
