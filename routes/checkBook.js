/**
 * Created by jack on 10/8/16.
 */
var request = require("request");
var cheerio = require("cheerio");
var credentials = require('../lib/credentials');
var nodemailer = require('nodemailer');
var booksShema = require('../model/mongon').booksSchema;

var url = 'http://lib.wyu.edu.cn/opac/bookinfo.aspx?ctrlno=545068'
var book = {},
    tryTime = 0;

booksShema.find({title: /学会/}, function (err, result) {
    if (err) {
        console.log(err)
    } else {
        console.log(result)
        book.Title = result.title
        book.Author = result.author
        book.Press = result.press
        book.PressDate = result.pressDate
        book.Num = result.num
        bookstatus = result.bookstatus
        console.log(bookstatus)
        book.AvailNum = bookstatus.availNum
        // book.SaveNum = bookstatus.saveNum
        // book.Unavail = bookstatus.unavail
    }
})

var checkRest = setInterval(function () {
    checkbook(url, function (status, result) {
        book = result
        //有可供借阅的书时
        if (book.AvailNum > 0) {
            var recipients = "chen86860@gmail.com",
                subject = "《" + book.Title + "》已经可以借阅啦～",
                content = "Hey~Jack,你辛苦盼的书终于可以借啦～ 快点过去图书馆看看吧～～～" +
                    "《" + book.Title + "》";
            sendMail(recipients, subject, content, 'html', function (status, details) {
                if (status == 'err') {
                    console.error(details)
                } else {
                    booksShema.update({title: /学会/}, {
                        $set: {
                            bookstatus: {
                                num: book.Num,
                                sveNum: book.SaveNum,
                                availNum: book.AvailNum,
                                unavai: {
                                    num: book.Unavail.num,
                                    status: book.Unavail.status
                                }
                            }
                        }
                    })
                    console.log("邮件发送成功！")
                    clearTimeout(checkRest)
                }
            })
        }
    })
    console.log("已查询:" + tryTime + "次")
    tryTime++
}, 1000);


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

function checkbook(url, callback) {
    // var url = 'http://lib.wyu.edu.cn/opac/bookinfo.aspx?ctrlno=545068'
    request(url, function (error, response, body) {
        if (!error && (response.statusCode == 200)) {
            var $ = cheerio.load(body, {
                decodeEntities: true
            });
            var book = {}
            book = {
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
        }

        if (callback && typeof(callback) == 'function') {
            callback(response, book);

        }
    })
}
