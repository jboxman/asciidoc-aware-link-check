const realLinkCheck = require('link-check');

// status in ['alive', 'dead']

const getResult = status => link => ({ link, status });
const alive = getResult('alive');
const dead = getResult('dead');

// Mock link checker in testing environment
module.exports = (function linkCheck() {
  if(process.argv[1].includes('riteway')) {
    return function(link, options = {}, callback = new Function()) {
      callback(null, alive(link))
    }
  }

  return realLinkCheck;
})();
