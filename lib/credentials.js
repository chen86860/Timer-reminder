/**
 * Created by jack on 8/1/16.
 */
exports.credentials = {
    cookieSecret: 'bowl aboard somehow baby',
    mongo: {development: {connectString: "mongodb://localhost/Blog"}, production: {connectString: "Connect String"}},
    stmp: {
        stmpSecert: "smtps://chen86860%40yeah.net:8008208820LONG@smtp.yeah.net"
    }
};


module.exports = exports.credentials;
