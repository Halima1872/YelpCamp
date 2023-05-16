const express = require('express')
//we have to use merge params because the id part is in the router ahead in app.js
const router = express.Router({mergeParams: true})
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Review =require('../models/review')
const Campground = require('../models/campground')
const {validateReview , isLoggedIn, isReviewAuthor } = require('../middleware')
const reviews = require('../controllers/reviews')

router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReview))
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview))

module.exports = router