const https = require('https');
const querystring = require('querystring');

class CPS {
  constructor(subscribernumber, buildingId, floor) {
    this.buildingId = buildingId;
    this.floor = floor;
    this.agent = new https.Agent({ keepAlive: true, maxSockets: 10 });
    this.subscribernumber = subscribernumber;
    this.activeSession = false;

    // ?cmd=startLearning&isIndoor=1&buildingId=167&floor=1&subscribernumber=robotslamimei&timestamp=1490950899
    this.options = {
      hostname: 'cpsdev.combain.com',
      protocol: 'https:',
      path: '/client/wifiscansubmit.php'
    };
  }

  async startSession(timestamp) {
    if (this.activeSession)
      throw new Error('There is already a session running, please stop it before attempting to start a new.');

    try {
      const res = await this._get('startLearning', timestamp);
      console.log('Successfully started SLAM session.');
    } catch (error) {
      throw error;
    }
  }

  async stopSession(timestamp) {
    if (this.activeSession)
      throw new Error('There is no session running, please start one before attempting to stop it.');

    try {
      const res = await this._get('stopLearning', timestamp);
      console.log('Successfully stopped SLAM session.');
    } catch (error) {
      throw error;
    }
  }

  async sendPoint(data) {
    try {
      const res = await this._post(data);
      //console.log('Successfully sent SLAM point.');
    } catch (error) {
      throw error;
    }
  }

  async _get(cmd, timestamp) {
    const promise = new Promise((resolve, reject) => {
      const options = this._createOptions({
        data: {
          cmd: cmd,
          isIndoor: 1,
          buildingId: this.buildingId,
          floor: this.floor,
          subscribernumber: this.subscribernumber,
          timestamp: timestamp
        }
      });
      const req = https.request(options, (res) => {
        if (res.statusCode !== 200) {
          const error = new Error(`SLAM session stop failed. HTTP status code: ${res.statusCode}`);
          res.resume();
          reject(error);
        } else {
          resolve(res);
        }
      });
      req.end();
    });
    return promise;
  }

  async _post(data) {
    const promise = new Promise((resolve, reject) => {
      const options = this._createOptions({
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Content-Length': Buffer.byteLength(data)
        }
      });
      const req = https.request(options, (res) => {
        if (res.statusCode !== 200) {
          const error = new Error(`SLAM point export failed. HTTP status code: ${res.statusCode}`);
          res.resume();
          reject(error);
        } else {
          resolve(res);
        }
      });
      req.end(data);
    });
    return promise;
  }

  _createOptions(options) {
    // use this.options for default values
    let opt = Object.assign({}, this.options);
    opt = Object.assign(opt, options);
    // format get query string
    if ('data' in opt) {
      opt.path = opt.path + '?' + querystring.stringify(opt.data)
    }
    return opt;
  }
}

module.exports = CPS;
