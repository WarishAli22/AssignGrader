const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const Schema = mongoose.Schema;


const uploadedFileSchema = new Schema({
  filename: {
    type: String,
    required: [true, "filename Cannot Be Blank"]
  },
  fileText: String,
  userid: String,
})

uploadedFileSchema.plugin(findOrCreate);

module.exports = mongoose.model('UploadedFile', uploadedFileSchema);