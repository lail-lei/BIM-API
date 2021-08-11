const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectID;

// nested schema
const recipeYieldSchema = new mongoose.Schema({
    label:  String,
    amount: Number,
             
})

const recipeIngredientSchema = new mongoose.Schema({
    name: String,
    amount: String, // easier to store fractions as strings and convert on front end, avoid data loss
    unit: String,
    group: {
        type: String,
        default: "main"
    }
})

const TimeUnitSchema = new mongoose.Schema({
    hours: Number,
    minutes: Number,
    seconds: Number
})

const recipeTimesSchema = new mongoose.Schema({
    grill: TimeUnitSchema, // cook, grill, bake, cool, prep, chill
    cook: TimeUnitSchema,
    bake: TimeUnitSchema,
    cool: TimeUnitSchema, 
    prep: TimeUnitSchema,
    chill: TimeUnitSchema
})

const recipeImageSchema = new mongoose.Schema({
    image_url: String,
    position: Number
})


// full recipe schema
const recipeSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        default: Date.now().toString()
    },

    owner_id: {
        type: Number,
        required: true
    },

    original_owner_id: {
        type: Number,
        required: true
    },

    date_created: {
        type: Date,
        required: true,
        default: Date.now()
    },

    date_updated: {
        type: Date,
        required: true,
        default: Date.now()
    },

    status: {
        type: Number,
        required: true,
        default: 1
    },

    yield: {type: recipeYieldSchema},

    ingredients: [recipeIngredientSchema],

    steps: [{type: String}],

    notes: {type: String},

    times: {type: recipeTimesSchema},

    tags: [{type: String}],

    images: [recipeImageSchema],

    parent_recipe: {
        type: ObjectID,
        required: false,
        default: null
    }  
})




module.exports = mongoose.model('Recipe', recipeSchema);