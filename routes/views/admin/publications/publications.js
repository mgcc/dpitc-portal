var keystone = require('keystone');

exports = module.exports = function(req, res) {
	var view = new keystone.View(req, res);
	var locals = res.locals;

		var pageData = {
			title: 'Publications',
			navLinks: [
				{ text: 'Home', link: '/admin' },
				{ text: 'Posts', link: '#'},
				{ text: 'Contents', link: '#'},
				{ text: 'Pages', link: '#'},
				{ text: 'Users', link: '/admin/users'},
				{ text: 'Analytics', link: '/admin/community-views'},
				{ text: 'Community', link: '/admin/community'},
				{ text: 'Publications', link: '/admin/publications'},
				{ text: 'Categories', link: '#'},
				{ text: 'ELearning', link: '/admin/learning-objects'}
			],
			breadcrumbs:[
				{ text: 'Publications Settings', link: '#'},
				{ text: 'Publications', link: '/admin/publications'},
				{ text: 'Publication Lines', link: '#'},
			]
  	};

	//init locals
	locals.section = 'users';
	locals.data = {
		publications: [],
	};

	// Load publications settings
	view.on('init', function (next) {

		var u = keystone.list('Publication').model.find().sort({ title: 1 })

		u.exec(function (err, results) {
			locals.data.publications = results;
			next(err);
		});

	});

	view.render('admin/publications/publications',pageData);
};
