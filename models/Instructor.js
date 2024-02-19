const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InstructorSchema = new Schema({
  name: String,
  email: String,
  password: String,
})

module.exports = mongoose.model('Instructor', InstructorSchema);
