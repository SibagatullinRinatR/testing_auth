function cors (req, res, next){
    res.header('Access-Control-Allow-Origin', '*'); // Разрешить доступ с любого источника
    res.header('Access-Control-Allow-Headers', 'Content-Type'); // Разрешить определенные заголовки
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Разрешить определенные HTTP методы
    next();
  }
  module.exports =cors