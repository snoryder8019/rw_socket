import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import '@shopify/shopify-api/adapters/web-api';
import {shopifyApi, LATEST_API_VERSION} from '@shopify/shopify-api';
import express from 'express';
import chalk from 'chalk';
const router = express.Router();


const shopify = shopifyApi({
  apiKey: process.env.SHOP_API,
  hostName:'royal-splendor.myshopify.com',
  apiSecretKey: process.env.SHOP_SEC,  // If required
  accessToken: process.env.SHOP_API,
  scopes: ['read_products', 'write_products'],
  apiVersion: '2023-10',  // or the current version you are using
  isEmbeddedApp: false,
});

const fetchCollections = async (req, res) => {
  try {
    const collections = await shopify.api.rest.CustomCollection.all({
      session: {
        accessToken: process.env.SHOP_API, // Use the correct access token here
      },
    });
console.log(chalk.bgBlue(collections))
    res.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).send('Error fetching collections');
  }
};

// Route definition using the async function


// Mimic __dirname in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storefront API credentials
const API_KEY = process.env.SHOP_API;
const STORE_DOMAIN = 'royal-splendor.myshopify.com'; // Replace with your actual store domain

// Define getProducts function
export const getProducts = async () => {
  try {
    const fetch = (await import('node-fetch')).default;

    const response = await fetch(
      `https://${STORE_DOMAIN}/api/2023-10/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': API_KEY,
        },
        body: JSON.stringify({
          query: `
            {
              products(first: 10) {
                edges {
                  node {
                    id
                    title
                    description
                    productType
                    images(first: 1) {
                      edges {
                        node {
                          originalSrc
                          altText
                        }
                      }
                    }
                    variants(first: 1) {
                      edges {
                        node {
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
        }),
      }
    );

    const data = await response.json();
    return data.data.products.edges;
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw new Error(error.message);
  }
};

// Function to get HTML template
const getHtmlTemplate = (templateName) => {
  const templatePath = path.join(__dirname, '../html-templates', templateName);
  return fs.readFileSync(templatePath, 'utf-8');
};

// Define renderHtml function
export const renderHtml = (templateName, products) => {
  let html = getHtmlTemplate(templateName);
  let productsHtml = '';
  let categories = new Set();

  products.forEach((product) => {
    const variant = product.node.variants.edges[0].node;
    const price = parseFloat(variant.price.amount).toFixed(2);
    const category = product.node.productType;
    categories.add(category);

    productsHtml += `<li data-category="${category}">
                      <h2 class="productTitle">${product.node.title}</h2>
                      <p>${product.node.description}</p>`;
    if (product.node.images.edges.length > 0) {
      productsHtml += `<div class="productImgContainer"><img src="${product.node.images.edges[0].node.originalSrc}" alt="${product.node.images.edges[0].node.altText}" /></div>`;
    }
    productsHtml += `<div class="priceContainer">
                      <p class="productPrice">$${price}</p>
                      <button class="buyNowButton">Add to Cart</button>
                     </div>
                   </li>`;
  });

  let categoriesHtml = '<button data-category="all">All</button>';
  categories.forEach((category) => {
    categoriesHtml += `<button data-category="${category}">${category}</button>`;
  });

  html = html.replace('<!--PRODUCTS-->', productsHtml);
  html = html.replace('<!--CATEGORIES-->', categoriesHtml);

  return html;
};
router.get('/collections', fetchCollections);
export default router;