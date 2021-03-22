'use strict';
const mongoose = require('mongoose');

const HeroSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique : true
    },
    class: {
        type: String,
        required: true
    },
    element: {
        type: String,
        required: true
    },
    horoscope: {
        type: String,
        required: true
    },
    rarity: {
        type: Number,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Hero', HeroSchema);