var express = require('express');
var request = require("request");
var cheerio = require("cheerio");
var credentials = require('../lib/credentials');
var nodemailer = require('nodemailer');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
    var url = 'http://lib.wyu.edu.cn/opac/bookinfo.aspx?ctrlno=545068'
    request(url, function (error, response, body) {
        if (!error && (response.statusCode == 200)) {
            // TODO
            var $ = cheerio.load(body, {
                decodeEntities: true
            });

            var book = {
                Title: $("#ctl00_ContentPlaceHolder1_bookcardinfolbl")[0].childNodes[0].data.trim().split('／')[0],
                Author: $("#ctl00_ContentPlaceHolder1_bookcardinfolbl")[0].childNodes[0].data.trim().split('／')[1].split("．")[0],
                Press: $("#ctl00_ContentPlaceHolder1_bookcardinfolbl")[0].childNodes[1].text || "暂时无法获取数据",
                PressDate: $("#ctl00_ContentPlaceHolder1_bookcardinfolbl")[0].childNodes[2].data.substr(1),
                Num: $('#bardiv div table tbody').find('tr').length,
                SaveNum: 0,
                AvailNum: 0,
                Unavail: {
                    num: 0,
                    status: []
                }
            };

            (function () {
                for (var n = 0; n < book.Num; n++) {
                    if ($('#bardiv div table tbody').find('tr').find('td').toArray()[5 + n * 7].childNodes[0].data.trim() == "可供出借") {
                        book.AvailNum++
                    } else if ($('#bardiv div table tbody').find('tr').find('td').toArray()[5 + n * 7].childNodes[0].data.trim() == "仅供阅览") {
                        book.SaveNum++
                    } else {
                        book.Unavail.num++
                        book.Unavail.status.push($('#bardiv div table tbody').find('tr').find('td').toArray()[5 + n * 7].childNodes[0].data.trim())
                    }
                }
            })();

            console.log("书籍详情\n--------------------------------");
            console.log("《" + book.Title + "》" + "  " + book.Author + "  " + book.Press + "  " + book.PressDate);
            console.log("馆藏数目:" + book.Num);
            console.log("保留数目:" + book.SaveNum)
            console.log("可供借阅数目:" + book.AvailNum)
            if (book.Num != book.SaveNum + book.AvailNum) {
                console.log("已借阅数目：" + book.Unavail.num + "\n\t详情：" + book.Unavail.status)
            }


            var recipients = "chen86860@gmail.com",
                subject = "《" + book.Title + "》已经可以借阅啦～",
                content = "Hey~Jack,你辛苦盼的书终于可以借啦～ 快点过去图书馆看看吧～～～" +
                    "《" + book.Title + "》";

            var tryNum = 0;
            var mailSend = function () {
                setInterval(function () {
                    if (book.AvailNum > 0) {
                        sendMail(recipients, subject, content, 'html', function (status, details) {
                                if (status == 'err') {
                                    console.error(details)
                                } else {
                                    // TODO
                                    clearTimeout(mailSend)
                                    console.log("邮件发送成功！")
                                }
                            }
                        )
                    }
                    tryNum++
                    console.log("已查询:" + tryNum + "次")
                }, 1000);
            };

            (function () {
                mailSend()
            })();

            res.render("index", {
                Title: book.Title,
                Author: book.Author,
                Press: book.Press,
                PressDate: book.PressDate,
                Num: book.Num,
                SaveNum: book.SaveNum,
                AvailNum: book.AvailNum,
                UnavailNum: book.Unavail.num,
                UnavailStatus: book.Unavail.status
            })
        }
    })
})


function sendMail(recipients, subject, content, mailType, callback) {
    var mailType = mailType || 'text';

    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport(credentials.stmp.stmpSecert);

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"Jams" <chen86860@yeah.net', // sender address
        to: recipients, // list of receivers
        subject: subject // Subject line
        // mailType: content // plaintext body
    };
    mailOptions[mailType] = content;

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        var status = '';
        var details = '';
        if (error) {
            status = 'err';
            details = (typeof(info) != 'undefined') ? info : 'Mail Server Refuse'
        }
        else {
            status = 'ok';
            details = (typeof(info) != 'undefined') ? info : 'Mail Server Refuse'
        }

        if (callback && typeof(callback) == 'function') {
            callback(status, details);
        }
    });
}

module.exports = router;
