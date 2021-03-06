const express = require('express')
const app = express()
const port = process.env.PORT || 3001;
const path = require('path');
const Database = require('better-sqlite3');
const initializeDatabase = require('./db/initializeDatabase');
const config = require('./config');


initializeDatabase();
//function to run seed scripts if db doesn't exist - or put in a separate module and reference here

app.use(express.static("public"))
app.use(express.json());


app.get('/episodes', (req, res) => {
    let db = new Database(config.databaseName);
    const stmt = db.prepare(`SELECT 
	Episodes.*, 
	avg(Ratings.Rating) as Average 
FROM Episodes 
LEFT JOIN Ratings on Ratings.Episode_Id = Episodes.ID 
GROUP by Episodes.ID;`);
    const episodeData = stmt.all();
    res.send(JSON.stringify(episodeData));
})

app.post('/ratings', (req, res) => {
    let db = new Database(config.databaseName);
    if (req.body.rating < 1 || req.body.rating > 10) {
        res.send("Rating must be between 1 and 10");
    }
    else {
        const stmt = db.prepare('INSERT into Ratings (Rating, Comment, Episode_Id) values (?, ?, ?)');
        stmt.run(req.body.rating, req.body.comment, req.body.episodeId);
        res.send("saved review");
    }
})

app.get('/ratings', (req, res) => {
    let db = new Database(config.databaseName);
    const stmt = db.prepare(`SELECT Episodes.Title, Comment, Rating
    FROM Ratings
    INNER JOIN Episodes on Episodes.Id = Ratings.Episode_Id
    ORDER by Ratings.Id DESC
    LIMIT 20;
    `);
    const commentData = stmt.all();
    res.send(JSON.stringify(commentData));
}) //use for comments?

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})




//for comments:

// SELECT episodes.Title, Comment, Rating
// FROM Ratings
// INNER JOIN Episodes on Episodes.Id = Ratings.Episode_Id
// ORDER by Ratings.Id DESC
// LIMIT 20;