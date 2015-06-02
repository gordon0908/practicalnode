var mongoose = require('mongoose');

var articleSchema = mongoose.Schema({
	title: {
		type: String,
		require: true, 
		valide: [
			function(value){
				return value.length<=120
			},
			"title is too long 120 max"
		],
		default: 'New Post'
	}, 
	text: String,
	published: {
		type: Boolean,
		default: false
	},
	slug: {
		type: String,
		set: function(value){
			return value.toLowerCase().replace(' ', '-')
		}
	}
});

articleSchema.static({
	list: function(cb){
		this.find({}, null, {sort: {_id: -1}}, cb)
	}
})

module.exports = mongoose.model('Article', articleSchema);;exports.Article = require('./article');
exports.User = require('./user');

;var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	email: {
		type: String,
		required: true,
		set: function(value){
			return value.trim().toLowerCase()
		}
	},
	password: String,
	admin: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('User', userSchema);;
exports.show = function(req, res, next){
	if (!req.params.slug){
		return next(new Error('no article slug'))
	}
	req.models.Article.findOne({slug: req.params.slug}, function(error, article){
		if (error){
			return next(error)
		};

		if (!article.published){
			return res.send(401);
		}
		res.render('article', article);
	})
};

exports.list = function(req, res, next){
	req.models.Article.list(function(error, articles){
		if (error){
			return next(error);
		}
		res.send({articles: articles});
	});

};

exports.add = function(req, res, next){
	if (!req.body.article){
		return next(new Error('no article data'))
	}	
	var article = req.body.article;
	article.published = false;
	req.models.Article.create(article, function(error, response){
		if (error){
			return next(error)
		}
		res.send(response);
	})
};

exports.edit = function(req, res, next){
	if (!req.params.id){
		return next(new Error('no article id'))
	}

	req.models.Article.findByIdAndUpdate(req.params.id, {$set: req.body.article}, function(error, count){
		if (error) return next(error);
		res.send({affectedCount: count});
	});
};

exports.del = function(req, res, next){
	if (!req.params.id) return next (new Error('no article id'));

	req.models.Article.findByIdAndRemove(req.params.id, function(error, count){
		if (error) return next(error);

		res.send({affectedCount: count});
	});
};

exports.post = function(req, res, next){
	if (!req.body.title)
		res.render('post');
};

exports.postArticle = function(req, res, next){
	if (!req.body.title || !req.body.slug || !req.body.text ){
		return res.render('post', {error: 'fill title, slug and text'})
	}

	var article = {
		title: req.body.title,
		slug: req.body.slug,
		text: req.body.text,
		published: false
	};

	req.models.Article.create(article, function(error, articleResponse){
		if (error) return next(error);
		
		res.render('post', {error: 'Article was added. Publish it on Admin page.'});
	})
};

exports.admin = function(req, res, next){
	req.models.Article.list(function(error, articles){
		if (error) return next(error);
		res.render('admin',{articles:articles});
	});
};;exports.article =  require('./article');
exports.user = require('./user');

exports.index = function(req, res, next){
	req.models.Article.list(function(error, items){
		if (error){
			return next(error)
		}
		res.render('index', {articles: items})
	})


};;exports.list = function(req, res){
	res.send('respond with resource')
};

exports.login = function(req, res, next){
	res.render('login')
};

exports.logout = function(req, res, next){
	req.session.destroy();
	res.redirect('/')
};

exports.authenricate = function(req, res, next){
	if (req.body.email=="" || req.body.password==""){
		return res.render('login', {error: 'please enter your email and pswd'});
	}else{
		req.models.User.findOne({email: req.body.email, password: req.body.password }, function(error, user){
			if (error || !user){
				return res.render('login', {error: 'failed login'})
			}
			req.session.user = user;
			req.session.admin = user.admin;
			res.redirect('/admin');
		});
	}
};