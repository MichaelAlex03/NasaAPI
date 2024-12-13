const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const launches = new Map();


const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customer: ['NASA', 'ZTM'],
    upcoming: true,
    success: true,
};

saveLaunch(launch);


function existsLaunchWithId(launchId){
    return launches.has(launchId);
}

function abortLaunchById(launchId){
    const aborted = launches.get(launchId);
    aborted.upcoming = false;
    aborted.success = false;
    return aborted
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

async function getAllLaunches(){
    return await launchesDatabase.find({}, {
        '__v': 0,
        '_id': 0
    });
}

async function saveLaunch(launch){
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if(!planet){
        throw new Error('No Matching planet found');
    }

    //FindOneAndUpdate only returns values that we updated getting rid of the setOnInsert property added
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    });
}

async function scheduleNewLaunch(launch){
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
    scheduleNewLaunch
}