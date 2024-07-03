const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
    const { title, priority, checklist, dueDate, board } = req.body;

    if (!title || !priority || !checklist || checklist.length === 0) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const task = new Task({
        title,
        priority,
        checklist,
        dueDate,
        userId: req.user._id,
        board,
    });

    const createdTask = await task.save();
    res.status(201).json({
        message: 'Task added successfully',
        task: createdTask,
    });
});

// @desc    Get tasks for a user based on filter
// @route   POST /api/tasks/gettasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    const { userId, filter } = req.body;

    const filterOptions = {
        today: {
            createdAt: {
                $gte: new Date().setHours(0, 0, 0, 0),
                $lt: new Date().setHours(23, 59, 59, 999),
            },
        },
        thisWeek: {
            createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
                $lt: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6)),
            },
        },
        thisMonth: {
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            },
        },
    };

    const tasks = await Task.find({ userId, ...filterOptions[filter] });

    res.json({ tasks });
});

// @desc    Update task board
// @route   PUT /api/tasks/updatetask/:id
// @access  Private
const updateTaskBoard = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        task.board = req.body.newBoard || task.board;

        if (req.body.newBoard === "done" && task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            if (dueDate < today) {
                task.backgroundColor = "#ffdddd"; // Light red for overdue tasks
            } else {
                task.backgroundColor = "#ddffdd"; // Light green for completed tasks
            }
        } else {
            task.backgroundColor = ""; // Default or no background color
        }

        const updatedTask = await task.save();
        res.json({
            message: 'Task updated successfully',
            task: updatedTask,
        });
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
});


// @desc    Delete a task
// @route   DELETE /api/tasks/deletetask/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
    try {
        const taskId = req.params.id;
        console.log(`Attempting to delete task with ID: ${taskId}`);

        const task = await Task.findById(taskId);

        if (task) {
            await Task.deleteOne({ _id: taskId });
            console.log(`Task with ID: ${taskId} removed`);
            res.json({ message: 'Task removed' });
        } else {
            console.log(`Task with ID: ${taskId} not found`);
            res.status(404);
            throw new Error('Task not found');
        }
    } catch (error) {
        console.error(`Error occurred while deleting task: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});


// @desc    View a shared task
// @route   GET /api/tasks/view/:token
// @access  Public
const viewSharedTask = asyncHandler(async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
        const task = await Task.findById(decoded.id);

        if (task) {
            res.json(task);
        } else {
            res.status(404);
            throw new Error('Task not found');
        }
    } catch (error) {
        res.status(400);
        throw new Error('Invalid token');
    }
});


const updateChecklistItem = asyncHandler(async (req, res) => {
    const { taskId, checklistItemId, completed } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const checklistItem = task.checklist.id(checklistItemId);
    if (!checklistItem) {
        res.status(404);
        throw new Error('Checklist item not found');
    }

    checklistItem.completed = completed;
    await task.save();

    res.json({ message: 'Checklist item updated successfully' });
});

const getTaskById = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        res.json(task);
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
});
const updateTask = asyncHandler(async (req, res) => {
    const { title, priority, checklist, dueDate, board } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
        task.title = title || task.title;
        task.priority = priority || task.priority;
        task.checklist = checklist || task.checklist;
        task.dueDate = dueDate || task.dueDate;
        task.board = board || task.board;

        const updatedTask = await task.save();
        res.json({
            message: 'Task updated successfully',
            task: updatedTask,
        });
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
});



// @desc    Get analytics data for a user
// @route   GET /api/analytics/:userId
// @access  Private
const getAnalyticsData = asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    const backlogTasks = await Task.countDocuments({ userId, board: 'backlog' });
    const todoTasks = await Task.countDocuments({ userId, board: 'toDo' });
    const inProgressTasks = await Task.countDocuments({ userId, board: 'inProgress' });
    const completedTasks = await Task.countDocuments({ userId, board: 'done' });

    const lowPriorityTasks = await Task.countDocuments({ userId, priority: 'LOW PRIORITY' });
    const moderatePriorityTasks = await Task.countDocuments({ userId, priority: 'MODERATE PRIORITY' });
    const highPriorityTasks = await Task.countDocuments({ userId, priority: 'HIGH PRIORITY' });

    const dueDateTasks = await Task.countDocuments({ userId, dueDate: { $ne: null } });

    res.json({
        backlogTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        lowPriorityTasks,
        moderatePriorityTasks,
        highPriorityTasks,
        dueDateTasks,
        getAnalyticsData
    });
});




module.exports = {
    createTask,
    getTasks,
    updateTaskBoard,
    deleteTask,
    viewSharedTask,
    updateChecklistItem,
    getTaskById,
    updateTask,
    getAnalyticsData
};
