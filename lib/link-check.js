const realLinkCheck = require('link-check');

// status in ['alive', 'dead']

const getResult = status => link => ({ link, status });
const alive = getResult('alive');
const dead = getResult('dead');
const fakeResult = { alive, dead };
var fake;

// Mock link checker in testing environment
const getLinkCheck = (function getLinkCheck() {

  if(process.argv[1].includes('riteway')) {
    return function(link, options = {}, callback = new Function()) {
      callback(null, fakeResult[fake](link) ? fakeResult[fake](link) : alive(link));
    }
  }

  return realLinkCheck;
})();

getLinkCheck.setFake = function() {
  return {
    dead: function() {
      fake = 'dead';
    },
    alive: function() {
      fake = 'alive';
    }
  }
}

module.exports = getLinkCheck;
