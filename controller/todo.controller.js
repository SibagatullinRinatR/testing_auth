const pool = require('../db');
const session = require('express-session');
class TodoController{
    async createTodo(req, res){
        try {
            const {title, content} = req.body;
            const userId = req.session.user.id;
            const newTodo = await pool.query(`INSERT INTO todo (title, content, user_id) VALUES ($1, $2, $3) RETURNING *`, 
            [title, content, userId])
            res.json(newTodo.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        } 
    }
    async getTodos(req, res){
        try {
            const todos = await pool.query(`SELECT * FROM todo`)
        res.json(todos.rows)
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
        
    }
    async updateTodo(req, res){
        try{
            const {id} = req.params
            const {title, content} = req.body
            const userId = req.session.user.id;
            const updateTodo = await pool.query(`UPDATE todo SET title = $1, content =$2 WHERE id = $3 AND user_id = $4 RETURNING *`, 
            [title, content, id, userId])
            res.json(user.rows[0])
        }catch(err){
            res.status(500).json({ error: error.message });
    }}
    async deleteTodo(req, res){
        try{
            const {id} = req.params
            const userId = req.session.user.id;
            const user = await pool.query(`DELETE FROM todo WHERE id = $1 AND user_id = $4`, 
            [id, userId])
            res.json(user.rows[0])
        }catch(err){}
        
    }
}

module.exports = new TodoController()