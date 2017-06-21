var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Traning Model
 * ==========
 */

var Training = new keystone.List('Training', {
  map: { name: 'title' },
  autokey: { path: 'slug', from: 'title', unique: true },
})

Training.add({
  title: { type: String, required: true, default: '', index: true },
  startDate: { type: Types.Date },
  endDate: { type: Types.Date },
  description: {
    brief: { type: Types.Html, wysiwyg: true, height: 150 },
    full: { type: Types.Html, wysiwyg: true, height: 400 },
  },
  image: { type: Types.CloudinaryImage, autoCleanup: true }
  // categories: { type: Types.Relationship, ref: 'ISPCategory', many: true }
});

Training.defaultColumns = 'title, startDate, endDate, image'
Training.register();