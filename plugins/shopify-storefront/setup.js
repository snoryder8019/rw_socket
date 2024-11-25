import express from 'express';
import { getProducts, renderHtml } from './crud/storefrontCRUD.js';

const router = express.Router();

// Define the route to get products and render with the template
router.get('/products', async (req, res) => {
  try {
    const products = await getProducts();
    const html = renderHtml('renderedReturn.html', products); // Ensure this template file exists in your html-templates folder
    res.send(html);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.send(error.message); // Send the raw HTML error response
  }
});

export default router;
