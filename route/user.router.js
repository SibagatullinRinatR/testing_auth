const Router = require('express')
const router = new Router()
const userController = require('../controller/user.controller')

router.use((req, res, next) => {
    console.log(req.session);
    //req.userId = req.session.user ? req.session.user.id : null; 
    // Получаем userId из сессии
    next();
  });
router.put('/user', userController.updateUser)
router.delete('/user/:id', userController.deleteUser)

module.exports = router