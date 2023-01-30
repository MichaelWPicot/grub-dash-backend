const router = require("express").Router();
const controller = require("./dishes.controller");
//const usesRouter = require("../uses/uses.router")
const methodNotAllowed = require("../errors/methodNotAllowed");

//router.use("/:urlId/uses", controller.urlExists, usesRouter)

router
  .route("/:dishId")
  .get(controller.read)
  .put(controller.update)
  .all(methodNotAllowed);

router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router;
