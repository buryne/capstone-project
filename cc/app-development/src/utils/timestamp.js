const { firebase } = require('./firebase')

const getTimestamp = () => {
  return firebase.firestore.Timestamp.fromDate(new Date())
}

module.exports = getTimestamp
