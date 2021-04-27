const express = require('express');

const app = express();

app.get('/word/:wordId', (req, res) => {
    // const defs = ['meaning 1', 'meaning 2', 'meaning 3'];
    // res.send(defs);
    // const defs = [{id: 1, name: 'John'}];
    // res.json(defs);

    //Code from OD documentation
    const http = require("https");

    const app_id = "5a3e8dec"; // insert your APP Id
    const app_key = "6ff35dc40a6b1987baf7ce0e1f13e83d"; // insert your APP Key
    //const wordId = "ace";
    const wordId = req.params.wordId;
    console.log(wordId);
    //res.send(wordId); //test if parameter reached the server
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
        //mode: 'no-cors',
    };

    http.get(options, (resp) => {
        let body = '';
        resp.on('data', (d) => {
            body += d;
        });
        resp.on('end', () => {
            let json = JSON.parse(body);
            if (json.results) {
                let senses;
                senses = json.results[0].lexicalEntries[0].entries[0].senses;
                senses.forEach(element => {
                    //console.log(element.definitions[0]);
                    result.push(element.definitions[0]);
                });
            } else {
                result.push("no result found - sadly the lookup only works for root words");
            }
            console.log(result);
            res.json(result);
        });
    });


});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));


