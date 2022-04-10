const handleRegister = (req, res, db, bcrypt) => {

    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        //inorder to end function and avoid reading further lines we have to return
        return res.json('Mandatory fields cannot be left blank');
    }
    const hash = bcrypt.hashSync(password);

    // bcrypt.hash(password, null, null, function (err, hash) {
    //     // Store hash in your password DB.
    //     console.log(hash);
    // });

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0].email,
                        name: name,
                        joined: new Date()
                    })
                    .then(user => {
                        return res.status(200).json(user[0]);
                    })
                    .catch(err => res.status(400).json('Unable to register!'));


            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(400).json('Unable to register!'));


}


const handleSignIn = (req, res, db, bcrypt) => {

    const { email, password } = req.body;
    if (!email || !password) {
        //inorder to end function and avoid reading further lines we have to return
        return res.json('Username or Password is incorrect!');
    }
    db.select('email', 'hash').from('login')
        .where('email', '=', email)
        .then(data => {
            if (data.length > 0) {
                const isValid = bcrypt.compareSync(password, data[0].hash);
                if (isValid) {
                    db.select("*").from("users")
                        .where('email', '=', email)
                        .then(user => {
                            res.json(user[0]);
                        })
                        .catch(err => res.status(400).json("Error occurred"));
                }
                else
                    return res.json('Username or Password is incorrect!');
            }
            else
                return res.json("User doesn't exist");
        })
        .catch(err => res.status(400).json("Error occured"))
}


const handleProfileGet = (req, res, db) => {

    const { id } = req.params;

    db.select("*").from("users").where({
        id: id
    })
        .then(user => {
            if (user.length)
                res.json(user[0]);
            else
                res.status(400).json('Error getting user')
        })
        .catch(err => res.status(400).json('Error getting user'));


}

const handleImage = (req, res, db) => {
    const { id } = req.body;


    db('users')
        .where('id', '=', id)
        .increment('entries', 1) //defaut increment is 1 only
        .returning('entries')
        .then(entries => {
            if (entries.length)
                res.json(entries[0].entries);
            else
                res.status(400).json('Error getting user');
        })
        .catch(err => res.status(400).json('Error getting user'));
}


const handleApiCall=(req,res,clarifaiApp)=>{

    const {input}=req.body;

    clarifaiApp.models.predict(Clarifai.FACE_DETECT_MODEL, input)
    .then(response=>res.json(response))
    .catch(err=>res.status(400).json('Error Occurred!'))

}
//export all functions
module.exports = { handleRegister, handleSignIn, handleProfileGet, handleImage,handleApiCall }