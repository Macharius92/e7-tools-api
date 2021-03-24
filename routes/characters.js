'use strict';
const debug = require('debug')('E7ToolsAPI');
const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const CachedData = require('../models/CachedData');
const Hero = require('../models/Hero');
const { scrapHeroes } = require('../services/scrap7x');
const moment = require('moment');
const {decode} = require('html-entities');

router.get('/',
    ensureGuest,
    async (req, res) => {
        debug("GET characters");
        let cache = await CachedData.findOneAndUpdate({id: 1}, {}, {new: true, upsert:true});
        let dtRef = moment().subtract(1, 'days').format('YYYYMMDD');
        debug("Avant check cache");
        if (!cache.hero || moment(cache.hero).format('YYYYMMDD') <= dtRef)
        {
            debug("Dans refresh");
            let heroes = await scrapHeroes();
            heroes.map(async (hero) => {
                let newHero = {
                    class: hero.class,
                    element: hero.element,
                    horoscope: hero.horoscope,
                    rarity: hero.rarity,
                    icon: hero.icon,
                    link: hero.link
                };
                await Hero.findOneAndUpdate({ name: decode(hero.name)}, newHero, {new: true, upsert: true});
                debug(`Traitment ${decode(hero.name)}`);
            });
            await CachedData.findOneAndUpdate({ id: 1 }, { hero: new Date() }, { new: true, upsert: true });
            debug("Fin refresh");
        }
        let allHeroes = await Hero.find({}).exec();
        debug("Réponse");
        res.send(allHeroes);
    });

module.exports = router;