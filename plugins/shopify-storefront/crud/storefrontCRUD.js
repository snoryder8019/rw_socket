import fs from 'fs';
import path from 'path';

// Storefront API credentials
const API_KEY = process.env.SHOP_API;
const STORE_DOMAIN = 'royal-splendor.myshopify.com'; // Replace with your actual store domain

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

    const contentType = response.headers.get('content-type');
    const text = await response.text();

    if (response.status !== 200) {
      throw new Error(
        `Server responded with status ${response.status}: ${text}`
      );
    }

    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON, but received ${contentType}: ${text}`);
    }

    const data = JSON.parse(text);
    return data.data.products.edges;
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw new Error(error.message);
  }
};

const getHtmlTemplate = (templateName) => {
  const templatePath = path.dirname('../html-templates', templateName);
  return fs.readFileSync(templatePath, 'utf-8');
};

export const renderHtml = (templateName, products) => {
  let html = getHtmlTemplate(templateName);
  let productsHtml = '';
  let categories = new Set();

  products.forEach((product) => {
    const variant = product.node.variants.edges[0].node;
    const price = parseFloat(variant.price.amount).toFixed(2); // Ensure two decimal places
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
