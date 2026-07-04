const pool = require("../db");

const getAllTasks = async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await pool.query('SELECT * FROM task WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      'SELECT * FROM task WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found or not owned by user" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const userId = req.userId;

    // Verificar si ya existe una tarea con el mismo título para este usuario
    const existing = await pool.query(
      'SELECT * FROM task WHERE user_id = $1 AND title = $2',
      [userId, title]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "A task with this title already exists for this user" });
    }

    const result = await pool.query(
      'INSERT INTO task (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      'DELETE FROM task WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Task not found or not owned by user" });
    }

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.userId;

    // Verificar si el nuevo título ya existe para este usuario 
    if (title) {
      const duplicate = await pool.query(
        'SELECT * FROM task WHERE user_id = $1 AND title = $2 AND id != $3',
        [userId, title, id]
      );
      if (duplicate.rows.length > 0) {
        return res.status(400).json({ message: "A task with this title already exists for this user" });
      }
    }

    const result = await pool.query(
      'UPDATE task SET title = COALESCE($1, title), description = COALESCE($2, description) WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, description, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found or not owned by user" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTasks,
  getTask,
  createTask,
  deleteTask,
  updateTask,
};