const yup = require('yup')

const validatePost = async (postRequest) => {
  const postSchema = yup.object({
    title: yup.string().required(),
    caption: yup.string().required(),
    image: yup.string().url().required(),
    location: yup.string().required(),
    tags: yup.array().of(yup.string().required()).optional(),
  })

  return await postSchema.validate(postRequest)
}

module.exports = validatePost
