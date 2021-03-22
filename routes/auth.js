'use strict';
const express = require('express');
const passport = require('passport');
const { ensureAuth } = require('../middleware/auth');
const router = express.Router();

// @desc    Auth with Discord
// @route   GET /auth/discord
router.get('/discord', passport.authenticate('discord', { scope: ['identify', 'guilds'] }));

// @desc    Discord auth callback
// @route   GET /auth/discord/callback
router.get(
    '/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
        if (express().get('env') == 'development') res.redirect(process.env.CLIENT_APP_URL + '/signedin')
        else res.redirect('/signedin');
    }
);

router.get(
    '/session',
    function (req, res) {
        if (req.isAuthenticated()) res.send(true);
        else res.send(false);
    }
);

// @desc    Logout user
// @route   /auth/logout
router.get('/logout',
    ensureAuth,
    (req, res) => {
        console.log('logout');
        req.logout();
        if (express().get('env') == 'development') res.redirect(process.env.CLIENT_APP_URL + '/')
        else res.redirect('/');
    });

module.exports = router;