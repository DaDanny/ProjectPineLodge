
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.bootstrap = function(req, res){
	res.render('bootstrap', {title: "bootstrap"});
};

exports.test = function(req,res){
	res.render('test', {title: "Hello World"});
};

exports.old = function(req,res){
	res.render('old', {title: "Old layout.jade"});
};
