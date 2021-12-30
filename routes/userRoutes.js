const router = require("express").Router();
const checkUser = require("../middlewares/authMiddleware");

const dummuy = {
	_id: { $oid: "61c9c1a2aa9b1771bcf4501f" },
	googleID: "108824220111422489847",
	email: "juit23drive@gmail.com",
	name: "Subodh Singh",
	picture:
		"https://lh3.googleusercontent.com/a/AATXAJyiNORTDKaXfsVgP-LTflPygv3JgxfKLkXRmLiR=s96-c",
	sharedSessions: [],
	userSessions: [
		{
			name: "session 1",
			sessionId: { $oid: "61cc7ee2a48310a1fd3aff8c" },
			createdAt: { $date: { $numberLong: "1640791778533" } },
		},
	],
	__v: { $numberInt: "0" },
};
//fetch current data from the database and send it back to
router.get("/", checkUser, (req, res) => {
	// res.render("profile", { user: req.user });
	// console.log(req.user);
	res.json({ user: dummuy }).status(200);
});

module.exports = router;
