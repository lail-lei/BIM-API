

const db = require("../db");
const Recipe = require("../models/index"); // for updating mongo
const elasticMethods = require("./elastic-methods")



// for unpublishing recipes rated bad by the BIM account
const unpublishBadRecipes = async () => {
    try{
            let badRecipes = await db.getRecipesToUnpublish();

            // if no bad recipes, return
            if (badRecipes.length === 0) return;
            // get only the ids
            badRecipes = badRecipes.map(element => {return element.recipe_id })


            // now set status of recipes to 1 (private)
            Recipe.updateMany({_id: {$in : badRecipes}}, 
                {status: 1}, function (err, docs) {
                if (err){
                    console.log(err)
                }
                else{
                    console.log("Updated Docs : ", docs);
                    elasticMethods.updateStatus(badRecipes, 1)

                }
            });
        }

        
    
        catch(err){
            console.log(err)
        }
}

module.exports = {
    unpublishBadRecipes
}