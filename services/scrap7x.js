'use strict';
const debug = require('debug')('E7ToolsAPI');
const Nightmare = require('nightmare');
const browserHeroes = new Nightmare();
const browserArtifacts = new Nightmare();

const scrapHeroes = async () => {
    debug("Start scraping characters");
    return browserHeroes
        .viewport(1600, 1200)
        .goto("https://epic7x.com/characters/")
        .evaluate(function () {
            // now we're executing inside the browser scope.
            return window.CHARACTERS;
        });
};

const scrapArtifacts = async () => {
    debug("Start scraping artifacts");
    return browserArtifacts
        .viewport(1600, 1200)
        .goto("https://epic7x.com/artifacts/")
        .evaluate(function () {
            // now we're executing inside the browser scope.
            return window.ARTIFACTS;
        });
};

module.exports = {scrapHeroes, scrapArtifacts};