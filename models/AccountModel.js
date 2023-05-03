const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AccountSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
    },
    password: String,
    fullname: String,
})

module.exports = mongoose.model('Account', AccountSchema)
