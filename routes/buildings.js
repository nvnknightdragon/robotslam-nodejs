const express = require('express');
const models = require('../models');
const mapRouter = require('./buildings/map')

const router = express.Router();

router.use('/:id/maps', mapRouter);

router.get('/', async function (req, res) {
  //noinspection JSUnresolvedVariable,JSUnresolvedFunction
  const buildings = await models.building.findAll({
    order: [['id', 'asc']],
  });

  res.render('buildings/index', {
    title: 'Buildings',
    buildings: buildings.map((m) => m.get()),
  });
});

router.get('/create', function (req, res) {
  res.render('buildings/create', {
    title: 'Buildings'
  });
});

router.post('/', async function (req, res) {
  const building = await models.building.create({
    name: req.body.name
  });

  res.redirect(`/buildings/${building.id}`);
});

router.get('/:id', async function (req, res) {
  const building = await models.building.find({
    where: {
      id: req.params.id
    },
    include: [models.map]
  });

  res.render('buildings/view', {
    title: building.name,
    building: building.get()
  });
});

module.exports = router;