const format = require('util').format;

function logger() {
  const logs = {
    stdout: [],
    stderr: []
  };

  return {
    log(v) {
      return logs['stdout'].push(format(v, ...Array.from(arguments).slice(1)));
    },

    error(v) {
      return logs['stderr'].push(format(v, ...Array.from(arguments).slice(1)));
    },

    getLog(key) {
      return logs[key];
    },

    reset() {
      for(const key of ['stdout', 'stderr']) {
        logs[key] = [];
      }
    }
  }
}

module.exports = {
  logger
};
