const fs = require('fs');
const path = require('path');

// Storefront API credentials
const API_KEY = process.env.SHOP_API;
const STORE_DOMAIN = 'royal-splendor.myshopify.com';  // Replace with your actual store domain

const getProducts = async () => {
    try {
        const fetch = (await import('node-fetch')).default;

        // Log the request URL and headers
      //  console.log(`Fetching from: https://${STORE_DOMAIN}/api/2023-10/graphql.json`);
      //  console.log(`Using API Key: ${API_KEY}`);

        const response = await fetch(`https://${STORE_DOMAIN}/api/2023-10/graphql.json`, {
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
        });

        const contentType = response.headers.get('content-type');
        const text = await response.text();

        // Log the response details for debugging
        // console.log('Response Status:', response.status);
        // console.log('Response Headers:', response.headers.raw());
        // console.log('Response Text:', text);

        if (response.status !== 200) {
            throw new Error(`Server responded with status ${response.status}: ${text}`);
        }

        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Expected JSON, but received ${contentType}: ${text}`);
        }

        const data = JSON.parse(text);
        return data.data.products.edges;
    } catch (error) {
        console.error('Error fetching products:', error.message);
        throw new Error(error.message);  // Re-throw the error to be caught by the route
    }
};

const getHtmlTemplate = (templateName) => {
    const templatePath = path.join(__dirname, '../html-templates', templateName);
    return fs.readFileSync(templatePath, 'utf-8');
};

const renderHtml = (templateName, products) => {
    let html = getHtmlTemplate(templateName);
    let productsHtml = '';

    products.forEach(product => {
        const variant = product.node.variants.edges[0].node;
        const price = parseFloat(variant.price.amount).toFixed(2);  // Ensure two decimal places
        productsHtml += `<li>
                            <h2>${product.node.title}</h2>
                            <p>${product.node.description}</p>`;
        if (product.node.images.edges.length > 0) {
            productsHtml += `<div class="productImgContainer"><img src="${product.node.images.edges[0].node.originalSrc}" alt="${product.node.images.edges[0].node.altText}" /></div>`;
        }
        productsHtml += `<div class="priceContainer">
                            <p>$${price}</p>
                            <button class="buyNowButton">Buy Now</button>
                         </div>
                         </li>`;
    });

    return html.replace('<!--PRODUCTS-->', productsHtml);
};

module.exports = {
    getProducts,
    renderHtml,
};
