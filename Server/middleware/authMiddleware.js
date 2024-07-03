const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');


const protect = asyncHandler(async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token) {
            return res.status(403).json({ message: 'Authentication required' });
          }


        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { _id: decodedData?.id };

        next();
    } catch (error) {
        res.status(403).json({ message: 'Token verification failed' });
        console.log(error);
    }
});

module.exports = { protect };
