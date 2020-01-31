// routes.js
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const { matchedData } = require("express-validator/filter");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
homeStartingContent = "sss";
var imgName;
var imgData;
var a;
var Schema = mongoose.Schema;

mongoose.connect(
  "mongodb+srv://java:gogomaster@database-qrvyh.mongodb.net/img?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

// example schema
var schema = new Schema({
  msg: String,
  email: String,
  img: { data: Buffer, contentType: String }
});

// our model
var A = mongoose.model("A", schema);

mongoose.connection.on("open", function() {
  console.error("mongo is open");
});

router.get("/", (req, res) => {
  A.find({}, function(err, as) {
    res.render("home", {
      content: homeStartingContent,
      posts: as
    });
  }); 
});

// routes.js
router.get("/contact", (req, res) => {
  res.render("contact", {
    data: {},
    errors: {},
    csrfToken: req.csrfToken()
  });
});

router.post(
  "/contact",
  upload.single("photo"),
  [
    check("message")
      .isLength({ min: 1 })
      .withMessage("Message is required")
      .trim(),
    check("email")
      .isEmail()
      .withMessage("That email doesn‘t look right")
      .trim()
      .normalizeEmail()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("contact", {
        data: req.body,
        errors: errors.mapped(),
        csrfToken: req.csrfToken()
      });
    }
    if (req.file) {
      imgName = req.file.originalname;
      imgData = req.file.buffer;

      // store an img in binary in mongo
      a = new A();
      a.img.data = imgData;
      a.img.contentType = "image/png";
      const data = matchedData(req);
      a.msg = data.message;
      a.email = data.email;
      a.save(function(err, a) {
        if (err) throw err;
        console.error("saved img to mongo");
      });
    }
    req.flash("success", "Thanks for the message! I‘ll be in touch :)");
    res.redirect("/");
  }
);

router.get("/posts/:postId", function(req, res) {
  const requestedId = req.params.postId;
  //  requestedId = requestedId.trim();

  A.findOne({ _id: requestedId }, function(err, as) {
    // A.findById(a, function(err, as){
    res.contentType(as.img.contentType);
    res.send(as.img.data);
    // res.render("post", {
    //   email: as.email,
    //   msg: as.msg,
    //   img: as.img
    // });
  });
});

// var server = express();
// server.get('/', function (req, res, next) {
//   A.findById(a, function (err, doc) {
//     if (err) return next(err);
//     res.contentType(doc.img.contentType);
//     res.send(doc.img.data);
//   });
// });

module.exports = router;
