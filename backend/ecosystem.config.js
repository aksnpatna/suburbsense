module.exports = {
  apps: [{
    name: "suburbsense-backend",
    script: "../backend_env/bin/uvicorn",
    args: "main:app --host 0.0.0.0 --port 8888",
    cwd: "/home/aksai/projects/utility_hub/backend",
    interpreter: "none",
    env: {
      NODE_ENV: "production",
    }
  }, {
    name: "suburbsense-frontend",
    script: "node",
    args: "server.js",
    cwd: "/home/aksai/projects/utility_hub/frontend",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}
