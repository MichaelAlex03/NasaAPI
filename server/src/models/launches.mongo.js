const mongoose = require ('mongoose');

const launchesSchema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: True
    },
    mission: {
        type: String,
        required: True
    },
    rocket: {
        type: String,
        required: True
    },
    launchDate: {
        type: Date,
        required: True
    },
    target: {
        type: String,
        required: True
    },
    customer: [String],
    upcoming: {
        type: Boolean,
        required: True
    },
    success: {
        type: Boolean,
        required: True,
        default: True
    },
});