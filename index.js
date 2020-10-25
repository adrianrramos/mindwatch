const app = require('express')()
const bodyParser = require('body-parser')
const mysql = require('mysql')

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA
});

// parse application/json
app.use(bodyParser.json({}))
app.use(bodyParser.urlencoded({
    extended: true
}));



app.post('/mindwatch', function (req, res) {
    if (req.body.CurrentTask === "start_survey") {
        let data = JSON.parse(req.body.Memory)
        let collectedData = data.twilio.collected_data.moca_answers

        console.log('hit', collectedData.status)

        if (collectedData && collectedData.status === "complete") {
            let score = 0
            let currentDate = new Date(collectedData.date_completed)

            for (const key in collectedData.answers) {
                let currentAnswer = collectedData.answers[key]

                if (currentAnswer.type === 'Twilio.YES_NO' && currentAnswer.answer === 'No') score++
                if (currentAnswer.type === 'Twilio.Number' && currentAnswer.answer === currentDate.getFullYear().toString()) score++
                if (currentAnswer.type === 'Twilio.DAY_OF_WEEK' && currentAnswer.answer.toLowerCase() === currentDate.toLocaleString('en-us', { weekday: 'long' }).toLowerCase()) score++
                if (currentAnswer.type === 'Twilio.MONTH' && currentAnswer.answer.toLowerCase() === currentDate.toLocaleString('en-us', { month: 'long' }).toLowerCase()) score++
                if (currentAnswer.type === 'Twilio.CITY' && currentAnswer.answer === 'Pittsburgh') score++
                if (currentAnswer.type === 'Twilio.COUNTRY' && currentAnswer.answer === 'United States of America') score++
                if (currentAnswer.type === 'Twilio.US_STATE' && currentAnswer.answer === 'Pennsylvania') score++

            }

            let queryStr = `INSERT INTO moca_scores (score) VALUE (${score})`

            con.query(queryStr, (err, rows) => {
                if (err) throw err;

                console.log('Data received from Db:');
                console.log(rows);
                res.status(200).end()

                con.end()
            });
        }


    }

    res.writeHead(200).end();
});

app.listen(process.env.PORT || 3000, () => console.log('Listening on port 3000'))

