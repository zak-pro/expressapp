var express = require('express');
var router = express.Router();
var mongoose = require('libs/mongoose');
var async = require('async');
mongoose.set('debug', true);
var User = require('models/user').User;
var db = mongoose.connection;


router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});


router.get('/users', function (req, res, next) {
    //res.render('index');
    //res.status(status).send("Hello");
    //res.send("SERVER WORKING!");
    console.log(req.method);
    User.find({}, function(err, users) {
        console.log("Number of users into DB: " + users.length);
        console.log("Users: " + users);
        res.json(users);
    });
});
router.get('/drop', function (req,res) {
    var db = mongoose.connection.db;
    db.dropDatabase(function () {
        console.log("drop+")
    });

});



//Load progress or new user registration
router.post('/api/download/:id', function (req, res) {
    var id = req.params.id
    var userprogress = req.body.userclass;
    console.log("JSON from client " + userprogress + "\n");

    var jsonContent = JSON.parse(userprogress); // Парсинг JSON полученного от клиента
    console.log("Username: " + id + "\n");

    async.waterfall([
        function (callback) {
            User.findById({_id: id }, callback);
        },
        function (user, callback) {
            if (user){
                console.log("User founded!");
                callback(null, user);
            }
            else {
                console.log("User not found!");
                var user = new User({_id: id
                    , playerName: jsonContent.playerName
                    , level: jsonContent.level
                    , expirience: jsonContent.expirience
                    , mass: jsonContent.mass
                });
                user.save(function (err)
                {
                    if (err) {
                        res.send(500);
                    }
                    else {
                        console.log("New user was save");
                        res.send(200);
                    }
                    //callback(null, user);
                });
            }
        }
    ], function (err, user) {
        if (err) {
            res.send(500);
        }
        else {
            var _timeSpan = Date.now() - user.closetime;
            User.findByIdAndUpdate(id, {$set:  {timeSpan: _timeSpan}}, {new: true}, function (err, user) {
                res.json(user);
                console.log("UPDATED");
            });
        }
    });
});
//save user progress
router.post('/api/save/:id', function (req, res) {
    var id = req.params.id;
    var userprogress = req.body.userclass;
    console.log("JSON from client " + userprogress + "\n");

    var jsonContent = JSON.parse(userprogress); // Парсинг JSON полученного от клиента

    User.findByIdAndUpdate(id, {$set:{
            playerName: jsonContent.playerName
            ,level: jsonContent.level
            ,expirience: jsonContent.expirience
            ,mass: jsonContent.mass
            ,operatingSystem: jsonContent.operatingSystem}}
        ,{new: true}, function (err, user) {
            if (err) {
                res.send(500);
            }
            else {
                console.log("UPDATED");
                res.send(200);
            }
        });
});
//save user progress on close application
router.post('/api/close/:id', function (req, res) {
    var id = req.params.id;
    var userprogress = req.body.userclass;
    console.log("JSON from client " + userprogress + "\n");

    var jsonContent = JSON.parse(userprogress); // Парсинг JSON полученного от клиента

    User.findByIdAndUpdate(id, {$set:{playerName: jsonContent.playerName
            ,level: jsonContent.level
            ,expirience: jsonContent.expirience
            ,mass: jsonContent.mass
            ,closetime: Date.now()}}
        ,{new: true}, function (err, user) {
            if (err) {
                res.send(500);
            }
            else {
                console.log("UPDATED");
                res.send(200);
            }
        });
});

router.post('/api/update/:id', function (req, res) {
    console.log(req.body);

});
module.exports = router;

