
const processUser = require('../../hooks/process-user');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [processUser()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
