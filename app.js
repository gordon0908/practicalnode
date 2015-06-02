//ITv1g5nzcfWQgiq5d5ZYhQcRV 
//9gxxFpdQm903eiMkenR1U9QzbcU6KiOP53oz2I96D79Ln5iFYc

var twitter_key = 'ITv1g5nzcfWQgiq5d5ZYhQcRV';
var twitter_secret = '9gxxFpdQm903eiMkenR1U9QzbcU6KiOP53oz2I96D79Ln5iFYc';

var everyauth = require('everyauth');



var http = require('http'),
	express = require('express'),
	bodyparser = require('body-parser'),
	path = require('path');

var routes = require('./routes'),
	mongoose = require('mongoose'),
	models =  require('./models'),
	dbUrl = process.env.MONGOHO_URL || 'mongodb://@localhost:27017/blog1',
	db = mongoose.connect(dbUrl, {safe: true});

var session = require('express-session'),
	logger = require('morgan'),
	errorHandler = require('errorhandler'),
	cookieParser = require('cookie-parser'),
	methodOverride = require('method-override');

var domain = require('domain');

everyauth.debug = true;
everyauth.twitter 
	.consumerKey(twitter_key)
	.consumerSecret(twitter_secret)
	.findOrCreateUser(function(session, accessToken, accessTokenSecret, twitterUserMetadata){
		var promise = this.Promise();
		process.nextTick(function(){
			if (twitterUserMetadata.screen_name == 'G0rd0nTang'){
				session.user = twitterUserMetadata;
				session.admin = true;
			}
			promise.fulfill(twitterUserMetadata);
		});
		return promise;
	}).redirectPath('/admin');

everyauth.everymodule.handleLogout(routes.user.logout);
everyauth.everymodule.findUserById(function(user, cb){
	cb(user);
});

var app = express();
app.locals.appTitle = 'blog Gordon Tang';

app.use(function(req, res, next){
	if (!models.Article || !models.User){
		return next(new Error('no models'))
	}
	req.models = models;
	next();
});

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/public/views');
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded());

app.use(cookieParser('3CCC4ACD-6ED1-4844-9217-82131BDCB239'));
app.use(session({secret: '2C44774A-D649-4D44-9535-46E296EF984F'}));

app.use(everyauth.middleware());

app.use(methodOverride());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development'){
	app.use(
		errorHandler({
			dumpException: true, showStack: true
		})
	);
}else{
	app.use(errorHandler());
}

/*
if (app.get('dev') == 'development'){
	app.use(errorHandler());
}
*/

app.use(function(req, res, next){
	if (req.session && req.session.admin){
		res.locals.admin = true;
	}
	next();
});

var auth = function(req, res, next){
	if (!req.session || !req.session.admin){
		return res.send(401);
	}else{
		return next();
	}
}

app.get('/', routes.index);
app.get('/login', routes.user.login);
app.post('/login', routes.user.authenricate);
app.get('/logout', routes.user.logout);

app.get('/admin', routes.article.admin);
app.get('/post', routes.article.post);
app.post('/post', routes.article.postArticle);
app.get('/articles/:slug', routes.article.show);

app.all('/api', auth);
app.get('/api/articles', routes.article.list);
app.post('/api/articles', routes.article.add);
app.put('/api/articles/:id', routes.article.edit);
app.del('/api/articles/:id', routes.article.del);

app.get('/e', function(req, res, next){
	var d = domain.create();
	d.on('error', function(error){
		console.error(error.stack);
		res.send(500, {error: error.message})
	});
	d.run(function(){
		throw new Error('database is down')
	});
});

app.get('/status', function(req, res, next){
	res.send({
		pid: process.pid,
		memory: process.memoryUsage(),
		uptime: process.uptime()
	});
});

/*
var articles = [
	{slug: 'test1', title: 'test2'}
];
*/
app.all('*', function(req, res){
	res.send(401);
	//res.render('index', {msg: 'welcome to my home', articles: articles, appTitle: 'Test by GT'})
});

process.on('uncaughtException', function(err){
	console.error('uncaughtException', err.message);
	process.exit(1);
});



//boot, shutdown, port

var server = http.createServer(app);

var boot = function(){
	server.listen(app.get('port'), function(){
		console.log('server start');
	});
};

var shutdown = function(){
	server.close()
};

if (require.main === module){
	boot();
}else{
	exports.boot = boot;
	exports.shutdown = shutdown;
	exports.port = app.get('port');
}


