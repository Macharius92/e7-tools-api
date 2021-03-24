'use strict';
const mongoose = require('mongoose');

const ArtifactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique : true
    },
    class: {
        type: String,
        required: true
    },
    rarity: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Artifact', ArtifactSchema);