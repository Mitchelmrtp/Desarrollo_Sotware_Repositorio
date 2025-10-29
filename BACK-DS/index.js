import 'dotenv/config';
import app from './app.js';
import sequelize from './src/config/database.js';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');
    
    await sequelize.sync();
    console.log('✅ Modelos sincronizados con la base de datos.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📚 Documentación disponible en http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
  }
}

startServer();
