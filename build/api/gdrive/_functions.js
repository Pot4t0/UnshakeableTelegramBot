"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const googleapis_1 = require("googleapis");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const util_1 = require("util");
const stream = __importStar(require("stream"));
const _init_1 = require("./_init");
// Load environment variables from a .env file if present
dotenv.config();
// Promisify stream pipeline
const pipeline = (0, util_1.promisify)(stream.pipeline);
/**
 * Downloads a file from a URL and saves it to the specified location.
 * @param url The URL of the file to download.
 * @param outputLocationPath The path to save the downloaded file.
 * @returns The path to the downloaded file.
 * @throws {Error} If an error occurs while downloading the file.
 * @throws {Error} If an error occurs while uploading the file.
 */
async function downloadFile(url, outputLocationPath) {
    const response = await (0, axios_1.default)({
        method: 'GET',
        url: url,
        responseType: 'stream',
    });
    await pipeline(response.data, fs.createWriteStream(outputLocationPath));
}
/**
 * Uploads a file to Google Drive.
 * @param fileURL The URL of the file to upload.
 * @param fileName The name of the file to upload.
 * @returns The URL of the uploaded file.
 */
async function uploadFile(fileURL, fileName) {
    // Create the Google Drive service
    const drive = googleapis_1.google.drive({ version: 'v3', auth: _init_1.auth });
    //output location
    const outputLocationPath = path.resolve(__dirname, `${fileName}.jpg`);
    try {
        // Download the file
        await downloadFile(fileURL, outputLocationPath);
        // Define the file metadata and media content for the file upload
        const fileMetadata = {
            name: fileName,
            parents: [`${process.env.FINANCE_FOLDER_ID}`],
        };
        const media = {
            mimeType: 'image/jpeg',
            body: fs.createReadStream(outputLocationPath),
        };
        // Upload the file
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id',
        });
        return `https://drive.google.com/uc?id=${response.data.id}&export=download`;
    }
    catch (error) {
        // Handle the error
        console.error('Error uploading file:', error);
        throw error;
    }
    finally {
        // Clean up the downloaded file
        fs.unlinkSync(outputLocationPath);
    }
}
exports.uploadFile = uploadFile;
