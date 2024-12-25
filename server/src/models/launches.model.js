const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches(){
    console.log('Downloading launch data...');
    const response = await axios.post(SPACEX_API_URL, {
        query:{},
        options:{
            pagination: false,
            populate :[
                {
                    path: 'rocket',
                    select: {
                            name: 1
                        }
                },
                {
                    path: 'payloads',
                    select: {
                           'customers': 1
                       }
                },
            ]
        }
    });

    if (response.status !== 200){
        console.log('Problem downloading launch data');
        throw new Error('launch data download failed')
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs){
        const payloads = launchDoc.payloads;
        const customers = payloads.flatMap((payload) => {
            return payload.customers;
        })
        

        const launch = {
            flightNumber: launchDoc.flight_number,
            mission: launchDoc.name,
            rocket: launchDoc.rocket.name,
            launchDate: launchDoc.date_local,
            upcoming: launchDoc.upcoming,
            success: launchDoc.success,
            customers: customers,
        }
        
        console.log(`${launch.flightNumber} ${launch.mission}`);

        await saveLaunch(launch);
    }
}

async function loadLaunchData(){
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });
    if (firstLaunch){
        console.log('Launch data already loaded');
    } else{
        await populateLaunches();
    }
}

async function findLaunch(filter){
    return await launchesDatabase.findOne(filter);
}


async function existsLaunchWithId(launchId){
    return await findLaunch({
        flightNumber: launchId,
    });
}

async function abortLaunchById(launchId){
    const aborted =  await launchesDatabase.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,
    });

    return aborted.modifiedCount === 1;
}

async function getLatestFlightNumber(){
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber'); //sort by descending order as findOne takes first document in list of documents. Reverse sort by putting negative in front field name
    
        if(!latestLaunch) {
            return DEFAULT_FLIGHT_NUMBER;
        }
    
    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit){
    return await launchesDatabase.find({}, {
        '__v': 0,
        '_id': 0
    })
    .sort({ flightNumber: 1})
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch){

    //FindOneAndUpdate only returns values that we updated getting rid of the setOnInsert property added
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    });
}

async function scheduleNewLaunch(launch){

    //makes sure target planet is in planet collections
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if(!planet){
        throw new Error('No Matching planet found');
    }

    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, { 
        upcoming: true,
        success: true,
        customer: ['Zero To Mastery', 'Nasa'],
        flightNumber: newFlightNumber,
    });
    await saveLaunch(newLaunch);
}


module.exports = {
    existsLaunchWithId,
    abortLaunchById,
    getAllLaunches,
    scheduleNewLaunch,
    loadLaunchData,
}