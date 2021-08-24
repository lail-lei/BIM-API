const { Client } = require('@elastic/elasticsearch')
const elastic = new Client({ node: process.env.ELASTIC_DATABASE_URL })

// updating is the same as indexing in elastic under the hood
const indexMany = async (dataset) =>
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


// format mongoose recipe model instances to elasticsearch instances
const getBulk = (json) => {
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


const updateStatus = (ids, status) => {

  
  
  elastic.updateByQuery({
    index: 'recipes',
    refresh: true,
    body: {
      script: {
        lang: 'painless',
        source: 'ctx._source["status"] = params.status',
        params: {status: status}
      },
      query: {
        ids: {
          values: ids,
        }
      }
    }
  })
}


module.exports = {
    getBulk,
    indexMany,
    updateStatus
}