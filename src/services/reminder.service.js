const Reminder = require('../models/Reminder.model')

const create = (userId, body) =>
  Reminder.create({ userId, ...body })

const getAll = (userId) =>
  Reminder.find({ userId }).sort({ remindAt: 1 })

const getOne = (userId, id) =>
  Reminder.findOne({ _id: id, userId })

const update = (userId, id, body) =>
  Reminder.findOneAndUpdate({ _id: id, userId }, body, { new: true })

const remove = (userId, id) =>
  Reminder.findOneAndDelete({ _id: id, userId })

module.exports = { create, getAll, getOne, update, remove }