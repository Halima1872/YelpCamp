const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

const opts = { toJSON: { virtuals: true } };

//building the schema
const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200')
})
const CampgroundSchema = new Schema({
    title: String,
    images:[ ImageSchema],
    geometry:{
        type:{
            type: String,
        enum: ['Point'],
        required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }   
    },

    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
},opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campground/${this._id}">${this.title}</a><strong>`
});

CampgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
                _id: {
                    $in: doc.reviews
                }
            })
    }
})

//making the model i.e defining a collection for all the campgrounds and export the same
module.exports = mongoose.model('Campground',CampgroundSchema);

