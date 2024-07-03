const mongoose = require('mongoose');

const checklistItemSchema = mongoose.Schema({
    taskName: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const taskSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        required: true,
    },
    checklist: [checklistItemSchema],
    dueDate: {
        type: Date,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    board: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
