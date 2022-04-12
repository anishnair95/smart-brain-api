/*Server for smart brain app*/

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const port = 3000;
const app = express();
const controller=require('./controllers/register')
const Clarifai = require('clarifai');

const clarifaiApp = new Clarifai.App({
    apiKey: 'd723c9a09000425b9fd0e16c885c8871'
  });
  
// console.log(Clarifai);

const db = knex({
    client: 'pg',
    connection: {
        connectionString:process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
          }

    }
});



app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {

    /*db.select("*").from("users")
    .then(users=>res.json(users))
    .catch(err=>res.status(400).json("Error occurred!"))*/
    res.send('It is working');
})



//signin API
app.post("/signin", (req,res)=>{controller.handleSignIn(req,res,db,bcrypt)})

//register API
app.post('/register',(req,res)=>{controller.handleRegister(req,res,db,bcrypt)})

//get profile API
app.get('/profile/:id', (req,res)=>{controller.handleProfileGet(req,res,db)})

//update entries API
app.put('/image', (req,res)=>{controller.handleImage(req,res,db)})

//face recognition API
app.post('/imageUrl',(req,res)=>{controller.handleApiCall(req,res,clarifaiApp)})

app.listen(process.env.PORT || 3000, () => {

    console.log(`Server listening at port:http://localhost:${process.env.PORT}/`);
})




/*
/res = this is working
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user using id
/image --> PUT --> adding for existing user
*/