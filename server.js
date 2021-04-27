//Set up environment variables:
//1. Create .env file with environment variables
//2. Install dotenv dependency (npm i dotenv)
//3. require('dotenv').config();
//4. const port = process.env.PORT etc

require('dotenv').config();
const port = process.env.PORT || 5000;
const app_id = process.env.APP_ID;
const app_key = process.env.APP_KEY;
console.log(port);

const express = require('express');
const app = express();
app.listen(port, () => console.log(`Server started on port ${port}`));

app.get('/definition/:wordId', (req, res) => {
    const wordId = req.params.wordId; 
    //console.log('wordId', wordId);
    
    //First try to get root by redirect
    const rootId = redirect('/exists/' + wordId);
    console.log('rootId', rootId);


    const http = require("https");
    let result = [];

    const options = {
        host: 'od-api.oxforddictionaries.com',
        port: '443',
        path: '/api/v2/entries/en-gb/' + wordId,
        method: "GET",
        headers: {
            'app_id': app_id,
            'app_key': app_key
        },
    };

    http.get(options, (resp) => {
        let body = '';
        resp.on('data', (d) => {
            body += d;
        });
        resp.on('end', () => {
            let json = JSON.parse(body);
           
            if (    json.results && 
                    json.results[0].lexicalEntries && 
                    json.results[0].lexicalEntries[0].entries && 
                    json.results[0].lexicalEntries[0].entries[0].senses &&
                    json.results[0].lexicalEntries[0].entries[0].senses[0].definitions
                ) {
                let senses = json.results[0].lexicalEntries[0].entries[0].senses;
                senses.forEach(sense => {
                    //console.log(element.definitions[0]);
                    result.push(sense.definitions[0]); 
                });
            } else {
                result.push("Sorry, no results found");
            }
            console.log(result);
            res.json(result);
        });
    });
});

app.get('/exists/:wordId', (req, res) => {
    const http = require("https");
    const wordId = req.params.wordId; 
    //console.log(wordId);
    let result = [];

    const options = {
        host: 'od-api.oxforddictionaries.com',
        port: '443',
        path: '/api/v2/lemmas/en/' + wordId,
        method: "GET",
        headers: {
            'app_id': app_id,
            'app_key': app_key
        },
        redirect: 'follow'
    };

    http.get(options, (resp1) => {
        let body1 = '';
        resp1.on('data', (d) => {
            body1 += d;
        });
        resp1.on('end', () => {
            // let parsed = JSON.stringify(body);
            // console.log(parsed);
            // res.json(parsed);

            let json1 = JSON.parse(body1);
            //console.log(json);
            //res.json(json.results[0].lexicalEntries[0].inflectionOf[0].id);
            //res.json(json);
            let id
            if (    json1.results && 
                    json1.results[0].lexicalEntries &&
                    json1.results[0].lexicalEntries[0].inflectionOf &&
                    json1.results[0].lexicalEntries[0].inflectionOf[0].id
                ) {
                id = json1.results[0].lexicalEntries[0].inflectionOf[0].id;
            } else {
                id = wordId;
            }
            console.log(id);

            //Insert second http request here
            options.path = '/api/v2/entries/en-gb/' + id;

            http.get(options, (resp2) => {
                let body2 = '';
                resp2.on('data', (d) => {
                    body2 += d;
                });
                resp2.on('end', () => {
                    let json2 = JSON.parse(body2);
                   
                    if (    json2.results && 
                            json2.results[0].lexicalEntries && 
                            json2.results[0].lexicalEntries[0].entries && 
                            json2.results[0].lexicalEntries[0].entries[0].senses &&
                            json2.results[0].lexicalEntries[0].entries[0].senses[0].definitions
                        ) {
                        let senses = json2.results[0].lexicalEntries[0].entries[0].senses;
                        senses.forEach(sense => {
                            //console.log(element.definitions[0]);
                            result.push(sense.definitions[0]); 
                        });
                    } else {
                        result.push("Sorry, no results found");
                    }
                    console.log(result);
                    res.json(result);
                });
            });


            //res.json(id);
        });
    });
});

//Web resources:
//https://www.youtube.com/watch?v=v0t42xBIYIs&t=1048s //Building react/express app - Traversy media
//https://www.youtube.com/watch?v=v0t42xBIYIs&t=1048s //Using dotenv with NodeJS and Environment Variables - Steve Griffith
//https://codewithmosh.com/courses/293204/lectures/4509494 //Route parameters - CodewithMosh

