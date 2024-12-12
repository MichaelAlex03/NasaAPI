const { parse } = require('csv-parse');
const fs = require('fs');
const { get } = require('http');
const path = require('path');

const planets = require('./planets.mongo')


const results = []; //array of habitable planets

function isHabitablePlanet(planet){
    return planet['koi_disposition'] === 'CONFIRMED' 
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

//We return a promise to know when the results array has been populated so that module.exports doesnt export results when it is not finished populating
function loadPlanetsData() {
    //pipe() readable steam pipes to writable stream
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true,
            }))
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                    await savePlanets(data);
                }
            })
            .on('error', (err) => {
                console.log(err);
                reject(err);
            })
            .on('end', async() => {
                const countPlanetsFound = (await getAllPlanets()).length
                console.log(`${countPlanetsFound} Planets finished loading in`);
                resolve(); //resolve when all data has been streamed in and parsed
            })
    });
}

//Send data back to controller with function not directly
async function getAllPlanets(){
    return await planets.find({});
}

async function savePlanets(planet){
    try{
        await planets.updateOne({
            keplerName: planet.kepler_name,
        }, {
            keplerName: planet.kepler_name
        }, {
            upsert: true,
        });
    } catch(err){
        console.error(`Could not save error ${err}`);
    }
}

module.exports = {
    loadPlanetsData,
    getAllPlanets,
};
