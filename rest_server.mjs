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

    let params = [];

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        else {
            if (req.query.code) {
                const placeholders = req.query.code.split(',').map(() => '?').join(',');
                sql += ` WHERE code IN (${placeholders})`;
                params = req.query.code.split(',');
            }
            res.json(rows.map(r => ({
            code: r.code,
            type: r.incident_type
        })));
        }
    });
});

// GET request handler for neighborhoods -- Anne
app.get('/neighborhoods', (req, res) => {
    // console.log(req.query); // query object (key-value pairs after the ? in the url)
    
    // res.status(200).type('json').send({}); // <-- you will need to change this
    let sql = `SELECT neighborhood_number, neighborhood_name FROM Neighborhoods ORDER BY neighborhood_number ASC`;
    let params = [];

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        else {
            if (req.query.id) {
                const placeholders = req.query.id.split(',').map(() => '?').join(',');
                sql += ` WHERE neighborhood_number IN (${placeholders})`;
                params = req.query.id.split(',');
            }
                    
            //sql += ` ORDER BY neighborhood_number ASC`;

            res.json(rows.map(r => ({
                id: r.neighborhood_number,
                name: r.neighborhood_name
            })));
        }
    });
});

// GET request handler for crime incidents -- Erin
app.get('/incidents', (req, res) => {
    let sql = `SELECT case_number, DATE(date_time) as date, TIME(date_time) as time, code, incident, police_grid, neighborhood_number, block FROM Incidents`;

    let first = true;
    // WHERE ... AND ... AND ...
    if (!!req.query.case_number) { //YYYY-MM-DD
        sql += (first ? ' WHERE' : ' AND') + ` case_number = '${req.query.case_number}'`;
        first = false;
    }
    if (!!req.query.start_date) { //YYYY-MM-DD
        sql += (first ? ' WHERE' : ' AND') + ` DATE(date_time) >= '${req.query.start_date}'`;
        first = false;
    }
    if (!!req.query.end_date) { //YYYY-MM-DD
        sql += (first ? ' WHERE' : ' AND') + ` DATE(date_time) <= '${req.query.end_date}'`;
        first = false;
    }
    if (!!req.query.code) {
        sql += (first ? ' WHERE' : ' AND') + ` code IN (${req.query.code})`;
        first = false;
    }
    if (!!req.query.grid) {
        sql += (first ? ' WHERE' : ' AND') + ` police_grid IN (${req.query.grid})`;
        first = false;
    }
    if (!!req.query.neighborhood) {
        sql += (first ? ' WHERE' : ' AND') + ` neighborhood_number IN (${req.query.neighborhood})`;
        first = false;
    }

    // ORDER BY
    sql += ' ORDER BY date_time DESC';

    // LIMIT
    sql += (!!req.query.limit) ? ` LIMIT ${req.query.limit}` : ' LIMIT 1000';


    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        } 

        res.json(rows.map(r => ({
            case_number: r.case_number,
            date: r.date,
            time: r.time,
            code: r.code,
            incident: r.incident,
            police_grid: r.police_grid,
            neighborhood_number: r.neighborhood_number,
            block: r.block
        })));
    });
});

// PUT request handler for new crime incident
app.put('/new-incident', (req, res) => {
    if (req.body.case_number) {
        db.all(`SELECT COUNT(case_number) FROM Incidents WHERE case_number = ${req.body.case_number};`, [], (err, rows) => {
            if (err) {
                res.status(500).json({error: err.message});
                return;
            } else {
                if (rows[0]['COUNT(case_number)'] == 1) {
                    res.status(500).json({error: 'case number already in the database'});
                } else {
                    let sql = 'INSERT INTO Incidents (case_number, date_time, code, incident, police_grid, neighborhood_number, block) VALUES (';

                    sql += `'${req.body.case_number}'`;
                    sql += (!!req.body.date && !!req.body.time) ? `, '${req.body.date} ${req.body.time}'` : ', null';
                    sql += (!!req.body.code)? `, ${req.body.code}` : ', null';
                    sql += (!!req.body.incident) ? `, '${req.body.incident}'` : ', null';
                    sql += (!!req.body.police_grid) ? `, ${req.body.police_grid}` : ', null';
                    sql += (!!req.body.neighborhood_number) ? `, ${req.body.neighborhood_number}` : ', null';
                    sql += (!!req.body.block) ? `, '${req.body.block}'` : ', null';
                    sql += ');';

                    db.exec(sql, (err) => {
                        if (err) {
                            res.status(500).json({error: err.message});
                        } else {
                            res.status(200).type('txt').send('OK');
                        }
                    })
                }
            }
        })
    } else {
        res.status(500).json({error: 'no case number provided'});
    }
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
