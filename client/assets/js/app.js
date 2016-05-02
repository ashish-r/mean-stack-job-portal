var app = angular.module('myApp', ['ngResource', 'ngRoute', 'infinite-scroll']);

app.factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});


app.factory('Job', function ($resource) {
    return $resource('/api/jobs/:jobid/:exparams', null, {
        'update': {method: 'PUT'},
        'liked': {
            method: 'GET',
            params: {
                exparams: 'liked'
            }
        }
    });
});

app.factory('UserJob', function ($resource) {
        return $resource('/api/jobs/users/:userId/jobs', null, {
            'update': {method: 'PUT'}
        });
    }
);

app.factory('MarkedJob', function ($resource) {
        return $resource('/api/jobs/users/:userId/likes/:lid', null, {
            'update': {method: 'PUT'}
        });
    }
);

app.factory('Like', function ($resource) {
        return $resource('/api/jobs/:jid/likes/:lid', null, {
            'update': {method: 'PUT'}
        });
    }
);

app.factory('Notification', function ($resource) {
        return $resource('/api/jobs/users/:userId/notifications/:nId', null, {
            'update': {method: 'PUT'}
        });
    }
);

app.factory('Comment', function ($resource) {
        return $resource('/api/jobs/:jid/comments/:cid', null, {
            'update': {method: 'PUT'}
        });
    }
);

app.controller('JobController', function ($scope, $rootScope, $http, socket, $routeParams, Job, Comment, Notification) {
    $scope.jobObject = {};
    $scope.showEditBox = [];
    if ($routeParams.jobid) {
        $scope.jobSingle = Job.get({jobid: $routeParams.jobid});
        $scope.comments = Comment.query({jid: $routeParams.jobid});

    }

    $scope.cancelpostJob = function(){
        $scope.jobObject.begin='';
        $scope.jobObject.city='';
        $scope.jobObject.description='';
        $scope.jobObject.duration='';
        $scope.jobObject.locality ='';
        $scope.jobObject.person ='';
        $scope.jobObject.price_max ='';
        $scope.jobObject.price_min ='';
        $scope.jobObject.service ='';


    }

    $scope.postJob = function () {
        var newJob = new Job();
        newJob.begin = $scope.jobObject.begin;
        newJob.city = $scope.jobObject.city;
        newJob.description = $scope.jobObject.description;
        newJob.duration = $scope.jobObject.duration;
        newJob.locality = $scope.jobObject.locality;
        newJob.person = $scope.jobObject.person;
        newJob.price_max = $scope.jobObject.price_max;
        newJob.price_min = $scope.jobObject.price_min;
        newJob.service = $scope.jobObject.service;


        newJob.$save(function (job) {
                console.log(job);
                if (!job.error) {
                    window.location = '/'
                }
            },
            function (err) {
                console.log(err);
            })
    }

    socket.on('comment', function (comment) {
        $scope.comments.unshift(comment);
    });


    // Moment js
    $rootScope.timeInWords = function (date) {
        return moment(date).fromNow();
    };

    $scope.postComment = function () {
        var newComment = new Comment();

        newComment.comment = $scope.commentBody;
        newComment.$save({jid: $routeParams.jobid}, function (comment) {
            console.log(comment);
            if (!comment.error) {
                $scope.commentBody = '';
                $scope.commentBox = '';
            }
        });


    }

    $scope.cancelComment = function () {
        $scope.commentBody = '';
        $scope.commentBox = '';
    }


    $scope.showEditBoxfunction = function(index) {
        $scope.showEditBox[index] = !$scope.showEditBox[index];
    }

//edit comment
    $scope.updateComment = function(jid, comment, index) {
        var updateComment = new Comment();
        updateComment.body = $scope.editComment;
        Comment.update({
            jid: jid,
            cid: comment._id
        }, comment, function(comment) {
            console.log(comment);
            $scope.showEditBoxfunction(index);
        }, function(err) {
            console.log(err);
        })
    }



    $scope.delComment = function (jid, comId, index) {
        Comment.remove({jid: jid, cid: comId}, function (comment, err) {
            if (comment.error) {
                console.log(err);
            }
            $scope.comments.splice(index, 1);
        });
    };

});

app.controller('UserJobController', function ($scope, $rootScope, socket, $http, $routeParams, UserJob) {
    $rootScope.jobs = UserJob.query({userId: $routeParams.userId});


});


app.controller('MarkJobController', function ($scope, $rootScope, socket, $http, $routeParams, MarkedJob, Job, Like) {
    var likeUnmark = false;
    $scope.marks = MarkedJob.query({userId: $routeParams.userId});

$rootScope.timeInWords = function (date) {
        return moment(date).fromNow();
    };

    $rootScope.delJob = function (jobId, index) {
        Job.remove({jobid: jobId}, function (job, err) {
            if (job.error) {
                console.log(err);
            }
            $scope.marks.splice(index, 1);
        });
    };

    $rootScope.postLike = function (jobid) {
        var newLike = new Like();
        newLike.$save({jid: jobid}, function (like) {
            console.log(like);

            if (!like.error) {

            }
        });
    }
});

app.controller('ViewController', function ($scope, $routeParams, $rootScope, $http, Job, socket, Like, Notification) {
    $rootScope.jobs = [];
    $scope.lastJobId = undefined;
    $scope.loadBool = false;
    $rootScope.jobs = Job.query(function(jobs) {
        for (var i in jobs) {
            if (jobs[i]._id) {
                $scope.lastJobId = jobs[jobs.length - 1]._id;
            }
        }
        $scope.loadBool = true;
    });

    //edit job
    $rootScope.editJob = function(index) {
        $rootScope.index = index;
    }

    $rootScope.updateEditJob= function(jid, job) {
        Job.update({jobid: jid}, job, function(job) {
            console.log(job);
            window.location ="/"
        }, function(err) {
            console.log(err);
        })

    }

    $rootScope.canceleditJob = function(){
        window.location ='/';
    }


    $scope.loadMore = function() {
        if (!$scope.loadBool) {
            return;
        }
        $scope.loadBool = false;
        Job.query({
            lid: $scope.lastJobId
        }, function(jobs) {
            for (var i in jobs) {
                if (jobs[i]._id) {
                    $scope.lastJobId = jobs[i]._id;
                    $rootScope.jobs.unshift(jobs[i]);
                }
            }
            $scope.loadBool = true;
        });

    };


    $http.get('/api/users/cuser')
        .success(function (currentUser) {
            $rootScope.currentUser = currentUser;
            console.log(currentUser);
            $rootScope.notifications = Notification.query({userId: $rootScope.currentUser._id}, function (data) {
                console.log(data);
            }, function (err) {
                console.log(err);
            });
            //logout function
            $rootScope.logout = function() {
                $http.get('/api/users/logout').then(function(response) {
                    window.location.reload();
                });
            }

            // Check Notifications
            $rootScope.checkNoti = function (notId, index) {
                Notification.remove({nId: notId, userId: $rootScope.currentUser._id}, function (notification, err) {
                    if (notification.error) {
                        console.log(err);
                    }
                    $scope.notifications.splice(index, 1);
                });

            };


            $rootScope.delJob = function (jobId, index) {
                Job.remove({jobid: jobId}, function (job, err) {
                    if (job.error) {
                        console.log(err);
                    }
                    $rootScope.jobs.splice(index, 1);
                });
            };


        });
  $rootScope.isLiked = function (id) {
      return Job.liked({jobid: id});
   };



    // Moment js
    $scope.timeInWords = function (date) {
        return moment(date).fromNow();
    };

    socket.on('notification', function (notification) {
        $scope.notifications.unshift(notification);
    });

    socket.on('job', function (job) {
        $rootScope.jobs.unshift(job);
    });

    $rootScope.postLike = function (jobid) {

        var newLike = new Like();
        newLike.$save({jid: jobid}, function (like) {

            if (like.error) {
                console.log(err);
            }
            console.log(like);

        });
    }

});


app.config(function ($routeProvider, $locationProvider) {
    $routeProvider

        .when('/home', {
            templateUrl: '/html/home.html',
            controller: 'ViewController'
        })
        .when('/postjob', {
            templateUrl: '/html/form.html',
            controller: 'JobController'
        })
        .when('/editjob', {
            templateUrl: '/html/formedit.html',
            controller: 'ViewController'
        })
        .when('/jobs/:jobid', {
            templateUrl: '/html/job_single.html',
            controller: 'JobController'
        })
        .when('/user/:userId/jobs', {
            templateUrl: '/html/view.html',
            controller: 'UserJobController'
        })
        .when('/user/:userId/markedjobs', {
            templateUrl: '/html/marked_view.html',
            controller: 'MarkJobController'
        })

        .otherwise({
            templateUrl: '/html/view.html',
            controller: 'ViewController'
        });

    // configure html5 to get links working on jsfiddle
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

});