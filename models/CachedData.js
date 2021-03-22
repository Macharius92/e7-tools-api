'use strict';
const mongoose = require('mongoose');

const CacheSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    hero: {
        type: Date
    },
    artifact: {
        type: Date
    }
});

module.exports = mongoose.model('CacheData', CacheSchema);