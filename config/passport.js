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

                let guilds = profile.guilds.map((guild) => {
                    return {
                        discordGuildId: guild.id,
                        guildName: guild.name
                    };
                });

                const newUser = {
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
                    let admins = process.env.ADMIN || "";
                    let userId = user._id;
                    // User is in ADMIN list
                    if (admins.split(';').includes(user.discordId))
                    {
                        // User already has roles
                        if (user.role)
                        {
                            // But not yet Admin role
                            if (!user.role.includes('admin')) user.role.push('admin');
                        }
                        // if not we add the Admin role
                        else user.role = ['admin'];
                        await user.save();
                        user = await User.findById(userId);
                    }
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