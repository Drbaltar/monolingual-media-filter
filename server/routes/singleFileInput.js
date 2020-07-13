/*
*  This module establishes the route used to request peforming
*  ffprobe and ffmpeg processes for single media files
*  Author: Kyle McCain
*  Date: 8 July 2020
*/

// Declare and initialize new router
const express = require('express');
const router = express.Router();

// Import required modules
const fs = require('fs');
const ffprobe = require('../src/ffmpeg/ffprobe');
const ffmpeg = require('../src/ffmpeg/ffmpeg');
const { getStreamLanguages, getStreamLanguagesByCategory } = require('../src/ffmpeg/streamParser');

// Middleware that checks that the request contains a file path and that the file exists
router.use((req, res, next) => {
    let filePath = req.query.filePath || req.body.filePath;
    if (filePath) {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (!err) {
                next();
            } else {
                res.status(400).send('The path for the media file does not exist!');
            }
        });
    } else {
        res.status(400).send('The path for the media file to analyze is required!');
    }
});

/*---------------------------------FFProbe Analysis Routes-----------------------------*/

// Route used to analyze the media streams of the file and return results as JSON
router.get('/analyze/allStreams', (req, res) => {
    ffprobe.createFFProbeStreamProcess(req.query.filePath)
        .then(data => res.send(data))
        .catch(err => res.status(500).send(`An error occurred when trying to analyze the input file: ${err}`));
});

// Route used to analyze the media streams of the file and return results as JSON
router.get('/analyze/allStreamsByLanguage', (req, res) => {
    ffprobe.createFFProbeStreamProcess(req.query.filePath)
        .then(data => res.send(getStreamLanguagesByCategory(data)))
        .catch(err => res.status(500).send(`An error occurred when trying to analyze the input file: ${err}`));
});

/*---------------------------------FFMPEG Filtering Routes-----------------------------*/

// Route used to filter out all streams except those that meet the input language
router.post('/filter/allByLanguage', (req, res) => {
    if (req.body.language) {
        ffprobe.createFFProbeStreamProcess(req.body.filePath)
            .then(data => {
                // Create array of streams that do not match the input language
                let streamsToRemove = [];
                getStreamLanguages(data).forEach((streamLanguage, index) => {
                    if (streamLanguage !== req.body.language && streamLanguage !== 'und') {
                        streamsToRemove.push('-map', `-0:${index}`);
                    }
                });

                let ffmpegArguments = ['-map', '0']
                    .concat(streamsToRemove)
                    .concat(['-c', 'copy', '-y', 'C:\\Users\\the_r\\Downloads\\output.mkv']);
                return ffmpeg(req.body.filePath, ffmpegArguments);
            })
            .then(data => res.send(data))
            .catch(err => res.status(500).send(`An error occurred when trying to process the input file: ${err}`));
    } else {
        res.status(400).send('The language used to filter all streams is required');
    }
});

// Route used to output media file with the best quality audio and video streams
// router.get('/filter/bestByLanguage', (req, res) => {

//     res.send('<h>Issue Submission Page</h>');
// });

module.exports = router;