const Product = require("../models/product");
const cloudinary = require("cloudinary");
const WhereClause = require("../utils/WhereClause");

exports.addProduct = async (req, res) => {
  try {
    const { name, price, description, category, brand } = req.body;

    if (!name || !price || !description || !category || !brand) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (!req.files) {
      return res.status(400).json({ error: "Product photo is required" });
    }

    const incomingPhotos = req.files.photo;
    const uploadingPhotos = [];

    for (let photo of incomingPhotos) {
      //uploading file to cloudinary
      let result = await cloudinary.v2.uploader.upload(photo.tempFilePath, {
        folder: "products",
      });
      uploadingPhotos.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
    req.body.photos = uploadingPhotos;
    req.body.user = req.user._id;

    await Product.create(req.body);

    return res
      .status(200)
      .json({ success: true, message: "Product is uploaded successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    const resultPerPage = 6;

    //creating object from our custom class and passing base = product.find(), bigQ = req.query
    const productsObj = new WhereClause(Product.find(), req.query);

    productsObj.search().filter();

    //limit the products based on search and filter by calling pager function
    productsObj.pager(resultPerPage);

    //requesting the base value that contains products
    let products = await productsObj.base;

    let filteredProductsLength = products.length;

    res.status(200).json({
      success: true,
      products,
      totalProductsCount: productCount,
      filteredProductsCount: filteredProductsLength,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.getProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    res.status(200).json({ success: true, product });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.adminGetAllProducts = async (req, res) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
};

exports.adminUpdateProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const imageArray = [];

    if (req.files) {
      const prod = await Product.findById(productId);

      if (!prod) {
        return res.status(400).json({ error: "No product found with this id" });
      }

      // deleting the existing image
      for (let photo of prod.photos) {
        await cloudinary.v2.uploader.destroy(photo.id);
      }

      // uploading the new images
      const file = req.files.photo;
      for (let photo of file) {
        const res = await cloudinary.v2.uploader.upload(photo.tempFilePath, {
          folder: "products",
        });
        imageArray.push({ id: res.public_id, secure_url: res.secure_url });
      }
    }

    req.body.photos = imageArray;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Product is updated successfully",
      updatedProduct,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.adminDeleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({ error: "Product not found with given id" });
    }

    // deleting the images
    for (let photo of product.photos) {
      await cloudinary.v2.uploader.destroy(photo.id);
    }

    await product.remove();

    return res
      .status(200)
      .json({ success: true, message: "Product was deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.addReview = async (req, res) => {
  const userId = req.user._id;
  const productId = req.params.id;
  let foundReview = false;
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({ error: "No product found with given id" });
    }

    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res
        .status(400)
        .json({ error: "Name and rating field is required" });
    }

    const reviewObj = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    for (let review of product.reviews) {
      if (review.user.toString() === userId.toString()) {
        review.comment = reviewObj.comment;
        review.rating = reviewObj.rating;
        foundReview = true;
      }
    }

    if (foundReview) {
      product.reviews.push(review);
      product.noofreviews = product.reviews.length;
    }

    // adjust ratings
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    // save
    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.deleteReview = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({ error: "No product found with given id" });
    }

    const reviews = product.reviews.filter(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    const noofreviews = reviews.length;

    // adjust ratings
    const rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    // save
    await Product.findByIdAndUpdate(
      productId,
      { reviews, rating, noofreviews },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};

exports.getReviewsForOneProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({ error: "No product found with given id" });
    }
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server has occured some problem, please try again" });
  }
};
