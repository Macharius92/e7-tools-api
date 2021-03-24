'use strict';
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
        let cache = await CachedData.findOneAndUpdate({id: 1}, {}, {new: true, upsert:true});
        let dtRef = moment().subtract(1, 'days').format('YYYYMMDD');
        if (!cache.hero || moment(cache.hero).format('YYYYMMDD') <= dtRef)
        {
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
            });
            await CachedData.findOneAndUpdate({ id: 1 }, { hero: new Date() }, { new: true, upsert: true });
        }
        let allHeroes = await Hero.find({}).exec();
        res.send(allHeroes);
    });

module.exports = router;