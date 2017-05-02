var keystone = require('keystone');
var async = require('async');
var moment = require('moment');
var _ = require('lodash');

var helper = require('./helper');

var Course = keystone.list('Course');
var Chapter = keystone.list('Chapter');
var LearningObject = keystone.list('LearningObject');
var LOView = keystone.list('LOView');

exports = module.exports = function (req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.section = 'elearning';
  locals.url = '/elearning/learning-objects/popular?';

  var pageData = {
    loginRedirect: '/elearning/popular?', 
    breadcrumbs: [
      { text: 'elearning', link: '/elearning' },
      { text: 'popular', link: '/elearning/learning-objects/popular?' },
    ]
  }

  locals.popularLO = [];

  locals.viewStyle = req.query.view == undefined ? 'grid' : req.query.view;
  locals.page = req.query.page == undefined ? 1 : req.query.page;
  locals.duration = req.query.duration == undefined ? 'month': req.query.duration; 
  locals.perPage = req.query.perPage == undefined ?  12 : req.query.perPage;

  var pastLOviews = [];

  // Get all LOViews withing the past 30 days.
  view.on('init', function (next) {

    var currentDate = moment().toDate();
    var startDate;

    if (locals.duration=='day') 
      startDate = currentDate
    else if (locals.duration=='week')
      startDate = moment().subtract(7, 'days').toDate();
    else if (locals.duration=='month')
      startDate = moment().subtract(30, 'days').toDate();

    LOView.model.find({
      dateViewed: { 
        $gte: startDate, 
        $lt: currentDate
      }
      })
      .populate('learningObject')
      .sort('-dateViewed')
      .exec(function(err, results) {
        if(err) return next(err);

        pastLOviews = results;

        // Get loview.count of all same learningObjects
        async.each(pastLOviews, function(loview, next) {
          //console.log(loview.learningObject);

          LOView.model.find({
            dateViewed: {
              $gte: startDate,
              $lt: currentDate
            },
            learningObject: loview.learningObject._id
           })
          .count()
          .exec(function (err, count) {
            
            if (err) return next(err);
            
            loview.learningObject.viewCount = count;
            
            // Uniquely push to locals.popularLO[]
            if (locals.popularLO.indexOf(loview.learningObject) === -1) {
              locals.popularLO.push(loview.learningObject);
            }            

            next();
          })
        
        }, function(err) {
          next(err);
        });
        
      });
      
  });

  view.on('init', function(next) {
    // Sort locals.popularLO[]
    locals.popularLO.sort( function (a, b) {
      return parseFloat(b.viewCount) - parseFloat(a.viewCount); 
    });

    // paginate locals.popularLO
    locals.paginatePopularLO = helper.paginate(locals.popularLO, locals.page, locals.perPage);
   
    next();
  });

  

  view.render('elearning/popular', pageData);
}