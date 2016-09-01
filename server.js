var express = require('express');
var convert = require('simple-csv-to-json');
var ParseDashboard = require('parse-dashboard');
var http = require('http');

var dashboard = new ParseDashboard({
    apps: [
        {
            appId: process.env.APP_ID || 'myAppId',
            masterKey: process.env.MASTER_KEY,
            serverURL: process.env.SERVER_URL,
            appName: process.env.APP_NAME,
        },
    ],
    users: [
        {
            user: process.env.USER_NAME,
            pass: process.env.PASSWORD
        }
    ]
}, true /* note: you have to set allowInsecureHTTP=true, HyperDev is still using HTTPS externally, but proxy to app container comms inside our network happen over http */);

var app = express();

app.use(express.static('public'));

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

var file = __dirname + '/chartData.csv';
var fixtureData = convert.CSVtoJSON( file );

app.locals.barChartHelper = require('./bar_chart_helper');

app.get('/', function(req, res) {
  res.render('node', { fixtureData: fixtureData });
});

app.get('/node', function(req, res) {
  res.render('node', { fixtureData: fixtureData });
});

app.get('/drag', function(req, res) {
  res.render('drag', { fixtureData: fixtureData });
});

// make the Parse Dashboard available at root /
app.use('/dashboard', dashboard);

var port = process.env.PORT || 3000;
var httpServer = http.createServer(app);
httpServer.listen(port, function () {
    console.log('parse-dashboard running on port ' + port);
});