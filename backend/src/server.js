const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` 🚀 StudyHub API Server running on port ${PORT}`);
    console.log(` 🌐 Health Endpoint: http://localhost:${PORT}/api/health`);
    console.log(`==================================================`);
  });
}

startServer();
