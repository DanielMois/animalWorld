require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    console.log('Password:', process.env.DB_PASSWORD ? '***' : 'não definida');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'animalworld'
    });
    
    console.log('✅ Conexão bem-sucedida!');
    
    // Testar se o banco existe
    const [rows] = await connection.execute('SHOW DATABASES LIKE ?', [process.env.DB_NAME || 'animalworld']);
    
    if (rows.length > 0) {
      console.log('✅ Banco de dados encontrado!');
    } else {
      console.log('❌ Banco de dados não encontrado. Criando...');
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'animalworld'}`);
      console.log('✅ Banco de dados criado!');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('Código do erro:', error.code);
  }
}

testConnection(); 