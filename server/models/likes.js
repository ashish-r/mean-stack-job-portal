var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LikeSchema = new Schema ({
    user: {type: String, required: true, ref: 'User'},
    liked_at: {type: Date, default: Date.now()},
    job: {type: String, required: true, ref: 'Job'},
});



module.exports = mongoose.model('Like', LikeSchema);