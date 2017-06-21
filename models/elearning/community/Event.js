var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Event Model
 * ==========
 */

var Event = new keystone.List('Event', {
  map: { name: 'title' },
  autokey: { path: 'slug', from: 'title', unique: true },
})

Event.add({
  title: { type: String, required: true, initial: true, index: true },
  startDate: { type: Types.Datetime, initial: true, index: true },
  endDate: { type: Types.Datetime, initial: true, index: true },
  description: {
    brief: { type: Types.Html, wysiwyg: true, height: 150 },
    full: { type: Types.Html, wysiwyg: true, height: 400 },
  },
  image: { type: Types.CloudinaryImage, autoCleanup: true, folder: 'community/events', index: true },
  industry: { type: Types.Relationship, ref: 'Industry' },
  sector: { type: Types.Relationship, ref: 'Sector', filters: { industry: ':industry' } },
  commodity: { type: Types.Relationship, ref: 'Commodity', filters: { sector: ':sector' } }
  // categories: { type: Types.Relationship, ref: 'ISPCategory', many: true}
});

Event.defaultColumns = 'title, startDate, endDate'
Event.register();
