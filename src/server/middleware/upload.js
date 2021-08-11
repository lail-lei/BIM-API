
const fs = require( 'fs' );
const path = require( 'path' );
const Recipe = require("../models/index");
const { Client } = require('@elastic/elasticsearch')
const elastic = new Client({ node: process.env.ELASTIC_DATABASE_URL })

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



const getElasticBulk = (json) => {

    // create object sto hold all searchable fields from a recipe
    return json.flatMap((element) => [{ index: { _index: 'recipes', _id: String(element._id) } }, 
                                        {title : element.title, 
                                        owner_id: element.owner_id, 
                                        original_owner_id: element.owner_id,
                                        status: 3,
                                        date_updated: Date.now(),
                                        ingredients: element.ingredients,
                                        total_time : null, 
                                        image_url: "https://hungerrice-images.s3.us-east-2.amazonaws.com/57ae41ea-91cd-4fb7-bb7e-932213494ea3",
                                        tags: element.tags
                                        }])
                                        
        
}


const moveFiles = (paths) =>
{
    paths.fromPaths.forEach(async (element, index) => { 
        await fs.promises.rename( element, paths.toPaths[index] );
        console.log( "Moved '%s'->'%s'", element, paths.toPaths[index] );
    })
}


const elasticInsertMany = async (dataset) =>
{
    const body = dataset;
    
// taken from elasticsearch documentation
   const { body: bulkResponse } = await elastic.bulk({ refresh: true, body })

  if (bulkResponse.errors) {
    const erroredDocuments = []
    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0]
      if (action[operation].error) {
        erroredDocuments.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1]
        })
      }
    })
    console.log(erroredDocuments)
  }

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
        let elasticJSON = getElasticBulk(inserted); // get searchable documents

    
        elasticInsertMany(elasticJSON)
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