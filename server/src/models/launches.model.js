const launches = new Map();

let latestFlightNumber = 100;


const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442',
    customer: ['NASA', 'ZTM'],
    upcoming: true,
    success: true,
};

launches.set(launch.flightNumber, launch);

function existsLaunchWithId(launchId){
    return launches.has(launchId);
}

function abortLaunchById(launchId){
    const aborted = launches.get(launchId);
    aborted.upcoming = false;
    aborted.success = false;
    return aborted
}

function getAllLaunches(){
    return Array.from(launches.values()); //Take care of converting data in model rather than controller
}

function addNewLaunch(launch){
    latestFlightNumber += 1;
    launches.set(
        latestFlightNumber, 
        Object.assign(launch, {
            upcoming: true,
            sucess: true,
            customer: ['Zero To Mastery', 'Nasa'],
            flightNumber: latestFlightNumber,
    }));
}

module.exports = {
    existsLaunchWithId,
    abortLaunchById,
    getAllLaunches,
    addNewLaunch,
}