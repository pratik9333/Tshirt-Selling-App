const router = require("express").Router();

const { home, dummyUrl } = require("../Controllers/home");

//Home url
router.route("/").get(home);

//Dummy url
router.route("/dummy").get(dummyUrl);

module.exports = router;
