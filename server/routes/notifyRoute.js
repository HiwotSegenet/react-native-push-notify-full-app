const { testNotify } = require("../controllers/notifyController");

const router = require("express").Router();

router.post("/notification", testNotify);

module.exports = router;