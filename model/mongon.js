/**
 * Created by jack on 10/8/16.
 */
var mongoose = require('mongoose');
var credentials = require('../lib/credentials');

mongoose.connect(credentials.mongo.development.connectString);

var Schema = mongoose.Schema;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    //succeed
});

//books schema
var booksSchema = new Schema({
    uid: String,
    title: String,
    author: String,
    press: String,
    pressDate: String,
    isbn: String,
    summary: String,
    bookstatus: {
        num: Number,
        saveNum: Number,
        availNum: Number,
        unavail: {
            num: Number,
            status: []
        }
    }
});


//userprofile
var userinfo = new Schema({
    uid: String,
    avar: String,
    telNum: String,
    IMIE: String
});


//向外界提供接口
exports.booksSchema = mongoose.model('booksSchema', booksSchema);

// exports.userprofile = mongoose.model('userprofile', userinfo);

