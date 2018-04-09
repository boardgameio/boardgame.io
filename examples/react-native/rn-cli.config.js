const path = require('path');

module.exports = {
  getProjectRoots: () => [__dirname, path.join(__dirname, '..')],
};
