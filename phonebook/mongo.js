const mongoose = require('mongoose')

function displayAll() {
    Number.find({}, (err, arr) => {
        if (err) {
            console.log(err);
        } else {
            console.log(arr);
        }
    })
    .then(() =>  mongoose.connection.close())
}

const addNumber = () => { 
    const number = new Number({
        name: process.argv[3],
        number: process.argv[4]
    })
    
    number.save().then(result => {
        console.log(`Added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
        mongoose.connection.close()
    })
}

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}
  
const password = process.argv[2]

const url =
`mongodb+srv://new-user:${password}@cluster0.chc9u.mongodb.net/test?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

const numberSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Number = mongoose.model('Number', numberSchema)

if(process.argv.length === 3) {
    displayAll()
}

else {
    addNumber()
}