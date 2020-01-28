const Restify = require("restify");
const errs = require("restify-errors");
const SwaggerUI = require("swagger-ui-restify");

const debug = require("debug")("function-scenes");
const uuid = require("uuid-random");

const SceneDetect = require("./lib/scene_detect.js");

const wrap = function(fn) {
  return function(req, res, next) {
      return fn(req, res, next).catch(function(err) {
          return next(err);
      });
  };
};

const sceneDetect = new SceneDetect();

const SERVER_ID = process.env.SERVER_ID || uuid();

let server = Restify.createServer();
server.use(Restify.plugins.queryParser());
server.use(Restify.plugins.bodyParser());

// API Documentation
const apiDocument = require("./api.json");
server.get("/api/docs/*", ...SwaggerUI.serve);
server.get("/api/docs/", SwaggerUI.setup(apiDocument));

// Healthcheck endpoint
server.get("/", (req, res, next) => {
  debug(`req.url=${req.url}`);
  res.send(200);
  next();
});

server.post("/api/v1", wrap(async (req, res, next) => {
  debug(`req.url=${req.url}`);
  debug("req.body=%o", req.body);

  if (req.body) {
    try {
      const mediaLocator = req.body.medialocator;
      const job = await sceneDetect.createJob(mediaLocator);
      res.send(200, {
        thumbnails: `/api/v1/${job.getJobId()}/thumbnails`,
        status: `/api/v1/${job.getJobId()}/status`
      },
      { headers: { 'x-server-id': SERVER_ID }});
      next();
    } catch (errObj) {
      debug("Error: %o", errObj);
      const err = new errs.InternalServerError(errObj.message);
      next(err);
    }
  } else {
    next(new errs.InvalidContentError("Missing Request Body"));
  }
}));

server.get("/api/v1/:id/thumbnails", wrap(async (req, res, next) => {
  debug(`req.url=${req.url}`);
  debug(`params.id=${req.params.id}`);

  try {
    const job = sceneDetect.getJob(req.params.id);
    const thumbnails = await job.getDetectedThumbnails()
    res.send(200, thumbnails, { headers: { 'x-server-id': SERVER_ID }});
  } catch (errObj) {
    debug("Error: %o", errObj);
    const err = new errs.InternalServerError(errObj.message);
    next(err);
  }
}));

server.get("/api/v1/:id/status", (req, res, next) => {
  debug(`req.url=${req.url}`);
  debug(`params.id=${req.params.id}`);

  try {
    const job = sceneDetect.getJob(req.params.id);
    res.send(200, job.getStatus(), { headers: { 'x-server-id': SERVER_ID }});
  } catch (errObj) {
    debug("Error: %o", errObj);
    const err = new errs.InternalServerError(errObj.message);
    next(err);
  }
});

server.put("/api/v1/:id/status", (req, res, next) => {
  debug(`req.url=${req.url}`);
  debug(`params.id=${req.params.id}`);
  debug("req.body=%o", req.body);

  if (req.body) {
    try {
      if (req.body.state === "cancel") {
        const job = sceneDetect.getJob(req.params.id);
        const newStatus = job.cancel();
        res.send(200, newStatus, { headers: { 'x-server-id': SERVER_ID }});
      } else {
        throw new Error("Invalid state requested, expecting [cancel]");
      }
    } catch(errObj) {
      debug("Error: %o", errObj);
      const err = new errs.InternalServerError(errObj.message);
      next(err);
    }
  } else {
    next(new errs.InvalidContentError("Missing Request Body"));
  }
});

server.del("/api/v1/:id", wrap (async (req, res, next) => {
  debug(`req.url=${req.url}`);
  debug(`params.id=${req.params.id}`);

  try {
    sceneDetect.deleteJob(req.params.id);
    res.send(200, { message: 'Job deleted' }, { headers: { 'x-server-id': SERVER_ID }});
  } catch (errObj) {
    debug("Error: %o", errObj);
    const err = new errs.InternalServerError(errObj.message);
    next(err);
  }
}));

// Generated files
server.get("/images/*", Restify.plugins.serveStaticFiles('/var/jobs/'));

server.listen(process.env.PORT || 3000, () => {
  debug(`${server.name} listening at ${server.url}`);
});