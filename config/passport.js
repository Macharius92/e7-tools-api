const express = require('express');
const DiscordStrategy = require('passport-discord').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');
//const Guild = require('../models/Guild');

module.exports = function (passport) {
    let callbackURL = (express().get('env') == 'development' ? process.env.CLIENT_APP_URL : '') + '/auth/discord/callback';
    passport.use(
        new DiscordStrategy(
            {
                clientID: process.env.DISCORD_CLIENT_ID,
                clientSecret: process.env.DISCORD_CLIENT_SECRET,
                callbackURL: callbackURL,
                scope: ['identify', 'guilds']
            },
            async (accessToken, refreshToken, profile, done) => {
                //console.log(profile);
                let guilds = new Array();
                profile.guilds.forEach((guild) => {
                    guilds.push({
                        discordGuildId: guild.id,
                        guildName: guild.name
                    });
                });

                const newUser = {
                    //discordId: profile.id,
                    userName: profile.username,
                    discriminator: profile.discriminator,
                    image: profile.avatar,
                    guilds: guilds
                };

                try {
                    let user = await User.findOneAndUpdate({ discordId: profile.id },
                        newUser,
                        {
                            new: true,
                            upsert: true
                        });
                    done(null, user);
                } catch (err) {
                    console.error(err);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user));
    });
};