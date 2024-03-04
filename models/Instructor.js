const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
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
  }
})

InstructorSchema.plugin(findOrCreate);

module.exports = mongoose.model('Instructor', InstructorSchema);