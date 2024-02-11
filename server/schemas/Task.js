const mongoose = require('mongoose');
const utils = require("../utils");

const taskSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    default: 'img/thumb_placeholder.jpg',
  },
  total_images: {
    type: Number,
    default: 0,
  },
  ok_annotation: {
    type: Number,
    default: 0,
  },
  missing_annotations: {
    type: Number,
    default: 0,
  },
  creation_date: {
    type: String,
    default: utils.getCurrentDate(),
  },
  last_update_date: {
    type: String,
    default: utils.getCurrentDate(),
  },
  content:  {
    type: String,
    default: "",
  },
  filedir: {
    type: String,
    default: "",
  },
  thumbnail: {
    type: String,
    default: "",
  }
}, {collection: "Tasks"});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
