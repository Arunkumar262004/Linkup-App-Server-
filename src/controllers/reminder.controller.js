const svc = require('../services/reminder.service')

const create  = async (req, res) => {
  try   { res.status(201).json(await svc.create(req.user._id, req.body)) }
  catch (e) { res.status(400).json({ message: e.message }) }
}
const getAll  = async (req, res) => res.json(await svc.getAll(req.user._id))
const getOne  = async (req, res) => {
  const r = await svc.getOne(req.user._id, req.params.id)
  r ? res.json(r) : res.status(404).json({ message: 'Not found' })
}
const update  = async (req, res) => {
  const r = await svc.update(req.user._id, req.params.id, req.body)
  r ? res.json(r) : res.status(404).json({ message: 'Not found' })
}
const remove  = async (req, res) => {
  await svc.remove(req.user._id, req.params.id)
  res.json({ message: 'Deleted' })
}

module.exports = { create, getAll, getOne, update, remove }