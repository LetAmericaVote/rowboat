const mongoose = require('mongoose');
const contentful = require('contentful-management');
const User = require('./User');
const Signup = require('./Signup');
const algolia = require('../lib/algolia');

const EventSchema = mongoose.Schema({
  contentfulId: {
    type: String,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  headerPhoto: {
    type: String,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
    index: true,
  },
  streetAddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipcode: {
    type: String,
    required: true,
  },
  hostUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  geoLocation: {
    type: [Number],
    index: '2dsphere',
    required: true,
  },
}, {
  timestamps: true,
});

EventSchema.post('save', async function(doc, next) {
  const index = await this.getAlgoliaIndex();
  algolia.addEvent(index).then(() => {
    next();
  });
});

EventSchema.post('remove', function() {
  algolia.deleteEvent(this);
});

EventSchema.statics.findById = async function(id) {
  try {
    const event = await this.findOne({ _id: id }).populate('hostUser');
    return event;
  } catch (error) {
    console.error(error);
    return null;
  }
};

EventSchema.statics.findBySlug = async function(slug) {
  try {
    const event = await this.findOne({ slug }).populate('hostUser');
    return event;
  } catch (error) {
    console.error(error);
    return null;
  }
};

EventSchema.statics.findByContentfulId = async function(contentfulId) {
  try {
    const event = await this.findOne({ contentfulId }).populate('hostUser');
    return event;
  } catch (error) {
    console.error(error);
    return null;
  }
};

EventSchema.statics.findByLatLong = async function(long, lat, minDistance, maxDistance, excludeId) {
  const excludeIdCasted = !!excludeId && Array.isArray(excludeId) ?
    (excludeId.map(id => mongoose.Types.ObjectId(id))) : [];

  try {
    const events = await this.aggregate([
      {
        '$geoNear': {
          near: {
            type: 'Point',
            coordinates: [long, lat],
          },
          spherical: true,
          query: {
            _id: {
              '$nin': excludeIdCasted,
            },
            dateTime: {
              '$gte': new Date(),
            },
          },
          limit: 25,
          distanceField: 'distance',
        }
      },
    ]);

    if (! events || ! events.length) {
      return [];
    }

    const hydratedEvents = events.map(event => this.hydrate(event));
    const populatedEvents = await this.populate(hydratedEvents, { path: 'hostUser' });

    return populatedEvents;
  } catch (error) {
    console.error(error);
    return null;
  }
};

EventSchema.statics.syncFromContentful = async function(entry) {
  const lang = 'en-US';

  try {
    const contentfulId = entry.sys.id;
    const fields = entry.fields;

    let event = await this.findByContentfulId(entry.sys.id);
    if (! event) {
      event = new this({ contentfulId });
    }

    event.title = fields.title[lang];
    event.slug = fields.slug[lang];
    event.description = fields.description[lang];
    event.headerPhoto = fields.headerPhoto[lang].fields.file[lang].url;
    event.dateTime = fields.dateTime[lang];
    event.hostUser = fields.hostUser[lang];
    event.streetAddress = fields.streetAddress[lang];
    event.city = fields.city[lang];
    event.state = fields.state[lang];
    event.zipcode = fields.zipcode[lang];
    event.geoLocation = [
      fields.geoLocation[lang].lon,
      fields.geoLocation[lang].lat,
    ];

    await event.save();

    return true;
  } catch(error) {
    console.error(error);
    return false;
  }
};

EventSchema.statics.formatArrayOfEvents = async function(events, requestUser) {
  const formattedEvents = await Promise.all(events.map(async (event) =>
    await event.getApiResponse(requestUser)
  ));

  return formattedEvents;
};

EventSchema.methods.getApiResponse = async function(requestUser) {
  const baseEventResponse = {
    id: this.id,
    title: this.title,
    slug: this.slug,
    description: this.description,
    headerPhoto: this.headerPhoto,
    dateTime: this.dateTime,
    city: this.city,
    state: this.state,
    zipcode: this.zipcode,
    geoLocation: this.geoLocation,
    createdAt: this.createdAt,
  };

  if (this._doc && typeof this._doc.distance !== 'undefined') {
    baseEventResponse.distance = this._doc.distance;
  }

  try {
    const hostUser = this.hostUser && this.hostUser.getApiResponse ?
      await this.hostUser.getApiResponse(requestUser) : (this.hostUser || null);

    const signup = await Signup.findOne({ user: requestUser, event: this });
    const isSignedUp = signup && signup.id;

    return {
      ...baseEventResponse,
      hostUser,
      streetAddress: isSignedUp ? this.streetAddress : null,
    };
  } catch (error) {
    console.error(error);
    return baseEventResponse;
  }
};

EventSchema.methods.getAlgoliaIndex = async function() {
  const hostUser = await User.findOne({ _id: this.hostUser });
  // TODO: Should we add state abbreviations to the index?

  return {
    objectID: this.id,
    title: this.title,
    streetAddress: this.streetAddress,
    city: this.city,
    state: this.state,
    hostUser: {
      firstName: hostUser.firstName,
      lastName: hostUser.lastName,
    },
  };
};

EventSchema.methods.syncToContentful = async function() {
  const lang = 'en-US';

  if (this.contentfulId) {
    console.error('Aborting Contentful Sync - Duplicate.');
    return false;
  }

  try {
    const client = contentful.createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_KEY,
    });

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE);
    const environment = await space.getEnvironment('master');

    const headerPhotoUpload = await environment.createAsset({
      fields: {
        title: {
          [lang]: `${this.title} header photo`,
        },
        file: {
          [lang]: {
            contentType: 'image/jpeg',
            fileName: `${this.slug}.jpeg`,
            upload: this.headerPhoto,
          },
        },
      },
    });

    const headerPhotoAsset = await headerPhotoUpload.processForLocale(lang);
    await headerPhotoAsset.publish();

    const fields = {
      title: {
        [lang]: this.title,
      },
      slug: {
        [lang]: this.slug,
      },
      description: {
        [lang]: this.description,
      },
      headerPhoto: {
        [lang]: {
          sys: {
            id: headerPhotoAsset.sys.id,
            linkType: "Asset",
            type: "Link",
          },
        },
      },
      dateTime: {
        [lang]: this.dateTime,
      },
      hostUser: {
        [lang]: this.hostUser.id,
      },
      streetAddress: {
        [lang]: this.streetAddress,
      },
      city: {
        [lang]: this.city,
      },
      state: {
        [lang]: this.state,
      },
      zipcode: {
        [lang]: this.zipcode + '',
      },
      geoLocation: {
        [lang]: {
          lon: this.geoLocation[0],
          lat: this.geoLocation[1],
        },
      },
    };

    const entry = await environment.createEntry('event', { fields });
    await entry.publish();

    this.contentfulId = entry.sys.id;

    await this.save();

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const Event = mongoose.model('event', EventSchema);

module.exports = Event;
