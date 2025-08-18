const ApiError = require("../exceptions/api-error");
const tokenService = require("../service/token-service");

module.exports = function (req, res, next) {
try {
    const authorizationHeader = req.headers.authorization 
    if(!authorizationHeader) {
        console.log(1)
        return next(ApiError.Unauthorized())
    }
    const accessToken = authorizationHeader.split(' ')[1];
    if(!accessToken) {
         console.log(2)
        return next(ApiError.Unauthorized())
    }
    const userData = tokenService.validateAccessToken(accessToken);
    if(!userData) {
         console.log(3)
        return next(ApiError.Unauthorized())
    }
    req.user = userData;
    next();
} catch (e) {
     console.log(4)
    return next(ApiError.Unauthorized())
    
}
}