const app = require('./app');
const { testConnection } = require('./config/db');
const { testCloudinaryConnection } = require('./services/storageService');

const PORT = process.env.PORT || 5000;

async function startServer() {
  const dbStatus = await testConnection();
  const cloudinaryStatus = await testCloudinaryConnection();

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` 🚀 StudyHub API Server running on port ${PORT}`);
    console.log(` 🌐 Health Endpoint: http://localhost:${PORT}/api/health`);
    console.log(
      ` 📦 Database:   ${
        dbStatus.connected
          ? `✅ CONNECTED (Supabase PostgreSQL - ${dbStatus.dbName})`
          : `❌ FAILED (${dbStatus.message})`
      }`
    );
    console.log(
      ` ☁️  Cloudinary: ${
        cloudinaryStatus.connected
          ? `✅ CONNECTED (Account: ${cloudinaryStatus.cloudName} | Folder: ${cloudinaryStatus.folder})`
          : `❌ FAILED (${cloudinaryStatus.message})`
      }`
    );
    console.log(`==================================================`);
  });
}

startServer();

