const checkUser = (req, res, next) => {
	if (req.user) {
		console.log("checkUser middleware server side passed",req.user);
		next();
	} else {
		console.log("checkUser middleware server side failed");
		res.status(403).json("unauthorized");
	}
};

module.exports = checkUser;
