/**
 * Created by pritish on 14-04-2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var JobSchema = new Schema({
    service: {type: String, required: true},
    city: {type: String, required: true},
    duration: {type: Number, required: true},
    person: {type: Number, required: true},
    description: {type: String, required: true},
    price_min: {type: Number, required: true},
    price_max: {type: Number, required: true},
    locality:  {type: String, required: true},
    begin: {type: Date, required: true},
    user: {type: String, required: true, ref: 'User'},
    image: {type: String},
    created_at: {type: Date, default: Date.now()}
});


module.exports = mongoose.model('Job', JobSchema);