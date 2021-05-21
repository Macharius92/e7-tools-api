module.exports = {
    ensureAuth: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/');
        }
    },
    ensureAdm: function (req, res, next) {
        if (req.user.role.includes('admin')) {
            return next();
        } else {
            res.status(403).json({errorMessage : 'Access forbidden - Unsufficient privileges'});
        }
    },
    ensureGuest: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/signedin');
        }
    }
};