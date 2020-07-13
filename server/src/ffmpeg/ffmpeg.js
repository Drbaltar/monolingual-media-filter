/*
*  This module creates various ffmpeg processes
*  that perform actions on input media files
*  Author: Kyle McCain
*  Date: 9 July 2020
*/

// Declare and initialize required variables to create ffmpeg processes
const { spawn } = require('child_process');
const ffmpegPath = `${process.env.FFMPEG_FOLDER_PATH}ffmpeg.exe`;

// Helper function used to set all listeners to input ffmpeg process
const attachListeners = (ffmpegProcess, mediaFilePath, reject, resolve) => {
    
    // Declare variable to hold stdout data from ffmpeg
    let fullOutput = '';

    // When new data block is received, add it to full output variable
    ffmpegProcess.stdout.on('data', (data) => {
        fullOutput += data;
    });
    
    // Print data from stderr to the console
    ffmpegProcess.stderr.setEncoding('utf8');
    ffmpegProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
        
    // When process closes, if program exits correctly, return output to callback 
    ffmpegProcess.on('close', (code) => {
        if (code === 0) {
            console.log(`The 'ffmpeg' process successfully finished for ${mediaFilePath}!`);
    
            resolve(fullOutput);
        } else {
            reject('The \'ffmpeg\' program exited unexpectedly with an error!');
        }
    });

    ffmpegProcess.on('error', (err) => {
        console.log(`Failed to start subprocess due to error: ${err}`);
        reject(`Failed to start subprocess due to error: ${err}`);
    });
};

// Creates a new ffmpeg process with the input media file and arguments and returns a Promise
const createFFMPEGProcess = (mediaFilePath, additionalArguments) => {
    return new Promise((resolve, reject) => {
        // Create array of all ffmpeg arguments
        let ffmpegArguments = ['-i', mediaFilePath].concat(additionalArguments);
        
        // Create new ffmpeg process to 
        const ffmpeg = spawn(ffmpegPath, ffmpegArguments);
        
        // Attach required listeners for stdout, stderr, error and close
        attachListeners(ffmpeg, mediaFilePath, resolve, reject);
    });
};

module.exports = createFFMPEGProcess;