const Router = require('express')
const router = new Router()
const todoController = require('../controller/todo.controller')

router.use((req, res, next) => {
    req.userId = req.session.user ? req.session.user.id : null; 
    // Получаем userId из сессии
    next();
  });
  
router.post('/todo', todoController.createTodo)
router.get('/todo', todoController.getTodos)
router.put('/todo/:id', todoController.updateTodo)
router.delete('/todo/:id', todoController.deleteTodo)

module.exports = router