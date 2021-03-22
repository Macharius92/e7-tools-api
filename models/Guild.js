'use strict';
const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    discordGuildId: {
        type: String,
        required: true
    },
    guildName: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Guild', GuildSchema);