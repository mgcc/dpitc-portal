var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true },
	password: { type: Types.Password, initial: true, required: true },
  photo: { type: Types.CloudinaryImage }
}, 'Elearning', {
  learningObjectsTaken: {
    // max of 100 to be considered for threshold purposes and mean newly taken courses / recent
    type: Types.Relationship,
    ref: 'LearningObject',
    many: true
  },
	location: { type: Types.Location, defaults: { country: 'Philippines' }},
	agencyAffiliation: {
		type: Types.Select,
		options: [
		{ value: 'Researcher', label: 'Researcher' },
		{ value: 'Business/Private Sector', label: 'Business/Private Sector' },
		{ value: 'Policy Maker', label: 'Policy Maker' },
		{ value: 'Other', label: 'Other' }
		],
		initial: false,
		required: true
	},
	birthday: { type: Types.Date, initial: true, required: true, index: true },
	sex: {
    type: Types.Select,
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' }
    ],
    initial: false,
    required: false
  },
	contactNumber: { type: Number, initial: true, required: true, index: true },
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: false },
  isElearningAdmin: { type: Boolean, label: 'Can access Elearning Admin', index: false},
  isElearningUser: { type: Boolean, label: 'Can access Elearning UI', index: false },
}, 'Backlog', {
  needsReviewing: { type: Types.Relationship, ref: 'Publication' }
}
);

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

// Provide access to Elearning Component
User.schema.virtual('canAccessElearningAdmin').get(function () {
  return this.isElearningAdmin;
});

User.schema.virtual('canAccessElearningUI').get(function () {
  return this.isElearningUser;
});


// Provide access to Posts
User.schema.virtual('canAccessPosts').get(function () {
	return this.isPostsAdmin;
});

// Provide access to Contents
User.schema.virtual('canAccessContents').get(function () {
	return this.isContentsAdmin;
});

// Provide access to Pages
User.schema.virtual('canAccessPages').get(function () {
	return this.isPagesAdmin;
});

// Provide access to Users
User.schema.virtual('canAccessUsers').get(function () {
	return this.isUsersAdmin;
});

// Provide access to Analytics
User.schema.virtual('canAccessAnalytics').get(function () {
	return this.isAnalyticsAdmin;
});

// Provide access to Community
User.schema.virtual('canAccessCommunity').get(function () {
	return this.isCommunityAdmin;
});

// Provide access to Publications Component
User.schema.virtual('canAccessPublicationsAdmin').get(function () {
	return this.isPublicationsAdmin;
});

User.schema.virtual('canAccessPublicationsUI').get(function () {
	return this.isPublicationsUser;
});

// Provide access to Categories
User.schema.virtual('canAccessCategories').get(function () {
	return this.isCategoriesAdmin;
});

//Store user info from sign up page
User.schema.post('/signup', function(req, res){
		new user({
						fname : req.body.first,
						lname : req.body.lname,
						password : req.body.password,
						birthday : req.body.birthday,
						consumerType : req.body.consumerType,
						affiliation: req.body.agencyAffiliation,
						sex : req.body.sex,
		}) .save(function (err, doc) {
						if(err) res.json(err);
						else 		res.send('Succesfully inserted');
		});
});


/**
 * Relationships
 */
User.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });
User.relationship({ ref: 'BlogPost', path: 'blogPosts', refPath: 'author' });
User.relationship({ ref: 'Comment', path: 'comments', refPath: 'author' });
User.relationship({ ref: 'PublicationFeedback', path: 'user'});


/**
 * Registration
 */
User.defaultColumns = 'name, email, isAdmin';
User.register();
