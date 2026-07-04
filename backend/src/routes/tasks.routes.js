const { Router } = require('express');
const {
    getAllTasks,
    getTask,
    createTask,
    deleteTask,
    updateTask,
} = require('../controllers/tasks.controller');
const verifyToken = require('../middleware/auth');

const router = Router();

router.use(verifyToken);

router.get('/tasks', getAllTasks);
router.get('/tasks/:id', getTask);
router.post('/tasks', createTask);
router.delete('/tasks/:id', deleteTask);
router.put('/tasks/:id', updateTask);

module.exports = router;