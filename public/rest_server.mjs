// TODO :: Complete this file to implement the REST API server


import fs from 'node:fs';
import { toXML } from 'jstoxml';

import { default as express } from "express";
import { parse } from 'node:path';

const port = 8080;
let public_dir = './public';

let app = express();
app.use(express.static(public_dir));
app.use(express.json());

let xml_config = {
    indent: '    '
}

// GET /codes :: Anne
app.get('/codes', (req, res) => {
});

// GET /neighborhoods :: Anne
app.get('/neighborhoods', (req, res) => {
});

// GET /incidents
app.get('/neighborhoods', (req, res) => {
});


// PUT /new-incident
app.put('/new-incident', (req, res) => {
});

// DELETE /remove-incident
app.delete('/remove-incident', (req, res) => {
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});