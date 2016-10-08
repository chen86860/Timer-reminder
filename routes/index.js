var express = require('express');
var request = require("request");
var cheerio = require("cheerio");
var credentials = require('../lib/credentials');
var booksSchema = require('../model/mongon').booksSchema
var nodemailer = require('nodemailer');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
    booksSchema.find({},function (err,result) {
        res.render("index",{
            title:result
        })
    })
    // res.render("index", {
    //     Title: book.Title,
    //     Author: book.Author,
    //     Press: book.Press,
    //     PressDate: book.PressDate,
    //     Num: book.Num,
    //     SaveNum: book.SaveNum,
    //     AvailNum: book.AvailNum,
    //     // UnavailNum: book.Unavail.num,
    //     // UnavailStatus: book.Unavail.status
    // })

})

module.exports = router