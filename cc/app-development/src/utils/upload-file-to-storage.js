const { storage } = require('./firebase')

const uploadFileToStorage = async (file) => {
  const fileName = 'images/' + Date.now() + '_' + file.originalname
  const fileRef = storage.file(fileName)

  await fileRef.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
  })

  return `https://storage.googleapis.com/${storage.name}/${fileName}`
}

module.exports = uploadFileToStorage
