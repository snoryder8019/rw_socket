import dotenv from 'dotenv';
import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import { mockCookies } from '../../testConfig.js'; // Import mock data

// Load environment variables from .env file
dotenv.config();

// ES6 way to get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an Express app instance for testing
const app = express();
app.use(express.json());
app.use(cookieParser());

// Function to dynamically scan directories and get route handlers
const loadRoutes = async () => {
  const baseDir = path.join(__dirname, '../../../routes/adminFunctions');
  try {
    const directories = await fs.readdir(baseDir);
    console.log(chalk.blue(`Scanning directories in: ${baseDir}`));

    for (const dir of directories) {
      const routePath = path.join(baseDir, dir);
      const stats = await fs.stat(routePath);
      if (stats.isDirectory()) {
        console.log(chalk.blue(`Loading routes from directory: ${dir}`));
        const files = await fs.readdir(routePath);
        for (const file of files) {
          if (file.endsWith('.js')) {
            console.log(chalk.blue(`Attempting to load router from file: ${file}`));
            try {
              const { default: router } = await import(path.join(routePath, file));
              if (!router) {
                console.error(chalk.red(`Failed to load router from ${path.join(routePath, file)}`));
                continue;
              }
              app.use(`/${dir}`, router);
              console.log(chalk.green(`🎉 Successfully loaded router from: ${file} 🎉`));
            } catch (err) {
              console.error(chalk.red(`Failed to import ${file}: ${err.message}`));
            }
          }
        }
      } else {
        console.warn(chalk.yellow(`Skipping non-directory: ${dir}`));
      }
    }
  } catch (error) {
    console.error(chalk.red('Error scanning directories:', error));
  }
};

// Wrap test setup in an async function to use `await` properly
(async () => {
  await loadRoutes();

  describe('Dynamic Route Tests for adminFunctions', function () {
    this.timeout(30000); // Increase timeout to 30 seconds to prevent timeout issues

    let testDirectories;
    before(async function () {
      try {
        testDirectories = await fs.readdir(path.join(__dirname, '../../../routes/adminFunctions'));
        console.log(chalk.green('Loaded test directories:'), testDirectories);
      } catch (error) {
        console.error(chalk.red('Error loading test directories:', error));
      }
    });

    // Check if any directories are loaded
    if (!testDirectories || testDirectories.length === 0) {
      console.warn(chalk.yellow('No test directories found. Skipping tests.'));
      return;
    }

    // Define a list of routes with specific patterns to test dynamically
    const routesToTest = [
      '/section',
      '/renderAddForm',
      '/renderEditForm/1', // Using a dummy ID for testing
    ];

    // Loop through each directory (module) and test the defined routes
    testDirectories.forEach((dir) => {
      routesToTest.forEach((route) => {
        describe(`Testing ${route} route in ${dir} module`, () => {
          it(`should return 403 Forbidden if no user is found`, (done) => {
            console.log(chalk.blue(`Testing ${route} without user authentication in module: ${dir}`));
            request(app)
              .get(`/${dir}${route}`) // Generate the URL path dynamically
              .expect(403) // Expecting Forbidden status if no user
              .end((err, res) => {
                if (err) {
                  console.error(chalk.red(`Error testing ${route} in module: ${dir}`, err));
                  return done(err);
                }
                expect(res.body.message).to.equal('Forbidden: No user found');
                console.log(chalk.green(`🎉 Successfully tested ${route} without user authentication in module: ${dir} 🎉`));
                done();
              });
          });

          it(`should return 200 OK for valid requests with admin user`, (done) => {
            console.log(chalk.blue(`Testing ${route} with admin user in module: ${dir}`));
            // Mock a user with valid permissions
            const mockUser = {
              firstName: 'Test',
              lastName: 'User',
              isAdmin: true,
              permissions: { full: true },
            };

            request(app)
              .get(`/${dir}${route}`)
              .set('Cookie', [`user=${encodeURIComponent(JSON.stringify(mockUser))}`]) // Pass mock user as a cookie
              .expect(200) // Expecting OK status
              .end((err, res) => {
                if (err) {
                  console.error(chalk.red(`Error testing ${route} with admin user in module: ${dir}`, err));
                  return done(err);
                }
                if (route === '/renderAddForm' || route.startsWith('/renderEditForm')) {
                  expect(res.text).to.include('<form'); // Check that form HTML is included
                } else if (route === '/section') {
                  expect(res.text).to.include('<div'); // Check that section view content is included
                }
                console.log(chalk.green(`🎉 Successfully tested ${route} with admin user in module: ${dir} 🎉`));
                done();
              });
          });
        });
      });
    });

    after(() => {
      console.log(chalk.bgGreen.black('🎉 All tests completed successfully! 🎉'));
    });
  });

  run(); // Start the Mocha tests
})();
