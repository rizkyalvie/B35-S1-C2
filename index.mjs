// package import -----------------------
import express from 'express';
import hbs from 'hbs';
import path from 'path';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import session from 'express-session';
import flash from 'express-flash';
import db from './connection/db.js';
import upload from './middlewares/uploadFile.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { resourceUsage } from 'process';

// package import x ----------------------
const app = express()
const __filename = fileURLToPath(
    import.meta.url
);
const __dirname = dirname(__filename);

app.use('/public', express.static(__dirname + '/public'))
app.use('/uploads', express.static(__dirname + '/uploads'))
app.use(express.urlencoded({ extended: false }))
app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * 60 * 1 },
    })
);
app.use(flash());
app.set('view engine', 'hbs')
hbs.registerPartials(path.join(__dirname, '/views/partials'));

// function and global declaration --------------------------------------------------------

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

// function and global declaration x ------------------------------------------------------

// index -----------------------------------------------------

app.get('/', function(req, res) {

    db.connect(function(err, client, done) {
        if (err) throw err;

        let query = '';

        if (req.session.isLogin == true) {
            query = `SELECT tb_project.*, tb_user.id as "user_id", tb_user.name, tb_user.email
            FROM tb_project
            LEFT JOIN tb_user
            ON tb_project.author_id = tb_user.id 
            WHERE tb_project.author_id = ${req.session.user.id}
            ORDER BY tb_project.id DESC`;
        } else {
            query = `SELECT tb_project.*, tb_user.id as "user_id", tb_user.name, tb_user.email
            FROM tb_project
            LEFT JOIN tb_user
            ON tb_project.author_id = tb_user.id
            ORDER BY tb_project.id DESC`;
        }

        client.query(query, function(err, result) {
            if (err) throw err;

            const projectData = result.rows

            const projectCard = projectData.map((data) => {


                data.duration = getProjectDuration(data.end_date, data.start_date),
                    data.isLogin = req.session.isLogin,
                    data.image = data.image ? '/uploads/' + data.image : '/public/assets/DWB.png';

                return data
            })

            res.render('index', {
                title: "Home",
                homeActive: true,
                active: "active",
                isLogin: req.session.isLogin,
                user: req.session.user,
                card: projectCard,

            })
        })
        done();
    })
})

// index x -----------------------------------------------------

// contact -----------------------------------------------------

app.get('/contact', function(req, res) {
    res.render('contact', {
        title: "Contact Me",
        isLogin: req.session.isLogin,
        user: req.session.user
    })
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

// contact x -----------------------------------------------------

// add project -----------------------------------------------------

app.get('/addproject', function(req, res) {


    res.render('addproject', {
        title: "Add Project",
        apActive: true,
        active: "active",
        isLogin: req.session.isLogin,
        user: req.session.user,
    })
})

app.post('/addproject', upload.single('pImage'), function(req, res) {

    const title = req.body.projectTitle
    const start_date = req.body.projectStartDate
    const end_date = req.body.projectEndDate
    const description = req.body.projectContent
    const technologies = []
    const userId = req.session.user.id
    const fileUpload = req.file.filename

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

        const query = `INSERT INTO tb_project (title, start_date, end_date, description, technologies, image, author_id) 
                       VALUES ('${title}', '${start_date}', '${end_date}', '${description}', ARRAY ['${technologies[0]}', '${technologies[1]}','${technologies[2]}', '${technologies[3]}'], '${fileUpload}', '${userId}')`

        client.query(query, function(err, result) {
            if (err) throw err;

            res.redirect('/')
        })
        done();
    })

})

// add project x -----------------------------------------------------

// project detail -----------------------------------------------------

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

            res.render('project-detail', {
                title: projectDetail.title,
                isLogin,
                project: projectDetail,
                isLogin: req.session.isLogin,
                user: req.session.user,
            })
        });

        done();
    });
})

// project detail x -----------------------------------------------------

// delete project -----------------------------------------------------

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

// delete project x -----------------------------------------------------

// edit project -----------------------------------------------------

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

// edit project x -----------------------------------------------------

// login -----------------------------------------------------

app.get('/login', function(req, res) {


    res.render('login', {
        title: "Login",
        logActive: true,
        active: "active",
    })
})

app.post('/login', function(req, res) {

    const email = req.body.loginEmail
    const password = req.body.loginPassword;

    if (email == '' || password == '') {
        req.flash('warning', 'Please insert all fields');
        return res.redirect('/login');
    }

    db.connect(function(err, client, done) {
        if (err) throw err;

        const query = `SELECT * FROM tb_user WHERE email = '${email}';`;

        client.query(query, function(err, result) {
            if (err) throw err;

            const accountData = result.rows;

            if (accountData.length == 0) {
                req.flash('error', 'Email not found');
                return res.redirect('/login');
            }

            const passwordDec = bcrypt.compareSync(password, accountData[0].password);

            if (passwordDec == false) {
                req.flash('error', 'Wrong password');
                return res.redirect('/login');
            }

            req.session.isLogin = true;
            req.session.user = {
                id: accountData[0].id,
                email: accountData[0].email,
                name: accountData[0].name,
            };

            req.flash('success', `Welcome, <b>${accountData[0].name}</b>`);

            res.redirect('/');
        });

        done();
    });
});

// login x -----------------------------------------------------

// register -----------------------------------------------------

app.get('/register', function(req, res) {
    res.render('register', { title: 'Register', regActive: true, active: "active" })
})

app.post('/register', function(req, res) {

    let name = req.body.registerName
    let email = req.body.registerEmail
    let password = req.body.registerPassword

    password = bcrypt.hashSync(password, 10)

    db.connect(function(err, client, done) {
        if (err) throw err;

        const query = `INSERT INTO tb_user (name, email, password) 
                       VALUES ('${name}', '${email}', '${password}')`

        client.query(query, function(err, result) {
            if (err) throw err;


        })
        done();
    })

    res.redirect('/login')


})

// register x -----------------------------------------------------


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

const port = 8080
app.listen(port, function() {
    console.log(`Server running on port: ${port}`)
})