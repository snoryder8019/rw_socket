const express = require('express');
const Help = require('../../../plugins/mongo/models/help/Help');
const Faq = require('../../../plugins/mongo/models/help/Faq');
const { generateFormFields } = require('../../../plugins/helpers/formHelper');
const buildRoutes = require('../../helpers/routeBuilder');
const router = express.Router();
const modelName = "help";



buildRoutes(new Faq(), router);

module.exports = router;