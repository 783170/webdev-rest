import * as path from 'node:path';
import * as url from 'node:url';

import { default as express } from 'express';
import { default as sqlite3 } from 'sqlite3';

// const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
// const db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');
let public_dir = './public';
const dbFile = "./stpaul_crime.sqlite3";

const port = 8080;

// let app = express();
// app.use(express.json());
let app = express();
app.use(express.static(public_dir));
app.use(express.json());

/********************************************************************
 ***   DATABASE FUNCTIONS                                         *** 
 ********************************************************************/
// Open SQLite3 database (in read-write mode)
let db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log('Error opening ' + path.basename(dbFile));
    }
    else {
        console.log('Now connected to ' + path.basename(dbFile));
    }
});

// Create Promise for SQLite3 database SELECT query 
function dbSelect(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}

// Create Promise for SQLite3 database INSERT or DELETE query
function dbRun(query, params) {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

/********************************************************************
 ***   REST REQUEST HANDLERS                                      *** 
 ********************************************************************/
// GET request handler for crime codes -- Anne
app.get('/codes', (req, res) => {
    // console.log(req.query); // query object (key-value pairs after the ? in the url)
    
    // res.status(200).type('json').send({}); // <-- you will need to change this
    let sql = `SELECT code, incident_type FROM Codes ORDER BY code ASC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error});
            return;
        }
        res.json(rows.map(r => ({
            code: r.code,
            type: r.incident_type
        })));
    });
});

// GET request handler for neighborhoods -- Anne
app.get('/neighborhoods', (req, res) => {
    // console.log(req.query); // query object (key-value pairs after the ? in the url)
    
    // res.status(200).type('json').send({}); // <-- you will need to change this
    let sql = `SELECT neighborhood_number, neighborhood_name FROM Neighborhoods ORDER BY neighborhood_number ASC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json(rows.map(r => ({
            id: r.neighborhood_number,
            name: r.neighborhood_name
        })));
    });
});

// GET request handler for crime incidents
app.get('/incidents', (req, res) => {
    console.log(req.query); // query object (key-value pairs after the ? in the url)
    
    res.status(200).type('json').send({}); // <-- you will need to change this
});

// PUT request handler for new crime incident
app.put('/new-incident', (req, res) => {
    console.log(req.body); // uploaded data
    
    res.status(200).type('txt').send('OK'); // <-- you may need to change this
});

// DELETE request handler for new crime incident
app.delete("/remove-incident", (req, res) => {
    const caseNumber = req.body.case_number;
    if (!caseNumber) {
        res.status(400).type("txt").send("error: missing case_number");
        return;
    }
    // 1. Check if case_number exists
    const checkSql = "SELECT case_number FROM Incidents WHERE case_number = ?";
    dbSelect(checkSql, [caseNumber])
        .then(rows => {
            if (rows.length === 0) {
                // Same logic as: if (user_index < 0)
                res.status(500).type("txt").send("error: case_number does not exist");
                throw new Error("stop");   // stop the promise chain
            }

            // 2. Delete the record
            const deleteSql = "DELETE FROM Incidents WHERE case_number = ?";
            return dbRun(deleteSql, [caseNumber]);
        })
        .then(() => {
            // Same logic as: res.send("success")
            res.status(200).type("txt").send("success");
        })
        .catch(err => {
            if (err.message !== "stop") {
                res.status(500).type("txt").send("error: " + err.message);
            }
        });
});

/********************************************************************
 ***   START SERVER                                               *** 
 ********************************************************************/
// Start server - listen for client connections
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
