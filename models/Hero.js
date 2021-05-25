'use strict';
const mongoose = require('mongoose');
const lang = require('./Lang');

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
    },
    i18n: {
        type: [lang.schema]
    }
});

HeroSchema.method('transName', function(lang) {
    if (lang !== undefined && lang !== null)
    {
        let translation = this.i18n.find(trans => trans.lang === lang);
        if (translation) return translation.label;
    }
    return this.name;
});

module.exports = mongoose.model('Hero', HeroSchema, 'heroes');