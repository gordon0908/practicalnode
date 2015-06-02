
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
};