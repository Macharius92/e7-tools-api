'use strict';
const Nightmare = require('nightmare');

const scrapHeroes = async () => {
    return new Nightmare()
        .viewport(1600, 1200)
        .goto("https://epic7x.com/characters/")
        .evaluate(function () {
            // now we're executing inside the browser scope.
            return window.CHARACTERS;
        });
};

const scrapArtifacts = async () => {
    return new Nightmare()
        .viewport(1600, 1200)
        .goto("https://epic7x.com/artifacts/")
        .evaluate(function () {
            // now we're executing inside the browser scope.
            return window.ARTIFACTS;
        });
};

module.exports = {scrapHeroes, scrapArtifacts};