const Campground = require('../models/campground')
const {cloudinary } = require('../cloudinary')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken : mapBoxToken})
//Home Page
module.exports.index = async(req,res) => {
    const campgrounds = await Campground.find({})
    res.render('campground/index', {campgrounds})
}
//New Campground
module.exports.renderNewForm = (req,res) => {
    res.render('campground/new')
}
module.exports.createCampground = async(req,res,next) => {
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400)
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit : 1
    }).send()
    const newcampground= new Campground(req.body.campground)
    newcampground.author = req.user._id
    //from multer
    newcampground.images = req.files.map(f => ({ url : f.path, filename: f.filename}))
    newcampground.geometry = geoData.body.features[0].geometry
    await newcampground.save()
    console.log(newcampground)
    req.flash('success','Succesfully created a new campground!')
    res.redirect(`/campground/${newcampground._id}`)
}
//Show page 
module.exports.showCampground = async(req,res) => {
    const {id} = req.params
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error','Campground does not exist!')
        res.redirect('/campground')
    }
    res.render('campground/show',{campground})
}
//Editing a campground 
module.exports.renderEditForm = async(req,res) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error','Campground does not exist!')
        res.redirect('/campground')
    }
    res.render('campground/edit',{campground})
}

module.exports.updateCampground = async(req,res) => {
    const {id} = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url : f.path, filename: f.filename}))
    campground.images.push(...imgs)
    await campground.save()
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: {images : {filename: {$in : req.body.deleteImages}}}})
    }
    req.flash('success','Succesfully updated campground!')
    res.redirect(`/campground/${campground._id}`)
}
//deleting campground
module.exports.deleteCampground = async(req,res) => {
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully deleted campground!')
    res.redirect('/campground')
}