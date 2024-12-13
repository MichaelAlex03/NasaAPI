const DEFAULT_PAGE_LIMIT = 0; //Mongo returns all documents if limit is set to 0
const DEFAULT_PAGE_NUMBER = 1

function getPagination(query){
    const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER;
    const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT; //converts string to int as well

    const skip = limit * (page - 1);

    return {
        skip,
        limit,
    }
}

module.exports = {
    getPagination,
};