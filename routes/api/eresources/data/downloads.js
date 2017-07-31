var keystone = require('keystone');
var Downloads = keystone.list('PublicationDownload');

// Get all downloads, all of it, all publications since the beginning of time
exports.getAllDownloads = function(req, res) {
  var pubID = req.query.pubID;

  Downloads.model.find()
    .exec(function(err, results) {
      if (err) {
        res.send({});
      }
      else {
        res.send(results);
      }
    });
}

// get non-unique downloads for all publications for the current month
exports.getDownloadsCurrentMonth = function(req, res) {
  var now = new Date();

  var start = new Date(now.getFullYear(), now.getMonth(), 1);
  var end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  Downloads.model.find({ date: { $gte: start, $lte: end } }).exec(function(err, results) {
    if (err) {
      console.log('Error getting feedback');
      res.send({});
    } else {
      res.send(results);
    }
  });
}

// Get all downloads, all publications, in a certain range
exports.getDownloadsByRange = function(req, res) {
  var start = req.query.start;
  var end = req.query.end;

  if (start && end) {
    Feedback.model.find()
  } else {
    res.send({})
  }
}

// getDownloadsByRange
// getDownloadsByPublication
// getDownloadsByPublicationAndRange
