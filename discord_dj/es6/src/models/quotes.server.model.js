/**
 * Created by sdonnelly on 3/4/2016.
 */
import mongoose from 'mongoose';

let Schema = mongoose.Schema;
let quoteSchema = new Schema({
  userName: String,
  quoteText: String,
  submittedDate: {type: Date, default: Date.now},
  authorName: String
});

module.exports = mongoose.model('Quotes', quoteSchema);

