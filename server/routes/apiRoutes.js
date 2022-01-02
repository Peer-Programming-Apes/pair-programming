const app = require("express")();
const router = require("express").Router();
const sessionRoutes = require("./sessionRoutes");
const documentRoutes = require("./documentRoutes");
const userRoutes = require("./userRoutes");

router.get("/", (req, res) => {
	res.json("inside api").status(200);
});

router.use("/session", sessionRoutes);
router.use("/document", documentRoutes);
router.use("/user", userRoutes);

module.exports = router;
