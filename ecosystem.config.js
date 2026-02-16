module.exports = {
  apps: [{
    name: 'hivemind',
    script: 'node_modules/.bin/next',
    args: 'start -H 127.0.0.1',
    cwd: '/home/openclaw/.openclaw/workspace/hivemind',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '512M',
    watch: false,
    autorestart: true,
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: '/home/openclaw/.pm2/logs/hivemind-error.log',
    out_file: '/home/openclaw/.pm2/logs/hivemind-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }],
};
