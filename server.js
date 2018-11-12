var fs = require('fs')
const express = require('express');
const winston = require('winston');
const expressWinston = require('express-winston');
const app = express();

//Logger makes sense before the router
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({ //to print on console
          json: true,
          colorize: true
        }),
        new winston.transports.File({ //to print in file
            filename: 'access.log',
            level: 'info'
        })
    ]
}))

const passportSetup = require('./passport');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
const passport = require('passport');
const port = process.env.PORT || 5000;
const { spawn, exec, execFile } = require('child_process');
app.use(passport.initialize());
app.use(passport.session());
const apps = require('./db/db.apps');
const users = require('./db/db.users');
const db = require('./db/db');

db(); // mongoose connection to database
let user_id;

const server = app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

app.get("/auth", passport.authenticate('gitlab'));

app.get("/auth/gitlab", passport.authenticate('gitlab'), (req, res) => {
    // console.log("now reached here", req)
    const authCode = req.query.code;
    // console.log(res.req.user)
    user_id = res.req.user.id;
    const req_obj = { //it is user data to be inserted in user table
        userId: res.req.user.id,
        userName: res.req.user.username,
        displayName: res.req.user.displayName,
        email: res.req.user._json.email,
        profileUrl: res.req.user.profileUrl
    }

    users.addUser(req_obj).subscribe(doc => {
        console.log("subscribe ", doc)
    });

    res.redirect("http://localhost:3000/newApp?token=" + authCode);
})

app.post("/deploy", (req, res) => {
    console.log("user id of inserted object in user table : ",user_id);
    const body = req.body;
    const url = Object.keys(body)[0];
    const folder = "gitDirectories";
    fs.stat(folder, (err, stats) => {

        if (err) {
            fs.mkdirSync(`./${folder}`);
        }

        const repo = url.split("/").pop().toLowerCase();
        const command = spawn(`./script.sh`, [url, repo]);
        apps.findAndUpdateApp({
            appId: Math.random(),
            userId: user_id,
            app_name: repo,
            timestamp: "2018-11-05T09:11:11.603Z",
            status: "required: true",
            app_URL: url
        }).subscribe(console.log);


        command.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        command.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        command.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    });

    res.json(url);
})



app.get("/apps", (req, res) => {
    console.log("inside /listUrl route calling /apps route in express");
    apps.getUserApps(user_id).subscribe(doc => {
       res.status(201).json(doc)
    });
})

//Place the express-winston errorLogger after the router.
app.use(expressWinston.errorLogger({
    transports: [
          new winston.transports.Console({ //to print on console
            json: true,
            colorize: true
          }),
        new winston.transports.File({ //to print in file
            filename: 'error.log',
            level: 'error'
        })
    ]
}));

module.exports = server;