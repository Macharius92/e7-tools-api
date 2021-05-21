const BuildDiscordImageUrl = (id, name) => {
    const baseUrl = 'https://cdn.discordapp.com/avatars/';

    return baseUrl + id + "/" + name + ".png?size=32";
};

module.exports = BuildDiscordImageUrl;