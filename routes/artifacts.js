'use strict';
const debug = require('debug')('E7ToolsAPI');
const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const CachedData = require('../models/CachedData');
const Artifact = require('../models/Artifact');
const { scrapArtifacts } = require('../services/scrap7x');
const moment = require('moment');
const { decode } = require('html-entities');

router.get('/',
    ensureGuest,
    async (req, res) => {
        debug("GET artifacts");
        let cache = await CachedData.findOneAndUpdate({id: 1}, {}, { new: true, upsert:true });
        let dtRef = moment().subtract(1, 'days').format('YYYYMMDD');
        debug("Avant check cache");
        if (!cache.artifact || moment(cache.artifact).format('YYYYMMDD') <= dtRef)
        {
            debug("Dans refresh");
            let artifacts = await scrapArtifacts();
            artifacts.map(async (artifact) => {
                let newArtifact = {
                    class: artifact.class,
                    rarity: artifact.rarity,
                    image: artifact.image,
                    link: artifact.link
                };
                await Artifact.findOneAndUpdate({ name: decode(artifact.name) }, newArtifact, { new: true, upsert: true });
                debug(`Traitment ${artifact.name}`);
            });
            await CachedData.findOneAndUpdate({ id: 1 }, { artifact: new Date() }, { new: true, upsert: true });
            debug("Fin refresh");
        }
        let allArtifacts = await Artifact.find({}).exec();
        debug("Réponse");
        res.send(allArtifacts);
    });

module.exports = router;