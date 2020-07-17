const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authenticate = require('../authenticate');
const cors = require('./cors');

const Medicines = require('../models/medicines');
const success_response = require('./functions/success_response');

const medicineRouter = express.Router();

medicineRouter.use(bodyParser.json());

medicineRouter.route('/')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, (req, res, next) => {
		Medicines.find({})
			.populate('user_added')
			.populate('healthfacilities')
			.populate('suppliers')
			.then((medicines) => {
				success_response(res, medicines);
			}, (err) => next(err))
			.catch((err) => next(err));
	})
	.post(cors.cors, (req, res, next) => {
		Medicines.create(req.body)
			.then((medicine) => {
				success_response(res, medicine);
			}, (err) => next(err))
			.catch((err) => next(err));
	})
	.put(cors.cors, (req, res, next) => {
		var error = new Error('PUT operation is not supported');
		error.statusCode = 403;
		next(error);
	})
	.delete(cors.cors, (req, res, next) => {
		Medicines.remove({})
			.then((medicine) => {
				message = {
					status: true,
					message: 'Successfully deleted'
				};
				success_response(res, message);
			}, (err) => next(err))
			.catch((err) => next(err));
	});

medicineRouter.route('/:medicineId')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, (req, res, next) => {
		Medicines.findById(req.params.medicineId)
			.populate('user_added')
			.populate('healthfacilities')
			.populate('suppliers')
			.then((medicine) => {
				success_response(res, medicine);
			}, (err) => next(err))
			.catch((err) => next(err));
	})
	.post(cors.cors, (req, res, next) => {
		var error = new Error('POST operation is not supported');
		error.statusCode = 403;
		next(error);
	})
	.put(cors.cors, (req, res, next) => {
		Medicines.findByIdAndUpdate(req.params.medicineId, {
				$set: req.body
			}, {
				new: true
			})
			.then((medicine) => {
				success_response(res, medicine);
			}, (err) => next(err))
			.catch((err) => next(err));
	})
	.delete(cors.cors, (req, res, next) => {
		Medicines.findByIdAndRemove(req.params.medicineId)
			.then((medicine) => {
				message = {
					status: true,
					message: 'Successfully deleted'
				};
				success_response(res, message);
			}, (err) => next(err))
			.catch((err) => next(err));
	});

module.exports = medicineRouter;