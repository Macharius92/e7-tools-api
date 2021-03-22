'use strict';
const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const Nightmare = require('nightmare');

// @desc    Login/Landing page
// @route   GET /
router.get('/',
    ensureGuest,
    (req, res) => {
        res.send("<a href='/auth/discord/'>Connect with Discord</a>");
    });

// @desc    Signedin
// @route   GET /signedin
router.get('/signedin',
    ensureAuth,
    async (req, res) => {
        try {
            var html = "Youpi ! Welcome " + req.user.userName + "#" + req.user.discriminator + "<br />";
            html += "You are in the following guilds :<br />";
            html += "<ul>";
            req.user.guilds.forEach((guild) => { html += "<li>" + guild.guildName + "</li>" });
            html += "</ul>";
            html += "<hr>";
            html += "<a href='/auth/logout'>Logout</a>";
            res.send(html);
        } catch (err) {
            console.error(err);
            res.send('error/500', 500);
        }
    });

module.exports = router;