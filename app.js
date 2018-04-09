const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.set('trust proxy', 1);

// for parsing application/json, increasing the limit to support long string base64 for image
app.use(bodyParser.json({ limit: '20mb' }));

// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));

app.post('/', (req, res, next) => {
    console.log('post works, this is the image value', req.body.photo);
    console.log('post works', req.body);
    res.status(201).end();
});


app.listen(3005, () => {
    console.log(`le serveur ecoute au port ${3005}`);
});

app.use(function (err, req, res, next) {
    let error = err;
    const map = {
        ER_DUP_ENTRY: `Vous essayez d'inserer une valeur qui existe deja`,
        ER_DUP_KEY: `Vous essayez d'inserer une clé qui existe deja`,
        ER_BAD_FIELD_ERROR: `La colonne n'existe pas dans la table`,
        ER_ROW_IS_REFERENCED: 'Impossible de supprimer un enregistrement car il est utilisé dans une autre table',
        ER_ROW_IS_REFERENCED_2: `Impossible de supprimer un enregistrement car il est utilisé dans une autre table`,
        ER_BAD_NULL_ERROR: `Une colonne a été laissée nulle alors qu'elle ne le doit pas`,
        ER_PARSE_ERROR: `La requette SQL invalide`,
        ER_EMPTY_QUERY: 'Une requette avec corps vide',
        ER_NO_DEFAULT_FOR_FIELD: `Votre requette manque certain champs`,
        ER_DATA_TOO_LONG: `La valeur fournie est trop longue`,
    };

    // check if it is a database error and format the proper description if so.
    if (error.sqlState) {
        let key;
        let description;

        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            description = error.toString();
        } else {
            description = map[error.code];
            console.log('ma description', description, error.code);
        }
        error = new Error();
        error.code = 400;
        error.description = description;
    }

    // prevent invalid http error codes.
    if (!error.status) { error.status = 500; }

    console.log('captured error', error);

    res.status(error.status).json(error);
});

// ensure the process terminates gracefully when an error occurs.
process.on('uncaughtException', (e) => {
    console.error('process.onUncaughException:', e);
    process.exit(1);
});

process.on('warning', (warning) => {
    console.warn('process.onWarning: %o', warning);
});

