
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.bootstrap = function(req, res){
	res.render('bootstrap', {title: "bootstrap"});
};