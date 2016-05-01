/**
 * Created by MUNAZIR AHSAN on 21-04-2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema ({
    body: {type: String, required: true},
    user: {type: String, required: true, ref: 'User'},
    created_at: {type: Date, default: Date.now()},
    job: {type: String, required: true, ref: 'Job'},
});



module.exports = mongoose.model('Comment', CommentSchema);
