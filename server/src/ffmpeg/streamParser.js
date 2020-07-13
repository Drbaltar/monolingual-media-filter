/*
*  This module takes the stream data output in JSON format 
*  from ffprobe and returns specific information about it
*  Author: Kyle McCain
*  Date: 11 July 2020
*/

// Function that returns the languages of all streams
const getStreamLanguages = (data) => {
    if (data.streams) {
        return data.streams.map(stream => {
            if (stream.tags) {
                return stream.tags.language || 'und';
            } else {
                return 'und';
            }
        });
    } else {
        return [];
    }
};

// Function that returns the languages of all streams by category
const getStreamLanguagesByCategory = (data) => {
    let streamsByCategory = {
        video: [],
        audio: [],
        subtitle: []
    };

    if (data.streams) {
        data.streams.forEach(stream => {
            if (stream.tags) {
                streamsByCategory[stream.codec_type].push(stream.tags.language || 'und');
            } else {
                streamsByCategory[stream.codec_type].push('und');
            }
        });
    }
    
    return streamsByCategory;
};

module.exports = {
    getStreamLanguages,
    getStreamLanguagesByCategory
};