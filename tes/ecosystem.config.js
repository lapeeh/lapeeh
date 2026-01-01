module.exports = {
  apps: [{
    name: "lapeeh-app",
    script: "./node_modules/lapeeh/bin/index.js",
    args: "start",
    instances: "max",
    exec_mode: "cluster",
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: "production",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};
