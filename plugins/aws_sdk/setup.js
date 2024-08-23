//plugins/aws_sdk/setup.js **NOTE GPT: DONT REMOVE THIS LINE**
const AWS = require('aws-sdk');
const fs = require('fs');

// Configure AWS SDK for Linode Object Storage
const s3 = new AWS.S3({
    accessKeyId: process.env.LINODE_ACCESS,
    secretAccessKey: process.env.LINODE_SEC,
    endpoint: process.env.LINODE_URL,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    region: process.env.LINODE_REGION,
    httpOptions: {
        connectTimeout: 10000, // 10 seconds
        timeout: 30000 // 30 seconds
    }
});

/**
 * Uploads a file to Linode Object Storage
 * @param {String} filePath Path to the file on the local system
 * @param {String} fileKey Key under which to store the file in the bucket
 * @returns {Promise<String>} URL of the uploaded file
 */
const uploadToLinode = async (filePath, fileKey) => {
    const fileContent = fs.readFileSync(filePath);

    const params = {
        Bucket: process.env.LINODE_BUCKET,
        Key: fileKey,
        Body: fileContent,
        ACL: 'public-read', // Adjust according to your privacy requirements
    };

    try {
        const uploadResult = await s3.upload(params).promise();
        return uploadResult.Location; // URL of the uploaded file
    } catch (error) {
        console.error("Error uploading to Linode Object Storage:", error);
        throw error; // Rethrow to handle it in the calling function
    }
};
//https://royal-bucket.us-ord-1.linodeobjects.com/admin/videos/1720417954431.mp4
/**
 * Retrieves a list of videos from Linode Object Storage
 * @param {String} prefix (optional) Prefix to filter the videos (e.g., folder path)
 * @returns {Promise<Array>} List of video objects
 */
const getVideos = async (prefix = '') => {
    const params = {
        Bucket: process.env.LINODE_BUCKET,
        Prefix: prefix
    };

    try {
        const data = await s3.listObjectsV2(params).promise();
        return data.Contents
            .filter(item => item.Key.endsWith('.mp4')) // Ensure only video files are processed
            .map(item => {
                const videoUrl = `${process.env.LINODE_URL}/${process.env.LINODE_BUCKET}/${item.Key}`;
                const lastModified = new Date(item.LastModified).toLocaleDateString();
                const sizeMB = (item.Size / (1024 * 1024)).toFixed(2);
                console.log(`videoUrl: ${videoUrl} \nlastModified: ${lastModified} \nsizeMB: ${sizeMB}`)
                return `
                    <div class="uploadedVideo">
                        <video muted paused controls class="uploadedVideo">
                            <source src="${videoUrl}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <p>Last Modified: ${lastModified}</p>
                        <p>Size: ${sizeMB} MB</p>
                    </div>
                `;
            })
            .join(''); // Join all HTML strings to form a single string
    } catch (error) {
        console.error("Error retrieving videos from Linode Object Storage:", error);
        throw error; // Rethrow to handle it in the calling function
    }
};

const getDirectories = async (prefix = '') => {
    const params = {
        Bucket: process.env.LINODE_BUCKET,
        Prefix: prefix,
        Delimiter: '/' // Delimiter indicates that the result should be grouped by directories
    };

    try {
        const data = await s3.listObjectsV2(params).promise();
        
        // Extract directories (common prefixes)
        const directories = data.CommonPrefixes.map(item => item.Prefix);

        // Generate HTML buttons
        let buttonsHtml = '<div>';
        directories.forEach((dir, index) => {
            const dirName = dir.replace(prefix, '').replace('/', ''); // Clean up the directory name
            const buttonId = `dir-button-${index}`; // Unique ID for each button
            buttonsHtml += `<button class="bucketDirectory" id="${buttonId}" data-dir="${dirName}" onclick="getDirImages('${dirName}')">${dirName}</button>`;
        });
        buttonsHtml += '</div>';

        return buttonsHtml;
    } catch (error) {
        console.error("Error retrieving directories from Linode Object Storage:", error);
        throw error; // Rethrow to handle it in the calling function
    }
};


const getImageGrid = async (directory = '') => {
    const params = {
        Bucket: process.env.LINODE_BUCKET,
        Prefix: directory // Use the directory as the prefix to filter images
    };

    try {
        const data = await s3.listObjectsV2(params).promise();
        
        // Filter images based on common image extensions
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        const images = data.Contents.filter(item => 
            imageExtensions.some(ext => item.Key.toLowerCase().endsWith(ext))
        );

        // Generate HTML grid
        let gridHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">';
        images.forEach(image => {
            const imageUrl = `${process.env.LINODE_URL}/${process.env.LINODE_BUCKET}/${image.Key}`;
            gridHtml += `
                <div style="text-align: center;">
                    <img src="${imageUrl}" alt="${image.Key}" style="width: 100%; height: auto;" />
                    <br />
                    <input type="text" value="${imageUrl}" readonly style="width: 100%;" />
                </div>`;
        });
        gridHtml += '</div>';

        return gridHtml;
    } catch (error) {
        console.error("Error retrieving images from Linode Object Storage:", error);
        throw error; // Rethrow to handle it in the calling function
    }
};

module.exports = {
    uploadToLinode,
    getVideos,
    getImageGrid,
    getDirectories
};
