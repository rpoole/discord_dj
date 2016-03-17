/**
 * Created by sdonnelly on 3/7/2016.
 */
import mongoose from 'mongoose';

let Schema = mongoose.Schema;
let userSchema = new Schema({
  realName: String,
  accountName: String,
  steam64: String,
  accountID: Number
});

module.exports = mongoose.model('users', userSchema);

