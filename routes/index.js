var express = require('express');
var request = require("request");
var cheerio = require("cheerio");
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
    var url = 'http://lib.wyu.edu.cn/opac/bookinfo.aspx?ctrlno=545068'
    request(url,function (error,response,body) {
        if(!error &&(response.statusCode==200)){
            // TODO
            var $ = cheerio.load(body,{
                decodeEntities: true
            })
            var bookexistNum = $('#bardiv div table tbody').find('tr').length
            // var bookexistNum = $('#bardiv div table tbody').find('tr').find('td')[5]
            var bookUsableNum = 0
            // for (let n=0;n<bookexistNum;n++){
            //
            // }

            console.log($('#bardiv div table tbody').find('tr').find('td').toArray())
            res.render("index", {body: $('#bardiv div table tbody').find('tr').find('td')})
        }
    })
    // request('http://lib.wyu.edu.cn/opac/bookinfo.aspx?ctrlno=545068', function (error, response, body) {
    //     if (!error && response.statusCode == 200) {
    //         res.render("index", {body: body})
    //     }
    // })

});

module.exports = router;
