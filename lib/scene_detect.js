const fs = require('fs');
const debug = require("debug")("scene-detect");
const SceneDetectJob = require("./scene_detect_job.js");

class SceneDetect {
  constructor() {
    this.nextJobId = 1;
    this.jobs = {};
  }

  async createJob(mediaLocator) {
    let jobId = this.nextJobId++;
    fs.mkdirSync('/var/jobs/' + jobId);

    let job = new SceneDetectJob(jobId, mediaLocator, '/var/jobs/' + jobId);
    this.jobs[jobId] = job;

    await job.execute();
    return job;
  }

  getJob(id) {
    return this.jobs[id];
  }
};

module.exports = SceneDetect;