var keystone = require('keystone');
var async = require('async');
var LearningObject = keystone.list('LearningObject');
var Course = keystone.list('Course');
var User = keystone.list('User');
<<<<<<< HEAD
var LOComment = keystone.list('LOComment');
=======
var LOView = keystone.list('LOView');
>>>>>>> 91bf87133cbf1607f68cac2a117c4fe91f050294

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // Set locals

  locals.data = {
    currLO: [],
    comments: [],
    otherLO: [],
    recommendedLO: [],
    learningObjectsTaken: [],
  };

  locals.formData = req.body || {};

  var pageData = {
    loginRedirect: '/elearning',
    breadcrumbs: [
      { text: 'elearning', link: '/elearning' },
      // still need breadcrumb for course
    ]
  }

  var tempRecommended = [];
  var tempLearningObjects = [];
  var classifications = ["specificCommodity", "isp", "sector", "industry"];
  var counts = ["specCommCount", "ispCount", "sectorCount", "industryCount"];

  // Load the currentLO
  // Add currentLO to currentUser's learningObjectsTaken

  view.on('init', function(next){
    var currentUser = locals.user;
    var currentLO;

    LearningObject.model.findOne({
      slug: req.params.learningobjectslug,
      state: 'published',
    })
    .populate('author images video isp sector industry')
    .exec(function(err, result) {
      if (err) return next(err);
      if (result.length == 0) {
        return callback(res.status(404).send(keystone.wrapHTMLError('Sorry, LearningObject:' + req.params.learningobjectslug +' not found! (404)')));
      }
      currentLO = result;
      locals.data.currLO = result;

      // TODO refactor breadcrumbs
      pageData.breadcrumbs.push(  { text: locals.data.currLO.title, link: '/elearning/'+req.params.learningobjectslug } );


      if(currentUser){
        // Update currentUser's learningObjectsTaken
        User.model.findOneAndUpdate( 
          { _id: currentUser._id }, 
          { $addToSet: { learningObjectsTaken: currentLO._id } },
          function(err, res) {
            if (err) return next(err);
            next();  
          }
        ); 
        
      } else {
        next();
      }
    });
  });

  //TODO
  // Add comment
  view.on('post', { action: 'user.addComment' }, function(next) {

      var currentUser = locals.user;
      var currentLO;

      LearningObject.model.findOne({
        slug: req.params.learningobjectslug,
        state: 'published',
      })
      .populate('author images video isp sector industry')
      .exec(function(err, result) {
        if (err) return next(err);
        if (result.length == 0) {
          return callback(res.status(404).send(keystone.wrapHTMLError('Sorry, LearningObject:' + req.params.learningobjectslug +' not found! (404)')));
        }
        currentLO = result;
        locals.data.currLO = result;

        if (currentUser) {
          var newComment = new LOComment.model({
            content: locals.formData.content,
            author: currentUser,
            learningObject: currentLO,
            dateCreated: Date.now
          });

          console.log(newComment);

          // Add comment to currentLO's comments
          LearningObject.model.findOneAndUpdate(
            { _id: currentLO._id },
            { $addToSet: { comments: newComment._id} }, 
            function(err, res) {
              if (err) return next(err);
              //console.log(res);

              // re-load comments
              
              next();
            });
           
        } else {
          req.flash('error', 'Please sign in to add comments.')
          return res.redirect('keystone/signin');
        }
      });

    });

  // Load comments
  view.on('init', function(next){
    var currentLO;
    LearningObject.model.findOne({
      slug: req.params.learningobjectslug,
      state: 'published',
    })
    .exec(function(err, result) {
      if (err) return next(err);
      currentLO = result;

      LOComment.model.find({ 
        learningObject: currentLO._id 
      })
      .populate('author learningObject')
      .exec(function(err, comments) {
        if (err) return next(err);

        locals.data.comments = comments;
        
      });

      next();
    });

  });  


  //insert view
  //TO DO, check if nirefresh lang
  view.on('init', function(next){
    var currentUser = locals.user;
    if(currentUser){
      var newView = new LOView.model({
          LUser: currentUser._id,
          learningObject: locals.data.currLO._id
      });
      newView.save(function(err) {
          //console.log("added the view")
      });
      next();
    }
    else{
      next();
    }
  });


  // TODO
  // Load other learning objects besides current
  view.on('init', function(next){
    LearningObject.model.find({
      state: 'published',
    })
    .limit(6)
    .exec(function(err, results){
      if(results != null){
        locals.data.otherLO = results;
      } else {
        return res.status(404).send(keystone.wrapHTMLError('Sorry, There are no course found! (404)'));
      }
      next(err);
    });
  });

  /* LOAD RECOMMENDED LEARNING OBJECTS */

  //get all the learning objects
  view.on('init', function(next){
    var q = LearningObject.model.find();

    q.exec(function(err, results){
        tempLearningObjects = results;
        next(err);
    });
  });

  //get the Learning Objects Taken by the current logged-in user
  view.on('init', function(next){
    var currentUser = locals.user;
    if(currentUser){
      var q = LearningObject.model.find().where('_id').in(currentUser.learningObjectsTaken);

      q.exec(function(err, results){
          locals.data.learningObjectsTaken = results;
          console.log(locals.data.learningObjectsTaken.length);
          next(err);
      });
    }
    else{
      next();
    }
  });

  //compute for the score of each learning objects based on the ISP, sector and industry tags of the learning objects taken by the logged-in user
  view.on('init', function(next){
    if(locals.data.learningObjectsTaken.length>0){
      async.each(tempLearningObjects, function (learningObject, next) {
          if(notYetTaken(learningObject, locals.data.learningObjectsTaken)==0){
              next();
          }
          else{
              for(var j=0;j<classifications.length;j++){
                  var count = 0; 
                  if(learningObject[classifications[j]]!=null){
                    var learningObjectClassId = learningObject[classifications[j]] + "";
                      for(var i=0;i<locals.data.learningObjectsTaken.length;i++){
                          var eachTakenClassId = locals.data.learningObjectsTaken[i][classifications[j]] + "";
                          if(eachTakenClassId!=null&&learningObjectClassId==eachTakenClassId){
                              count++;
                          }
                      }
                  }
                  learningObject[counts[j]] = count;
              }
              var score = (4 * (learningObject.specCommCount)) + (3 * (learningObject.ispCount)) + (2 * (learningObject.sectorCount)) + (1 * (learningObject.industryCount));
              if(score>0){//change this to change the threshold of score or compute for a just right threshold
                  learningObject.score = score;
                  tempRecommended.push(learningObject);
              }
              next();
          }
      }, function (err) {
          next(err);
      });
    }
    else{
      //TO DO
      /*
      if(locals.data.learningObjectsTaken.length==0){
        var q = keystone.list('LearningObject').model.find().where('ISP').in(locals.data.currentLearner.preference);

        q.exec(function(err, results){
            locals.data.preferredISPs = results;
            next(err);
        });
      }
      */
      //get the preferred ISPS here for the initial recommended learning materials
      next();
    }
  });

  //function for checking if the specific course was already taken by the logged in user
  function notYetTaken(learningObject, learningObjectsTaken){
    var flag = 0;
    var learningObjectId = learningObject._id + "";
    for(var i=0;i<learningObjectsTaken.length;i++){
        var learningObjectsTakenId = learningObjectsTaken[i]._id + "";
        if(learningObjectId==learningObjectsTakenId){
            flag = 1;
            return 0;
        }
    }
    if(flag==0) return 1;
  }

  //sort the learning objects based on their score then get the top N or top 3 learning objects
  view.on('init', function(next){
    locals.data.recommendedLO = [];
    if(tempRecommended.length>0){
      tempRecommended.sort(function(a,b){
          return parseFloat(b.score) - parseFloat(a.score);
      });
      locals.data.recommendedLO = tempRecommended.slice(0, 3);//temporary
      //locals.data.recommendedLO = tempRecommended.slice(0, 36);//final, 36 recommended videos in youtube too
      /*for(var i=0;i<tempRecommended.length;i++){
          //console.log("SPECIFIC COMMODITY " + tempRecommended[i].specCommCount);
          //console.log("ISP " + tempRecommended[i].ispCount);
          //console.log("Sector " + tempRecommended[i].sectorCount);
          //console.log("Industry " + tempRecommended[i].industryCount);
          console.log("FINAL SCORE: " + tempRecommended[i].score);
      }*/
    }
    else{
      if(tempLearningObjects.length>0){
        locals.data.recommendedLO = tempLearningObjects.slice(0, 3);
      }
    }
    next();
  });

  // Render the view
  view.render('elearning/learningObject', pageData);

};
