import express from 'express';
import hbs from 'hbs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const app = express()

const __filename = fileURLToPath(
    import.meta.url
);

const apActive = true;
const homeActive = true;

const __dirname = dirname(__filename);

hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.use('/public', express.static(__dirname + '/Public'))

app.use(express.urlencoded({ extended: false }))

app.set('view engine', 'hbs')

app.get('/', function(req, res) {

    res.render('index', {
        title: "Home",
        homeActive: true,
        active: "active"
    })
})

app.get('/contact', function(req, res) {
    res.render('contact')
})

app.post('/contact', function(req, res) {

    const contact = req.body;

    console.log(JSON.stringify(contact, null, 2))

    res.redirect('/')

})

app.get('/addproject', function(req, res) {

    res.render('addproject', { title: "Add Project", apActive: true, active: "active" })
})

app.post('/addproject', function(req, res) {

    const project = req.body;

    console.log(JSON.stringify(project, null, 2));

    res.redirect('/')

})


app.get('/project-detail', function(req, res) {
    res.render('project-detail', { title: "Project Detail" })
})


const port = 8080
app.listen(port, function() {
    console.log(`Server running on port: ${port}`)
})