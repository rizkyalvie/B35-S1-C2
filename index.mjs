import express from 'express';
import hbs from 'hbs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from './connection/db.js'

const app = express()

const __filename = fileURLToPath(
    import.meta.url
);

const __dirname = dirname(__filename);

hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.use('/public', express.static(__dirname + '/public'))

app.use(express.urlencoded({ extended: false }))

app.set('view engine', 'hbs')

// --------------------------------------------------------

let project = []



app.get('/', function(req, res) {

    // let cardData = project.map(function(data) {
    //     return {
    //         ...data
    //     }
    // })

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
                    ...data

                }
            })

            res.render('index', {
                title: "Home",
                homeActive: true,
                active: "active",
                card: projectCard,

            })
        })
        done();
    })

})

app.get('/contact', function(req, res) {
    res.render('contact')
})

app.post('/contact', function(req, res) {

})

app.get('/addproject', function(req, res) {

    res.render('addproject', { title: "Add Project", apActive: true, active: "active" })
})

app.post('/addproject', function(req, res) {

    const projectImage = req.body.projectImage;
    const projectTitle = req.body.projectTitle;
    const projectContent = req.body.projectContent;

    const projectDate = {
        startDate: req.body.projectStartDate,
        endDate: req.body.projectEndDate
    }
    const projectTech = {
        checkHtml: req.body.checkHtml,
        checkNode: req.body.checkNode,
        checkCss: req.body.checkCss,
        checkReact: req.body.checkReact
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

    let endDate = new Date(projectDate.endDate)
    let startDate = new Date(projectDate.startDate)



    const projectDetailDate = {

        edDate: endDate.getDate(),
        edMonth: month[endDate.getMonth()],
        edYear: endDate.getFullYear(),
        sdDate: startDate.getDate(),
        sdMonth: month[startDate.getMonth()],
        sdYear: startDate.getFullYear()
    }

    const projectDuration = getProjectDuration()

    const projectData = {
        projectImage,
        projectTitle,
        projectContent,
        projectDate,
        projectDuration,
        projectTech,
        projectDetailDate
    }

    project.push(projectData)

    res.redirect('/')

})

app.get('/project-detail/:projectTitle', function(req, res) {

    let data = project.find(item =>
        item.projectTitle === req.params.projectTitle

    )


    res.render('project-detail', { title: "Project Detail", project: data })
})

app.get('/delete-project/:id', function(req, res) {

    let data = req.params.id

    project.splice(data, 1)

    res.redirect('/')

})

app.get('/editproject/:id', function(req, res) {

    let data = req.params.id

    let edit = project[data]

    res.render('editproject', { id: data, title: 'Edit Project', editForm: edit })
})

app.post('/editproject/:id', function(req, res) {

    const projectImage = req.body.editImage;
    const projectTitle = req.body.projectTitle;
    const projectContent = req.body.projectContent;

    const projectDate = {
        startDate: req.body.projectStartDate,
        endDate: req.body.projectEndDate
    }
    const projectTech = {
        checkHtml: req.body.checkHtml,
        checkNode: req.body.checkNode,
        checkCss: req.body.checkCss,
        checkReact: req.body.checkReact
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

    let endDate = new Date(projectDate.endDate)
    let startDate = new Date(projectDate.startDate)

    function getProjectDuration(endDate, startDate) {

        endDate = new Date(projectDate.endDate)
        startDate = new Date(projectDate.startDate)

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

    const projectDetailDate = {

        edDate: endDate.getDate(),
        edMonth: month[endDate.getMonth()],
        edYear: endDate.getFullYear(),
        sdDate: startDate.getDate(),
        sdMonth: month[startDate.getMonth()],
        sdYear: startDate.getFullYear()
    }

    const projectDuration = getProjectDuration()

    const projectData = {
        projectImage,
        projectTitle,
        projectContent,
        projectDate,
        projectDuration,
        projectTech,
        projectDetailDate
    }

    let data = req.params.id

    project[data] = {
        ...project[data],
        ...projectData
    };
    res.redirect('/')

})


const port = 8080
app.listen(port, function() {
    console.log(`Server running on port: ${port}`)
})