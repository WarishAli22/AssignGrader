const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InstructorSchema = new Schema({
  name: {
    type: String,
    required: [true, "Username Cannot Be Blank"]
  },
  email: {
    type: String,
    required: [true, "Email Cannot Be Blank"]
  },
  password: {
    type: String,
    required: [true, "Password Cannot Be Blank"]
  },
})

module.exports = mongoose.model('Instructor', InstructorSchema);
