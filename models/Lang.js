'use strict';
const mongoose = require('mongoose');

const LangSchema = new mongoose.Schema({
    lang: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Lang', LangSchema);