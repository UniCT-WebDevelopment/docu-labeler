const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  creator: String,
  completed_tasks: Number,
  ok_annotations: Number,
  missing_annotations: Number,
  total_tasks: Number,
  creation_date: String,
  content: String,
  thumbnail: String,
  public: Boolean,
  shared_users_list: [ObjectId],
  labels: [Object], // Adjust the schema based on your labels structure
}, {collection: "Projects"});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;