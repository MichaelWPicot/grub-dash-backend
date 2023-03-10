const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    name,
    description,
    price,
    image_url,
    id: nextId(),
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function hasProp(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  if (!name || name === "") {
    next({ status: 400, message: "Dish must include a name" });
  }
  if (!description || description === "") {
    next({ status: 400, message: "Dish must include a description" });
  }
  if (!price) {
    next({ status: 400, message: "Dish must include a price" });
  }
  if (price <= 0 || !Number.isInteger(price)) {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  if (!image_url || image_url === "") {
    next({ status: 400, message: "Dish must include a image_url" });
  }
  return next();
}

function list(req, res) {
  res.json({ data: dishes });
}

function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${req.params.dishId}`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function update(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = res.locals.dish;
  const { data: { name, description, price, image_url, id } = {} } = req.body;
  if (id && id !== dishId) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;
  res.json({ data: foundDish });
}

module.exports = {
  list,
  create: [hasProp, create],
  read: [dishExists, read],
  update: [dishExists, hasProp, update],
};
