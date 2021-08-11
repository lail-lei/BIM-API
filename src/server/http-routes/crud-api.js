// const express = require("express");
// const router = express.Router();



// router.get('/:id', passport.authenticate("access-strategy", {session: false}), 
//                    middleware.recipes.getRecipe, 
//                    middleware.permissions.isCreator, 
//                    middleware.permissions.isOwner, 
//                    middleware.permissions.getViewingAccess, 
                    
//                    async (req, res) =>{
                  
//                      try{
 
//                         // if is published, user is not blocked (friend or regular user)
//                         if(res.recipe.status === 2) return res.status(200).json({recipe: res.recipe, access: "viewer"});

//                         // if is private, but user is friend
//                         if(res.recipe.status <= 1 && res.has_privileged_access == true) return res.status(200).json({recipe: res.recipe, access: "viewer"})  

//                         // private, not viewable 
//                         return res.sendStatus(403);
//                      }
//                      catch (err){
//                         console.log(err);
//                         return res.sendStatus(500);
//                      }
// });

// // post a new recipe
// router.get('/', passport.authenticate("access-strategy", {session: false}), 
//                  middleware.recipes.postRecipe, 
//                  middleware.recipes.updateElastic, 
//                  middleware.recipes.rollback);

// router.patch('/', passport.authenticate("access-strategy", {session: false}), 
//                   middleware.recipes.getRecipeByReqBody, 
//                   middleware.permissions.canEdit, 
//                   middleware.recipes.patchRecipe, 
//                   middleware.recipes.updateElastic, 
//                   middleware.recipes.rollbackLastEdit);

//  router.delete('/:id', passport.authenticate("access-strategy", {session: false}), 
//                       middleware.recipes.getRecipe, 
//                       middleware.permissions.canEdit, 
//                       middleware.recipes.deleteRecipe,
//                       middleware.recipes.updateElastic,
//                       middleware.recipes.rollbackStatus
//                    );

// module.exports = router;



