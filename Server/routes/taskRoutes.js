const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTaskBoard, deleteTask,  viewSharedTask,updateChecklistItem,getTaskById, updateTask,getAnalyticsData } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.post('/addtask', protect, createTask);
router.post('/gettasks', protect, getTasks);
router.put('/updatetask/:id', protect, updateTaskBoard);
router.delete('/deletetask/:id', protect, deleteTask);

router.get('/view/:token', viewSharedTask);
router.post('/updatechecklist', protect, updateChecklistItem);
router.get('/:id', protect, getTaskById);
router.put('/:id', protect, updateTask);
router.get('/analytics/:userId', protect, getAnalyticsData);

module.exports = router;
