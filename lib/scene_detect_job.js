const fs = require('fs');
const debug = require("debug")("scene-detect");
const { spawn } = require("child_process");
const uuid = require("uuid-random");

const STATE_CREATED = 'created';
const STATE_RUNNING = 'running';
const STATE_COMPLETED = 'completed';
const STATE_FAILED = 'failed';
const STATE_CANCELLED = 'cancelled';

class SceneDetectJob {
  constructor(jobId, mediaLocator, workdir) {
    this.jobId = jobId;
    this.mediaLocator = mediaLocator;
    this.workdir = workdir;
    this.state = STATE_CREATED;
    this.session = uuid();
  }

  execute() {
    return new Promise((resolve, reject) => {
      const child = spawn('ffmpeg',
        [ '-i', this.mediaLocator,
          '-filter_complex', `select=\'gt(scene,0.4)\',metadata=print:file=${this.workdir}/time.txt`,
          '-vsync', 'vfr', `${this.workdir}/img%03d.png`
        ]
      );
      this.process = child;
      debug(this.process.spawnargs);
      this.state = STATE_RUNNING;

      this.process.stdout.on('data', data => {
        debug(`${data}`);
      });
      this.process.stderr.on('data', data => {
        debug(`${data}`);
        resolve();
      });
      this.process.on('exit', code => {
        debug(`Exit code is ${code}`);
        this.process = undefined;
        if (code > 0) {
          this.state = STATE_FAILED;
          reject(new Error('Failed to execute job'));
        } else {
          this.state = STATE_COMPLETED;
        }
      });
    });
  }

  cancel() {
    if (!this.process) {
      throw new Error('Cannot cancel a job that is not running');
    }

    this.process.kill("SIGKILL");
    this.state = STATE_CANCELLED;
    return this.getStatus();
  }

  getJobId() {
    return this.jobId;
  }

  getStatus() {
    return {
      id: this.jobId,
      state: this.state,
      session: this.session,
    }
  }

  async getDetectedThumbnails() {
    if (this.state === STATE_FAILED) {
      throw new Error("Can't get thumbnails of a job that has failed");
    }

    const items = await fs.promises.readdir(this.workdir);
    const images = items.filter(filename => filename.match(/.png$/)).map((f, idx) => {
      return `/images/${this.jobId}/${f}`
    });
    return images;
  }

  async cleanup() {
    await fs.promises.rmdir(this.workdir, { recursive: true });
  }
}

module.exports = SceneDetectJob;