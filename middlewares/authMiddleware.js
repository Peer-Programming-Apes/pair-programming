const checkUser = (req, res, next) => {
	console.log("entering middleware");
	if (req.user) {
		console.log("middleware success : ", req.user);
		next();
	} else {
		console.log("middleware failure");
		res.status(403).json("unauthorized");
	}
};

module.exports = checkUser;
