const mongoose = require('mongoose');
const slugify = require('slugify')
const geocoder = require('../middleware/geocoder')

const CompanySchema = new mongoose.Schema({
    c_name: {
        type: String,
        required: [true, "Please Add a company name"],
        trim: true,
        minLength: [2, "Name must contain atleast 2 characters"],
        maxLength: [50, 'Name must be atmost 50 characters long']
    },
    slug: String,
    c_desc: {
        type: String,
        required: [true, "Please Enter Your Company Description"],
        maxLength: [500,'Company Description must not exceed 500 characters']
    },
    c_website: {
        type: String,
        match: [
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
          'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    c_phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    c_email: {
        type: String,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please Enter a valid email'
        ]
    },
    c_address: {
        type: String,
        required: [true, 'Please Enter your Company Address'] 
    },
    c_location: {
        type: {
            type: String,
            enum: ['Point']
          },
          coordinates: {
            type: [Number],
            index: '2dsphere'
          },
          formattedAddress: String,
          street: String,
          city: String,
          state: String,
          zipcode: String,
          country: String
    },
    c_averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
    },
    c_photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    c_license: {
        type: String,
        default:"no-license"
    },
    c_isVerified: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
},  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

CompanySchema.pre('save', function(next) {
    this.slug = slugify(this.c_name, { lower: true });
    next();
});

CompanySchema.pre('save', async function(next) {
    const loc = await geocoder.geocode(this.c_address);
    this.c_location = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress,
      street: loc[0].streetName,
      city: loc[0].city,
      state: loc[0].stateCode,
      zipcode: loc[0].zipcode,
      country: loc[0].countryCode
    };
  
    // Do not save address in DB
    this.c_address = undefined;
    next();
});

CompanySchema.pre('remove', async function(next) {
    console.log(`Jobs being removed from Company ${this._id}`);
    await this.model('Job').deleteMany({ company: this._id });
    next();
});

CompanySchema.virtual('jobs', {
    ref: 'Job',
    localField: '_id',
    foreignField: 'company',
    justOne: false
});

module.exports = mongoose.model('Company', CompanySchema)