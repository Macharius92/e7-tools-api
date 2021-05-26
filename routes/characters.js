'use strict';
const debug = require('debug')('E7ToolsAPI');
const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest, ensureAdm } = require('../middleware/auth');
const CachedData = require('../models/CachedData');
const Hero = require('../models/Hero');
const { scrapHeroes } = require('../services/scrap7x');
const moment = require('moment');
const {decode} = require('html-entities');

// GET /characters/:lang?
router.get('/:lang?',
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
        allHeroes = allHeroes.map((hero) => {return {...hero.toObject(), ...{ transName: hero.transName(req.params.lang) }};});
        res.json(allHeroes);
    });

// GET /characters/:id
router.get('/:lang?/:id', ensureAuth,
    async (req, res) => {
        try {
            let hero = await Hero.findById(req.params.id);
            if (hero === null) res.status(404).json({errorMessage:"The ressource doesn't exist"});
            let transName = hero.transName(req.params.lang);
            hero = hero.toObject();
            hero = {...hero, ...{transName: transName}};
            res.json({message: 'Hero obtained from database', data: hero});
        }
        catch (e) {
            res.status(500).json({ errorMessage:"The server encountered an error. Please try again later."});
        }
    });

// POST /characters/:lang/:id
router.post('/:lang/:id', ensureAuth,
    async (req, res) => {
        try {
            let translatedName = req.body.data;
            let hero = await Hero.findById(req.params.id);
            if (hero === null) res.status(404).json({ errorMessage: "The ressource doesn't exist" });

            let indexTranslation = hero.i18n.findIndex(trans => trans.lang === req.params.lang);
            if (indexTranslation < 0) {
                let newTrans = [...hero.i18n, ...[{ lang: req.params.lang, label: translatedName }]];
                hero.i18n = newTrans;
                await hero.save();
                hero = await Hero.findById(req.params.id);
                let transName = hero.transName(req.params.lang);
                hero = { ...hero.toObject(), ...{ transName: transName } };
                res.json({ message: `Translation ${req.params.lang} created for the hero ${hero.name}`, data: hero });
            }
            else {
                let transName = hero.transName(req.params.lang);
                hero = { ...hero.toObject(), ...{ transName: transName } };
                return res.status(400).json({ errorMessage: `The hero ${hero.name} already have a translation for the language ${req.params.lang}`, data:hero});
            }
        }
        catch (e) {
            res.status(500).json({ errorMessage: "The server encountered an error. Please try again later." });
        }
    });

// PUT /characters/:lang/:id
router.put('/:lang/:id', ensureAuth,
    async (req,res) => {
        try {
            let translatedName = req.body.data;
            let hero = await Hero.findById(req.params.id);
            if (hero === null) res.status(404).json({ errorMessage: "The ressource doesn't exist" });

            let indexTranslation = hero.i18n.findIndex(trans => trans.lang === req.params.lang);
            if (indexTranslation >= 0) hero.i18n[indexTranslation].label = translatedName;
            else {
                return res.status(400).json({errorMessage: `You can't update an unexisting translation for this hero`, data:hero});
            }
            await hero.save();

            hero = await Hero.findById(req.params.id);
            let transName = hero.transName(req.params.lang);
            hero = { ...hero.toObject(), ...{ transName: transName } };
            res.json({ message: `Translation ${req.params.lang} updated for the hero ${hero.name}`, data: hero});
        }
        catch (e) {
            res.status(500).json({ errorMessage: "The server encountered an error. Please try again later." });
        }
    });

module.exports = router;