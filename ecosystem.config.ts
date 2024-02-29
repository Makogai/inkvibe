module.exports = {
  apps: [{
    name: 'AdonisAPI',
    script: 'server.js',
    cwd: './build', // Set current working directory to 'build'
    env: {
      NODE_ENV: 'production',
      // Include other necessary environment variables here, such as APP_KEY
    },
    exec_mode: 'cluster', // Optional: Run in cluster mode
    instances: 'max', // Optional: Max instances to take advantage of multi-core systems
    autorestart: true,
    watch: false, // Do not restart on file changes in production
    max_memory_restart: '1G', // Optional: Restart the app if it exceeds 1G of memory usage
  }]
};
