// ecosystem.config.js (in project root)
module.exports = {
    apps: [{
        name: 'ecommerce-api',
        script: './backend/server.js',
        instances: 'max',           // Use all CPU cores
        exec_mode: 'cluster',       // Cluster mode for zero-downtime
        watch: false,               // Don't watch in production
        max_memory_restart: '500M',
        env: {
            NODE_ENV: 'production',
            PORT: 5000
        },

        // Auto-restart on crash
        autorestart: true,
        restart_delay: 1000,
        max_restarts: 15,

        // Logging
        error_file: './logs/error.log',
        out_file: './logs/output.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true,

        // Graceful shutdown
        kill_timeout: 5000,
        listen_timeout: 8000,

        // Zero-downtime reload settings
        wait_ready: true,
        shutdown_with_message: true
    }]
};