const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const Schema = mongoose.Schema;


const RubricSchema = new Schema({
  question: {
    type: String,
    required: [true, "question Cannot Be Blank"]
  },
  levels: [{
    type: Array,
    criteria: String,
    mark: String
  }],
  context: {
    type: String,
  }
})

RubricSchema.plugin(findOrCreate);

module.exports = mongoose.model('Rubric', RubricSchema);