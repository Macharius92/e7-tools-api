'use strict';
const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const CachedData = require('../models/CachedData');
const Artifact = require('../models/Artifact');
const { scrapArtifacts } = require('../services/scrap7x');
const moment = require('moment');

router.get('/',
    ensureGuest,
    async (req, res) => {
        let cache = await CachedData.findOneAndUpdate({id: 1}, {}, { new: true, upsert:true });
        let dtRef = moment().subtract(1, 'days').format('YYYYMMDD');
        if (!cache.artifact || moment(cache.artifact).format('YYYYMMDD') <= dtRef)
        {
            let artifacts = await scrapArtifacts();
            artifacts.map(async (artifact) => {
                let newArtifact = {
                    class: artifact.class,
                    rarity: artifact.rarity,
                    image: artifact.image,
                    link: artifact.link
                };
                await Artifact.findOneAndUpdate({ name: artifact.name }, newArtifact, { new: true, upsert: true });
            });
            await CachedData.findOneAndUpdate({ id: 1 }, { artifact: new Date() }, { new: true, upsert: true });
        }
        let allArtifacts = await Artifact.find({}).exec();
        res.send(allArtifacts);
    });

module.exports = router;