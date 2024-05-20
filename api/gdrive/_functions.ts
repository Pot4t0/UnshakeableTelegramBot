import { google, drive_v3 } from 'googleapis';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { promisify } from 'util';
import * as stream from 'stream';
import { auth } from './_init';

// Load environment variables from a .env file if present
dotenv.config();

// Promisify stream pipeline
const pipeline = promisify(stream.pipeline);

/**
 * Downloads a file from a URL and saves it to the specified location.
 * @param url The URL of the file to download.
 * @param outputLocationPath The path to save the downloaded file.
 * @returns The path to the downloaded file.
 * @throws {Error} If an error occurs while downloading the file.
 * @throws {Error} If an error occurs while uploading the file.
 */
async function downloadFile(url: string, outputLocationPath: string) {
  const response = await axios({
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
export async function uploadFile(fileURL: string, fileName: string) {
  // Create the Google Drive service
  const drive = google.drive({ version: 'v3', auth });

  // Output location
  const outputLocationPath = path.join('/tmp', fileName);

  try {
    // Download the file
    await downloadFile(fileURL, outputLocationPath);

    // Define the file metadata and media content for the file upload
    const fileMetadata: drive_v3.Schema$File = {
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
  } catch (error) {
    // Handle the error
    console.error('Error uploading file:', error);
    throw error;
  } finally {
    // Clean up the downloaded file
    fs.unlinkSync(outputLocationPath);
  }
}
