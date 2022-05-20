import express from 'express';

const app = express()

app.get('/', function(req, res) {
    res.render('hlo')
})

const port = 4040
app.listen(port, function() {
    console.log(`Server running on port: ${port}`)
})