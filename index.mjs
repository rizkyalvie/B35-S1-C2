import express from 'express';
import hbs from 'hbs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from './connection/db.js';
import nodemailer from 'nodemailer';

const app = express()

const __filename = fileURLToPath(
    import.meta.url
);

const __dirname = dirname(__filename);
//handlebars

hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.use('/public', express.static(__dirname + '/public'))

app.use(express.urlencoded({ extended: false }))


app.set('view engine', 'hbs')

// --------------------------------------------------------

function getProjectDuration(endDate, startDate) {

    endDate = new Date(endDate)
    startDate = new Date(startDate)

    const distance = endDate - startDate

    const miliseconds = 1000
    const secondInMinute = 60
    const minuteInHour = 60
    const secondInHour = secondInMinute * minuteInHour // 3600
    const hourInDay = 23
    const dayInMonth = 30

    let dayDistance = distance / (miliseconds * secondInHour * hourInDay)

    if (dayDistance >= 30) {
        return `${Math.floor(dayDistance / dayInMonth)}` + ` Bulan`
    } else {
        return `${Math.floor(dayDistance)}` + ' Hari'
    }
}

let month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec"
]

function getFullTime(time) {
    time = new Date(time);
    const date = time.getDate();
    const monthIndex = time.getMonth();
    const year = time.getFullYear();
    const fullTime = `${date} ${month[monthIndex]} ${year}`;

    return fullTime
}

let isLogin = true;

app.get('/', function(req, res) {

    db.connect(function(err, client, done) {
        if (err) throw err;

        const query = 'SELECT * FROM tb_project'

        client.query(query, function(err, result) {
            if (err) throw err;

            const projectData = result.rows


            function getProjectDuration(endDate, startDate) {

                endDate = new Date(endDate)
                startDate = new Date(startDate)

                const distance = endDate - startDate

                const miliseconds = 1000
                const secondInMinute = 60
                const minuteInHour = 60
                const secondInHour = secondInMinute * minuteInHour // 3600
                const hourInDay = 23
                const dayInMonth = 30

                let dayDistance = distance / (miliseconds * secondInHour * hourInDay)

                if (dayDistance >= 30) {
                    return `${Math.floor(dayDistance / dayInMonth)}` + ` Bulan`
                } else {
                    return `${Math.floor(dayDistance)}` + ' Hari'
                }
            }

            const projectCard = projectData.map((data) => {

                return {
                    duration: getProjectDuration(data.end_date, data.start_date),
                    isLogin,
                    ...data

                }
            })

            const projectModal = projectCard[2]

            res.render('index', {
                title: "Home",
                homeActive: true,
                active: "active",
<<<<<<< HEAD
<<<<<<< HEAD
                isLogin,
=======
                isLogin: req.session.isLogin,
                user: req.session.user,
>>>>>>> 87a6b88b099e30e5fe1790d3f58ef0f77d237248
=======
                isLogin,
                modal: projectModal,
>>>>>>> parent of 87a6b88 (Day 6)
                card: projectCard,

            })
        })
        done();
    })

})

app.get('/contact', function(req, res) {
    res.render('contact', { title: "Contact Me" })
})

app.post('/contact', function(req, res) {

    let name = req.body.name
    let email = req.body.email
    let phone = req.body.phone
    let subject = req.body.subject
    let message = req.body.message

    let transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
            user: "b35c2testing@outlook.com",
            pass: "hencerymonstec!!@@33"
        },
    });

    const options = {
        from: "b35c2testing@outlook.com",
        to: "alvienuryahya@gmail.com",
        subject: `${subject}`,
        text: `Hello! my name is ${name}, ${message}`
    }

    transporter.sendMail(options, function(err, info) {
        if (err) {
            console.log(err)
            return;
        }
        console.log("Sent: " + info.response)
    });

    res.redirect('/')
})

app.get('/addproject', function(req, res) {


    res.render('addproject', { title: "Add Project", apActive: true, active: "active", isLogin })
})

app.post('/addproject', function(req, res) {

    const title = req.body.projectTitle
    const start_date = req.body.projectStartDate
    const end_date = req.body.projectEndDate
    const description = req.body.projectContent
    const technologies = []
    const image = req.body.projectImage

    if (req.body.checkHtml) {
        technologies.push('html');
    } else {
        technologies.push('')
    }
    if (req.body.checkCss) {
        technologies.push('css');
    } else {
        technologies.push('')
    }
    if (req.body.checkNode) {
        technologies.push('node.js');
    } else {
        technologies.push('')
    }
    if (req.body.checkReact) {
        technologies.push('react.js');
    } else {
        technologies.push('')
    }

    db.connect(function(err, client, done) {
        if (err) throw err;

        const query = `INSERT INTO tb_project (title, start_date, end_date, description, technologies, image) 
                       VALUES ('${title}', '${start_date}', '${end_date}', '${description}', ARRAY ['${technologies[0]}', '${technologies[1]}','${technologies[2]}', '${technologies[3]}'], '${image}')`

        client.query(query, function(err, result) {
            if (err) throw err;

            res.redirect('/')
        })
        done();
    })

})

app.get('/project-detail/:id', function(req, res) {

    let id = req.params.id

    db.connect(function(err, client, done) {
        if (err) throw err;
        const query = `SELECT * FROM tb_project WHERE id = ${id}`;

        client.query(query, function(err, result) {
            if (err) throw err;

            const projectDetail = result.rows[0];

            projectDetail.duration = getProjectDuration(projectDetail.end_date, projectDetail.start_date)
            projectDetail.start_date = getFullTime(projectDetail.start_date)
            projectDetail.end_date = getFullTime(projectDetail.end_date)

            res.render('project-detail', { title: projectDetail.title, isLogin, project: projectDetail })
        });

        done();
    });
})

app.get('/delete-project/:id', function(req, res) {

    let id = req.params.id

    db.connect(function(err, client, done) {
        if (err) throw err;

        const query = `DELETE FROM tb_project WHERE id = ${id};`;

        client.query(query, function(err, result) {
            if (err) throw err;

            res.redirect('/');
        });

        done();
    });

})

app.get('/editproject/:id', function(req, res) {

    let data = req.params.id

    db.connect(function(err, client, done) {
        if (err) throw err;

        const query = `SELECT * FROM tb_project WHERE id= ${data};`

        client.query(query, function(err, result) {
            if (err) throw err;

            const projectData = result.rows[0];

            res.render('editproject', {
                title: 'Edit Project',
                edit: projectData,
                id: data
            })
        })
        done();
    })
})

app.post('/editproject/:id', function(req, res) {

    let id = req.params.id

    const title = req.body.projectTitle
    const start_date = req.body.projectStartDate
    const end_date = req.body.projectEndDate
    const description = req.body.projectContent
    const technologies = []
    const image = req.body.editImage

    if (req.body.checkHtml) {
        technologies.push('html');
    } else {
        technologies.push('')
    }
    if (req.body.checkCss) {
        technologies.push('css');
    } else {
        technologies.push('')
    }
    if (req.body.checkNode) {
        technologies.push('node.js');
    } else {
        technologies.push('')
    }
    if (req.body.checkReact) {
        technologies.push('react.js');
    } else {
        technologies.push('')
    }

    db.connect(function(err, client, done) {
        if (err) throw err;

        const query = `UPDATE tb_project 
                       SET title = '${title}', start_date = '${start_date}', end_date = '${end_date}', description = '${description}', technologies = ARRAY ['${technologies[0]}', '${technologies[1]}','${technologies[2]}', '${technologies[3]}'], image='${image}' 
                       WHERE id=${id};`

        client.query(query, function(err, result) {
            if (err) throw err;

            res.redirect('/')
        })
        done();
    })

})


const port = 8080
app.listen(port, function() {
    console.log(`Server running on port: ${port}`)
})