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
                await Artifact.findOneAndUpdate({ name: decode(artifact.name) }, newArtifact, { new: true, upsert: true });
            });
            await CachedData.findOneAndUpdate({ id: 1 }, { artifact: new Date() }, { new: true, upsert: true });
        }
        let allArtifacts = await Artifact.find({}).exec();
        res.json(allArtifacts);
    });

// GET /artifacts/:id
router.get('/:lang?/:id', ensureGuest,
    async (req, res) => {
        try {
            let artifact = await Artifact.findById(req.params.id);
            if (artifact === null) res.status(404).json({ errorMessage: "The ressource doesn't exist" });
            let transName = artifact.transName(req.params.lang);
            artifact = artifact.toObject();
            artifact = { ...artifact, ...{ transName: transName } };
            res.json({ message: 'Artifact obtained from database', data: artifact });
        }
        catch (e) {
            res.status(500).json({ errorMessage: "The server encountered an error. Please try again later." });
        }
    });

// POST /artifacts/:lang/:id
router.post('/:lang/:id', ensureAuth,
    async (req, res) => {
        try {
            let translatedName = req.body.data;
            let artifact = await Artifact.findById(req.params.id);
            if (artifact === null) res.status(404).json({ errorMessage: "The ressource doesn't exist" });

            let indexTranslation = artifact.i18n.findIndex(trans => trans.lang === req.params.lang);
            if (indexTranslation < 0) {
                let newTrans = [...artifact.i18n, ...[{ lang: req.params.lang, label: translatedName }]];
                artifact.i18n = newTrans;
                await artifact.save();
                artifact = await Artifact.findById(req.params.id);
                let transName = artifact.transName(req.params.lang);
                artifact = { ...artifact.toObject(), ...{ transName: transName } };
                res.json({ message: `Translation ${req.params.lang} created for the artifact ${artifact.name}`, data: artifact });
            }
            else {
                let transName = artifact.transName(req.params.lang);
                artifact = { ...artifact.toObject(), ...{ transName: transName } };
                return res.status(400).json({ errorMessage: `The artifact ${artifact.name} already have a translation for the language ${req.params.lang}`, data: artifact });
            }
        }
        catch (e) {
            res.status(500).json({ errorMessage: "The server encountered an error. Please try again later." });
        }
    });

// PUT /artifacts/:lang/:id
router.put('/:lang/:id', ensureAuth,
    async (req, res) => {
        try {
            let translatedName = req.body.data;
            let artifact = await Artifact.findById(req.params.id);
            if (artifact === null) res.status(404).json({ errorMessage: "The ressource doesn't exist" });

            let indexTranslation = artifact.i18n.findIndex(trans => trans.lang === req.params.lang);
            if (indexTranslation >= 0) artifact.i18n[indexTranslation].label = translatedName;
            else {
                //hero = {...hero, i18n:[...hero.i18n, [{lang:req.params.lang, label: translatedName}]]};
                return res.status(400).json({ errorMessage: `You can't update an unexisting translation for this artifact`, data: artifact });
            }
            await artifact.save();

            artifact = await Artifact.findById(req.params.id);
            let transName = artifact.transName(req.params.lang);
            artifact = { ...artifact.toObject(), ...{ transName: transName } };
            res.json({ message: `Translation ${req.params.lang} updated for the artifact ${artifact.name}`, data: artifact });
        }
        catch (e) {
            res.status(500).json({ errorMessage: "The server encountered an error. Please try again later." });
        }
    });

module.exports = router;