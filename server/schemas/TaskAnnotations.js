const mongoose = require('mongoose');

const TaskAnnotationsSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    task_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    filenames: [String],
    filenames_info: {},
    annotations: Object
}, {collection: "TaskAnnotations"});

const TaskAnnotations = mongoose.model('TaskAnnotations', TaskAnnotationsSchema);

module.exports = TaskAnnotations;