const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing");
const { isLoggedin, isOwner, validateListing } = require("../middleware.js");


//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", isLoggedin, (req, res) => {
    res.render("listings/new.ejs");
});

router.get("/bookings", isLoggedin, (req, res) => {
    res.render('listings/booking');
})
router.get("/payments", isLoggedin, (req, res) => {
    res.render('listings/payment');
})

//Search route
router.get('/search', async (req, res) => {
    try {
        // Step 2: Extract Query Parameters
        const { title } = req.query;
        console.log('Query Parameters:', { title });
        // Step 3: Build the Query
        let query = {};
        if (title) query.title = { $regex: title, $options: 'i' }; // Case-insensitive search
        // if (city) query.city = { $regex: city, $options: 'i' };
        // if (country) query.country = { $regex: country, $options: 'i' };


        // Step 4: Execute the Query
        const allListings = await Listing.find(query);
        res.render("./listings/index.ejs", { allListings });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while searching for documents.' });
    }
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "The listing you requested does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post("/", isLoggedin, validateListing, wrapAsync(async (req, res, next) => {

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    res.redirect("/listings");
    req.flash("success", "New listing Created!");

}));

//Edit Route
router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "The listing you requested does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id", isLoggedin, isOwner, validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id", isLoggedin, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted successfully!");

    res.redirect("/listings");
}));

router.get("/filter/:category", async (req, res) => {
    const { category } = req.params;
    try {
        const filteredListings = await Listing.find({ category: category });

        if (filteredListings.length > 0) {
            res.render('listings/index', { allListings: filteredListings });
        } else {
            req.flash('error', 'No listings found in this category');
            res.redirect('/listings');
        }
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while filtering listings');
        res.redirect('/listings');
    }
});











module.exports = router;