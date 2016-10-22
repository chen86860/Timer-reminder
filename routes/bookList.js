/**
 * Created by jack on 10/8/16.
 */
var request = require("request");
var cheerio = require("cheerio");
var booksSchema = require('../model/mongon').booksSchema


var url = 'http://lib.wyu.edu.cn/opac/bookinfo.aspx?ctrlno=545068'
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

checkbook(url, function (err, book) {
    var newbook = new booksSchema({
        // uid: String,
        title: book.Title,
        author: book.Author,
        press: book.Press,
        pressDate: book.PressDate,
        isbn: "0000000000",
        summary: "",
        bookstatus: {
            num: book.Num,
            sveNum: book.SaveNum,
            availNum: book.AvailNum,
            unavail: {
                num: book.Unavail.num,
                status: book.Unavail.status
            }
        }
    })

    newbook.save(function (err, result) {
        if (err) {
            console.err(err)
        }
        else {
            console.log("已写入数据库！")
        }
    })
})