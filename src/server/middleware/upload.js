
const fs = require( 'fs' );
const path = require( 'path' );
const Recipe = require("../models/index");
const elasticMethods = require("./elastic-methods")

const getPaths = async () =>
{
    // path starts at root (package.json level)
    let moveFrom = "src/server/json/to_add"
    let moveTo = "src/server/json/added"

    try {
        // Get the files as an array
        let files = await fs.promises.readdir(path.join(moveFrom));
        
        // return an object containing current file paths and their destination paths
        return files.reduce((accum, file) =>
        {
            accum.fromPaths.push(path.join( moveFrom, file ));
            accum.toPaths.push(path.join( moveTo, file ));

            return accum;

        }, {fromPaths : [], toPaths : []});
        
    }
    catch( e ) {
        console.error(e);
        return {fromPaths : [], toPaths : []}; // return empty object
    }
}

const getJSON = (paths) => {

    
    return paths.reduce((accum, element) => {
        
        // if not json doc
        if(element.split('.').pop() !== "json") return accum;

        let rawdata = fs.readFileSync(element);
        let parsed = JSON.parse(rawdata);
        
        let parsedElements = parsed.map((element) =>
        {
            let quotesFixed = element.replace(/'/g, '"').replace(/None/g,  '""')
            let elem_parsed = JSON.parse(quotesFixed)
            // add image and empty times object
            // forgot this in parser script, will need to add and remove these when done with current batches
            elem_parsed.images = [{image_url: "https://hungerrice-images.s3.us-east-2.amazonaws.com/57ae41ea-91cd-4fb7-bb7e-932213494ea3", position: 0}]
            elem_parsed.times = {}; 
            elem_parsed.status = 3; // publish a bim recipe
            return elem_parsed;
        });
    
        return [...accum, ...parsedElements]
    }, [])

}



const moveFiles = (paths) =>
{
    paths.fromPaths.forEach(async (element, index) => { 
        await fs.promises.rename( element, paths.toPaths[index] );
        console.log( "Moved '%s'->'%s'", element, paths.toPaths[index] );
    })
}


       
const uploadNew = async () => {

    try {
        
     
        // get paths of files to move (and their destination paths)
        let paths = await getPaths();

        // if nothing to add, return
        if(paths.fromPaths.length === 0) return;

        //lets combine all json items to single array of json objects
        let allJSON = getJSON(paths.fromPaths)
        // if nothing to add, return
        if (allJSON.length === 0) return;

        // else, insert all data to MongoDB
        let inserted = await Recipe.insertMany(allJSON)
        let elasticJSON = elasticMethods.getBulk(inserted); // get searchable documents

    
        elasticMethods.indexMany(elasticJSON)
        .then(() => {console.log("Data inserted")  // Success
                     moveFiles(paths)})
        .catch((err) => {throw err})

    }
    catch( e ) {
        // Catch anything bad that happens
        // TODO- insert rollback
        console.error(e);
    }
  
}

module.exports = {
    uploadNew,
}