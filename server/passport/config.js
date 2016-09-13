var User = require('../models/user');
var FacebookStrategy = require('passport-facebook').Strategy;
module.exports = {
    deserialize: function(id, done) {
        User.findOne({
            _id: id
        }, function(err, user) {
            done(err, user);
        })
    },
    serialize: function(user, done) {
        done(null, user._id);
    },
    facebookStrategy: new FacebookStrategy({
        clientID: '271757209831174',
        clientSecret: 'f220b7b975fb118c828a78bc48363190',
        callbackURL: "https://freelancer-mean-stack.herokuapp.com/api/users/facebook/callback",
        profileFields: ['id', 'displayName', 'picture', 'emails', 'gender', 'about', 'bio']
    }, function(accessToken, refreshToken, profile, cb) {
        var error = {error: 'Could not log in'};
        console.log(profile);
        User.findOne({id: profile.id}, function(err, user){

            if(err){
                return res.send(error);
            }

            if(user){
                var sendUser = {};
                sendUser.type = 'Old user';
                sendUser.user = user;
                return cb(sendUser);
            }

            var newUser = new User();
            newUser.id = profile.id;
            newUser.name = profile.displayName;
            newUser.gender = profile.gender;
            newUser.profile_pic = profile.photos[0].value;
            newUser.save(function(err, user){
                if(err || !user){
                    console.log(err);
                    return cb(error);
                }

                var sendUser = {};
                sendUser.type = 'New user';
                sendUser.user = user;
                return cb(sendUser);

            });

        });

    })
};
