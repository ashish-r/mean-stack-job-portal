/**
 * Created by codea on 25-04-2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationSchema = new Schema ({
    userfrom: {type: String, required: true, ref: 'User'},
    userto: {type: String, required: true, ref: 'User'},
    created_at: {type: Date, default: Date.now()},
    job: {type: String, required: true, ref: 'Job'},
});



module.exports = mongoose.model('Notification', NotificationSchema);