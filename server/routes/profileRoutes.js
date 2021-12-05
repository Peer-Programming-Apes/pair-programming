const router = require("express").Router();

router.get("/", (req, res) => {
	// res.render("profile", { user: req.user });
	// console.log(req.user);
	console.log("responding from server after succesful fetching");
	res.json({ user: req.user }).status(200);
});

module.exports = router;
