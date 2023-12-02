const express = require('express');
const session = require('express-session');
const pool = require('./db')
const bcrypt = require('bcryptjs');
const corsMiddleware = require('./middleware/cors.middleware');
const userRouter = require('./route/user.router')
const todoRouter = require('./route/todo.router')

const app = express();
app.use(express.json());
app.use(corsMiddleware);
app.use("/api", userRouter);
app.use("/api", todoRouter);

// Настройка сессии
app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: true,
}));

// Класс для регистрации пользователя с хэшированием пароля
class Registration {
  async registerUser(username, email, password) {
    try {
      // Хэширование пароля перед сохранением в базе данных
      const hashedPassword = await bcrypt.hash(password, 10);

      // Добавляем пользователя в базу данных
      const query = 'INSERT INTO person (username, email, password) VALUES ($1, $2, $3)';
      const values = [username, email, hashedPassword];
      await pool.query(query, values);
      return true;
    } catch (error) {
      throw new Error(`Ошибка при регистрации: ${error.message}`);
    }
  }
}

// Класс для аутентификации пользователя
class Authentication {
  async authenticateUser(email, password) {
    try {
      // Извлекаем хэшированный пароль из базы данных по email
      const query = 'SELECT id, password FROM person WHERE email = $1';
      const result = await pool.query(query, [email]);

      if (result.rows.length > 0) {
        const hashedPassword = result.rows[0].password;

        // Проверяем соответствие хэшированного пароля и введенного пароля
        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (passwordMatch) {
          return result.rows[0].id; // Возвращаем ID пользователя при успешной аутентификации
        }
      }
      return false;
    } catch (error) {
      throw new Error(`Ошибка при аутентификации: ${error.message}`);
    }
  }
}

// Создание таблиц бд
async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS person (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS todo (
        id SERIAL PRIMARY KEY,
        title VARCHAR(50),
        content VARCHAR(200) NOT NULL,
        user_id INT NOT NULL REFERENCES person(id)
      );
    `);
    console.log('Таблицы созданы');
  } catch (error) {
    console.error('Ошибка при создании таблиц:', error);
  }
}
createTables();

// Пример использования классов Registration и Authentication
const registration = new Registration();
const authentication = new Authentication();

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    await registration.registerUser(username, email, password);
    res.status(200).send('Пользователь зарегистрирован');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userId = await authentication.authenticateUser(email, password);
    if (userId) {
      req.session.user = { id: userId }; // Сохраняем ID пользователя в сессии
      res.status(200).send(`Вы успешно авторизовались ${userId}`);
      //res.redirect('/api/todo')
    } else {
      res.status(401).send('Неверные учетные данные');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

class SessionManager {
    constructor() {}
  
    logout(req, res) {
      req.session.destroy((err) => {
        if (err) {
          res.status(500).send('Ошибка разлогинивания');
        } else {
          res.clearCookie('connect.sid');
          res.status(200).send('Вы успешно разлогинились');
        }
      });
    }
  }
  
  const sessionManager = new SessionManager();
  
  app.post('/logout', (req, res) => {
    sessionManager.logout(req, res);
  });

app.listen(5000, () => {
  console.log('Сервер запущен на порту 5000');
});
