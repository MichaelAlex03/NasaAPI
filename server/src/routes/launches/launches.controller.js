const { 
    getAllLaunches,
    addNewLaunch,
    existsLaunchWithId,
    abortLaunchById,
} = require('../../models/launches.model');


async function httpGetAllLaunches(req, res){
    return res.status(200).json(await getAllLaunches());
}

function httpAddNewLaunch(req, res){
    const launch = req.body;

    //validate request body is not empty
    if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target){
        return res.status(400).json({
            error: 'Missing required launch property', 
        });
    }

    //Date validation
    launch.launchDate = new Date(launch.launchDate); //cant passs in date object so pass it in as string and then convert it in date object
    if (isNaN(launch.launchDate)){
        return res.status(400).json({
            error: 'Invalid launch date'
        });
    } //will return invalid date if what was passed in cant be turned into a valid date

    addNewLaunch(launch);
    return res.status(201).json(launch);
}

function httpAbortLaunch(req, res){
    const launchId = Number(req.params.id);



    //if launch doesnt exist
    if(!existsLaunchWithId(launchId)){
        return res.status(404).json({
            error: 'Launch not found',
        });
    } 
        
    //if launch does exist
    const aborted = abortLaunchById(launchId);
    return res.status(200).json(aborted);
    
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
}