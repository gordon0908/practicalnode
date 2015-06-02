exports.list = function(req, res){
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