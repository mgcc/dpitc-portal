$(function() {

  var downloads = $.getJSON('/api/publications/downloads/current-month', function(data) {
  });

  var feedback = $.getJSON('/api/publications/feedback/current-month', function(data) {
  });

  $.when(downloads, feedback).done(function(downloads, feedback) {
    var downloadData = tallyDownloads(downloads[0]);
    var feedbackData = tallyFeedback(feedback[0]);

    renderDFChart(downloadData, feedbackData);
  });
});
