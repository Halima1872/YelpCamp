//seeds file is used to initially feed some data in the website
const mongoose = require('mongoose');
const cities = require('./cities')
const {places,descriptors} = require('./seedhelpers')
const Campground = require('../models/campground')
//All the set up
mongoose.set('strictQuery', true);

//Initially connecting the database
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then(() => {
    console.log("Mongo Connection Established!")
}).catch((err) => {
    console.log("Mongo Failed to connect!")
    console.log(err)
});
//random element generating function
const random = array => array[Math.floor(Math.random() * array.length)]
//function that will feed the data
const seedDB = async() =>{
    await Campground.deleteMany({})
    for(let i=0; i<300;i++)
    {
        const random1000 = Math.floor(Math.random() * 1000)
        const price=Math.floor(Math.random() * 30) + 10
        const camp= new Campground({
            title: `${ random(descriptors)} ${random(places)}`,
            location : `${cities[random1000].city},${cities[random1000].state}`,
            images:  [
                {
                  url: 'https://res.cloudinary.com/dfvahjj67/image/upload/v1681298229/YelpCamp/tad8w055v7hnfyn4zizl.jpg',
                  filename: 'YelpCamp/tad8w055v7hnfyn4zizl',
                },
                {
                  url: 'https://res.cloudinary.com/dfvahjj67/image/upload/v1681298230/YelpCamp/tak097qdh0ctqo8mgqcv.jpg',
                  filename: 'YelpCamp/tak097qdh0ctqo8mgqcv',
                }
              ],
            description: 'fhjveruihgfiurehghjkgbhsdjkfgvhuyie3wghfu',
            price:price,
            author : '6434386daae65911109a3db8',
            geometry:{
                 type: 'Point', 
                 coordinates: [ 
                    cities[random1000].longitude,
                    cities[random1000].latitude
                  ] 
            }
        })
        await camp.save();
    }
    
}
seedDB().then(() => {
    mongoose.connection.close()
})