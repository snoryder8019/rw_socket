import express from 'express';
import Help from '../../../plugins/mongo/models/help/Help.js';
import Faq from '../../../plugins/mongo/models/help/Faq.js';
import generateFormFields from '../../../plugins/helpers/formHelper.js';
import { buildRoutes } from '../../helpers/routeBuilder.js';

const router = express.Router();
const modelName = 'help';

buildRoutes(new Faq(), router);

export default router;
