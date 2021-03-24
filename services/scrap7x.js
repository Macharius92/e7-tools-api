'use strict';
const debug = require('debug')('E7ToolsAPI');
const Nightmare = require('nightmare');

const scrapHeroes = async () => {
    debug("Start scraping characters");
    return new Nightmare()
        .viewport(1600, 1200)
        .goto("https://epic7x.com/characters/")
        .evaluate(function () {
            // now we're executing inside the browser scope.
            return window.CHARACTERS;
        });
};

const scrapArtifacts = async () => {
    debug("Start scraping artifacts");
    return new Nightmare()
        .viewport(1600, 1200)
        .goto("https://epic7x.com/artifacts/")
        .evaluate(function () {
            // now we're executing inside the browser scope.
            return window.ARTIFACTS;
        });
};

module.exports = {scrapHeroes, scrapArtifacts};