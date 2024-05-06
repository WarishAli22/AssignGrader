const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const Schema = mongoose.Schema;


const contextSchema = new Schema({
  sentence_chunk: {
    type: String,
  },
  chunk_char_count: int,
  chunk_word_count: int,
  chunk_token_count: double,
  embedding: array
})

contextSchema.plugin(findOrCreate);

module.exports = mongoose.model('context', contextSchema);