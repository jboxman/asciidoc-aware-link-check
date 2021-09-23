// All from `asciidoc-validate-yaml/lib/index.js`
// TODO - refactor into git-subtree repo

const fsPath = require('path');

function walkTopics(node, path = '') {
  const { Dir: dir, Topics: topics } = node;
  if(!path) path = dir;
  const accum = [];

  const createObj = ({ title, path }) => ({
    title,
    path
  });

  for(const topic of topics) {
    if(topic.hasOwnProperty('Topics')) {
      accum.push(...walkTopics(topic, fsPath.join(path, topic['Dir'])));
    }
    else {
      accum.push(createObj({
        title: topic['Name'],
        path: fsPath.join(path, topic['File'])
      }));
    }
  }

  return accum;
}

function parseAttributes(v = []) {
  const attributes = (v || []).reduce((accum, pair) => {
    if(/^[A-Za-z0-9-]+=?[A-Za-z0-9-.]*$/.test(pair)) {
      const els = pair.split(/=/);
      return {
        ...accum,
        [els[0]]: els.length == 2 ? els[1] : ''
      };
    }
    return accum;
  }, {});

  return attributes;
}

function pairAttributes(v = {}) {
  return Object.entries(v || {}).reduce((accum, [k, v]) => {
    return accum += `${k}=${v} `
  }, 'Attributes: ').trim();
}

// https://humanwhocodes.com/snippets/2019/05/nodejs-read-stream-promise/
function readStream(stream, encoding = "utf8", timeout = 10) {

  stream.setEncoding(encoding);

  return new Promise((resolve, reject) => {
    let data = "";
    // https://stackoverflow.com/a/53347693
    const abort = setTimeout(onTimeout, timeout);

    function onData(chunk) { data += chunk; }
    function onError(error) { reject(error); }
    // Never called if STDIN never receives EOF
    function onEnd() { clearTimeout(abort); resolve(data.split(/\n/)); }

    function onTimeout() {
      stream.removeListener('data', onData);
      stream.removeListener('end', onEnd)
      stream.removeListener('error', onError);
      resolve(false);
    };

    stream.on("data", onData);
    stream.on("end", onEnd);
    stream.on("error", onError);
  });
}

module.exports = {
  walkTopics,
  parseAttributes,
  pairAttributes,
  readStream
};
