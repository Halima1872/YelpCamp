const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    email : {
        type: String,
        required: true,
        unique: true
    }
})
//add on to the schema username and password, makes sue username are unique and provides additional methods
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User',UserSchema)