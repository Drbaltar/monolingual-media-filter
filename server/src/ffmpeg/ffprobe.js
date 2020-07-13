/*
*  This module creates various ffprobe processes
*  that analyze specific information of media files
*  Author: Kyle McCain
*  Date: 9 July 2020
*/

// Declare and initialize required variables to create ffprobe processes
const { spawn } = require('child_process');
const ffprobePath = `${process.env.FFMPEG_FOLDER_PATH}ffprobe.exe`;

// Helper function used to set all listeners to input ffprobe process
const attachListeners = (ffprobeProcess, mediaFilePath, resolve, reject) => {
    
    // Declare variable to hold stdout data from ffprobe
    let fullOutput = '';

    // When new data block is received, add it to full output variable
    ffprobeProcess.stdout.on('data', (data) => {
        fullOutput += data;
    });
    
    // Print data from stderr to the console
    // ffprobeProcess.stderr.setEncoding('utf8');
    ffprobeProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
        
    // When process closes, if program exits correctly, return output to callback 
    ffprobeProcess.on('close', (code) => {
        if (code === 0) {
            let streamData;
            try {
                streamData = JSON.parse(fullOutput);
                console.log(`The 'ffprobe' process successfully finished for ${mediaFilePath}!`);
        
                resolve(streamData);
            } catch (SyntaxError) {
                reject('The data output from \'ffprobe\' could not be parsed into JSON format!');
            }
        } else {
            reject('The \'ffprobe\' program exited unexpectedly with an error!');
        }
    });

    ffprobeProcess.on('error', (err) => {
        console.log(`Failed to start subprocess due to error: ${err}`);
        reject(`Failed to start subprocess due to error: ${err}`);
    });
};

// Creates a new ffprobe process that analyzes the media streams and returns a Promise
const createFFProbeStreamProcess = (mediaFilePath) => {
    return new Promise((resolve, reject) => {
        // Create new ffprobe process to analyze media streams
        const ffprobe = spawn(ffprobePath, [
            '-i',
            mediaFilePath,
            '-show_streams', 
            '-print_format',
            'json'
        ]);
    
        // Attach required listeners for stdout, stderr, error and close
        attachListeners(ffprobe, mediaFilePath, resolve, reject);
    });
};

module.exports = {
    createFFProbeStreamProcess
};