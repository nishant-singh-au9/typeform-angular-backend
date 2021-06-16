const express = require('express')
const cors = require('cors')
const port =  3000
const fetch = require('node-fetch');
const mongodb = require('mongodb');
const { response } = require('express');
const MongoClient = mongodb.MongoClient
const mongourl = "mongodb://localhost:27017"
let db;
const token = "82YGDVt7JhFoePakwK9oHfz37vteDJMerU5dDjG5JTjR"

const app = express()
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
    console.log("req")
    return res.send({message: 'Server is running fine'})
})

app.post('/forms', (req, res) => {
    const pollObj = req.body
    console.log(pollObj)
    fetch('https://api.typeform.com/forms', {method: 'POST', 
    headers: {
    'Authorization': "Bearer " + token,
    "Accept": "application/json",
    "Content-Type": "application/json"
    },
    body: JSON.stringify(pollObj),
     })
    .then(res => res.json())
    .then(data => {
        return res.send({formid: data.id})
    })
    .catch(err => console.log('error is occurred', err))
})

app.post('/response', (req, res) => {
    const formid = req.body.formid
    console.log(formid)
    db.collection('responses').find({form_id:formid}).toArray((err, response) =>{
        if(err || !response) return res.send({error: "invalid form id"})
        return res.send(response)
    })
})


app.post('/webResponse', (req, res) => {
    console.log("webhook response>>", req.body)
    const response = {
        form_id: req.body.form_response.form_id,
        form_response: req.body.form_response
    }
    db.collection('responses').insertOne(response, (err, succ) => {
        if(err) throw err
        console.log('response added')
        return res.send(req.body)
    })
})

MongoClient.connect(mongourl, { useUnifiedTopology: true },(err, connnection) => {
    if(err) throw err
    db = connnection.db('typeformResponses')
})


app.listen(port, (err) => {
    if(err) throw err
    console.log(`server is running on port ${port}`)
})