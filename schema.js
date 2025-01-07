const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().trim().strict().required(),
        location: Joi.string().required().trim().strict(),
        country: Joi.string().required().trim().strict(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null)

    })
}).required()


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    })
}).required()










