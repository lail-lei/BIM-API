/** methods to connect to db */
const mysql = require("mysql");

 // create pool 
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD
})


// "abstracted" method to avoid repeating this code over again
// actually queries the db connection pool
const buildQuery = (query, values) => 
{
    return new Promise((resolve, reject) =>{
        pool.query(query, values, (err, results) =>
        {
            if(err) return reject(err);
            // remove row packet data wrapper from results
            results = JSON.parse(JSON.stringify(results));
            return resolve(results);
        });
    });
}


const getRecipesToUnpublish = () => buildQuery("SELECT recipe_id from bim_feedback where user_id = 1053 and reaction = -1 and date_reacted >= DATE_SUB(NOW(),INTERVAL 1 DAY);");
// TO-DO get highly rated BIM recipes

module.exports = {
                    getRecipesToUnpublish
                 }
                   