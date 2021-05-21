'use strict';
const mongoose = require('mongoose');
const guild = require('./Guild');

const UserSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    discriminator: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    guilds: { type: [guild.schema] },
    role: {
        type: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);