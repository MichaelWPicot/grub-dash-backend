const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

function list(req, res) {
  res.json({ data: orders });
}

function destroy(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  if (orders[index].status !== "pending") {
    next({
      status: 400,
      message: `An order cannot be deleted unless it is pending. Returns a 400 status code`,
    });
  }
  if (orderId && index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}
function orderValid(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes, quantity } = {} } = req.body;
  if (!deliverTo || deliverTo === "" || deliverTo === undefined) {
    next({ status: 400, message: "Order must include a deliverTo" });
  }
  if (!mobileNumber || mobileNumber === "") {
    next({ status: 400, message: "Order must include a mobileNumber" });
  }
  if (!dishes) {
    next({ status: 400, message: "Order must include a dish" });
  }
  if (dishes.length === 0 || !Array.isArray(dishes)) {
    next({ status: 400, message: "Order must include at least one dish" });
  }
  for (dish of dishes) {
    const index = dishes.indexOf(dish);
    if (
      !dish.quantity ||
      dish.quantity < 1 ||
      !Number.isInteger(dish.quantity)
    ) {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  return next();
}

function updateCheck(req, res, next) {
  return next();
}
function updateOrder(req, res, next) {
  const orderId = req.params.orderId;

  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;
  if (id && id !== orderId) {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  }
  if (!status || status === "" || status === "invalid") {
    next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  }
  if (status === "delivered") {
    next({ status: 400, message: `A delivered order cannot be changed` });
  }
  const foundOrder = res.locals.order;

  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  foundOrder.dishes = dishes;
  res.json({ data: foundOrder });
}

function addOrder(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    deliverTo,
    mobileNumber,
    status,
    dishes,
    id: nextId(),
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

module.exports = {
  list,
  delete: [orderExists, destroy],
  read: [orderExists, read],
  create: [orderValid, addOrder],
  update: [orderExists, orderValid, updateCheck, updateOrder],
};
