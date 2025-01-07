const Listing = require("./models/listing");
const Review = require("./models/reviews");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema, userSchema } = require("./schema.js");

module.exports.isLoggedin = (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      // Store the redirect URL
      req.session.redirectUrl = req.originalUrl;
      req.flash("error", "You must be logged in to book a listing");
      return res.redirect("/login"); // Use `return` to prevent `next()` from being called
    }
    next(); // Proceed to the next middleware if authenticated
  } catch (error) {
    console.error(error); // Log the error for debugging
    next(error); // Pass the error to the Express error handler
  }
};


module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  // console.log(res.locals.currUser);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
}

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
}



module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
}



module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  // console.log(res.locals.currUser);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review ");
    return res.redirect(`/listings/${id}`);
  }
  next();
}