var keystone = require('keystone');

exports = module.exports = function(req, res) {
	var view = new keystone.View(req, res);
	var locals = res.locals;

		var pageData = {
			title: 'Publications',
			navLinks: [
				{ text: 'Home', link: '/admin' },
				{ text: 'Posts', link: '/admin/posts'},
				{ text: 'Contents', link: '/admin/contents-fiesta'},
				{ text: 'Pages', link: '#'},
				{ text: 'Users', link: '/admin/users'},
				{ text: 'Analytics', link: '/admin/community-views'},
				{ text: 'Community', link: '#'},
				{ text: 'Publications', link: '/admin/publication-settings'},
				{ text: 'Categories', link: '#'},
				{ text: 'ELearning', link: '/admin/learning-objects'}
			],
			breadcrumbs:[
				{ text: 'Publications Settings', link: '/admin/publication-settings'},
				{ text: 'Publications', link: '/admin/publications'},
				{ text: 'Publication Lines', link: '/admin/publication-lines'},
				{ text: 'Feedback', link: '/admin/publication-feedback'}
			]
  	};

	//init locals
	locals.section = 'users';
	locals.data = {
		publications_settings: [] ,
		path:req.path,
	};

	// Load publications
	view.on('init', function (next) {

		var u = keystone.list('publicationsSettings').model.findOne({_id: req.params.id});

		u.exec(function (err, results) {
			locals.data.publications_settings = results;
			next(err);
		});

	});

	view.on('post', {action: 'deletePublicationSetting'}, function(next){
		var u = keystone.list('publicationsSettings').model.remove({_id: req.params.id});

		u.exec(function (err, results){
			if(err){}
			else{
				req.flash('success','Publication Setting deleted');
				return res.redirect('/admin/publication-settings');
			}
			
		})

	});


	view.render('admin/publicationsSettings_profile',pageData);
};
