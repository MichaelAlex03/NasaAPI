const { 
    getAllLaunches,
    existsLaunchWithId,
    abortLaunchById,
    scheduleNewLaunch,
} = require('../../models/launches.model');

const {
    getPagination,
} = require('../../services/query');


async function httpGetAllLaunches(req, res){
    const { skip, limit } = getPagination(req.query);
    const launches = await getAllLaunches(skip, limit)
    return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res){
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

    await scheduleNewLaunch(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res){
    const launchId = Number(req.params.id);

    //if launch doesnt exist
    const launchExists = await existsLaunchWithId(launchId)
    if(!launchExists){
        return res.status(404).json({
            error: 'Launch not found',
        });
    } 
        
    //if launch does exist
    const aborted = await abortLaunchById(launchId);
    if(!aborted){
        return res.status(400).json({
            error: 'Launch not aborted',
        });
    }

    return res.status(200).json({
        ok: true,
    });
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
}