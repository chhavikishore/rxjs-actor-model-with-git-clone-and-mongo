const express = require('express');
const Rx = require('rxjs');
const { map, pluck, filter, flatMap } = require('rxjs/operators');
const app = express();
const passportSetup = require('./passport');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
const passport = require('passport');
const port = process.env.PORT || 5000;
const { spawn } = require('child_process');
const fs = require('fs');
app.use(passport.initialize());
app.use(passport.session());
const requests = new Rx.Subject();

const server = app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

app.get("/auth", passport.authenticate('gitlab'));

app.get("/auth/gitlab", passport.authenticate('gitlab'), (req, res) => {
    console.log("now reached here", req)
    const authCode = req.query.code;
    res.redirect("http://localhost:3000/newApp?token=" + authCode);
})

function requestsToObservables(req, res, next) {
    requests.next(req);
    next();
}

app.post("/deploy", requestsToObservables, (req, res) => {
    requests.pipe(
        pluck("body"),
        map((body) => Object.keys(body)[0]),
        flatMap((url) => {
            const folder = "gitDirectories";
            const repo = url.split("/").pop().toLowerCase();
            const test = Rx.bindNodeCallback(fs.stat);
            test(folder).subscribe(
                function (x) { console.log("yes folder exists"); },
                function (e) {
                    console.log("folder created")
                    fs.mkdirSync(`./${folder}`);
                },
                function () {
                    console.log("executing command now");
                    const command = spawn(`./script.sh`, [url, repo]);
                    const stdout = Rx.fromEvent(command.stdout, 'data');
                    const stderr = Rx.fromEvent(command.stderr, 'data');
                    const close = Rx.fromEvent(command, 'close');
                    return Rx.merge(stdout, stderr, close).pipe(map((data) => data.toString('utf-8')))
                }
            )
        })
    ).subscribe(console.log);
    res.json({ status: "ok" })
});
