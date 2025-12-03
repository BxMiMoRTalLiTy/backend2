require('dotenv').config();
const express = require("express")
const app = express()
const morgan = require('morgan')
app.use(express.json())

const cors = require('cors');
app.use(cors());
app.use(express.static('dist'));

const Person = require('./models/person');

morgan.token("body", (request) => {
        return request.method === "POST" ? '\"name\"' + ':' +JSON.stringify(request.body.name) 
        + ', ' + '\"number\"' + ':' +JSON.stringify(request.body.number) : "";
});

const requestLogger = (request, response, next) => {
    console.log('Method: ',request.method);
    console.log('Path: ',request.path);
    console.log('Body: ',request.body);
    console.log('------------------------------');
    next();
}

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.use(requestLogger)

// let persons = [
//     {
//       id: 1,
//       name: "Arto Hellas",
//       number: "040-123456"
//     },
//     {
//       id: 2,
//       name: "Ada Lovelace",
//       number: "39-44-5323523"
//     },
//     {
//       id: 3,
//       name: "Dan Abramov",
//       number: "12-43-234345"
//     },
//     {
//       id: 4,
//       name: "Mary Poppendieck",
//       number: "39-23-6423122"
//     }
// ]

app.get('/info', (request, response) => {
    let date = new Date();
    response.send(`<h3>Phonebook has info for ${persons.length} people</h3>
        <p>${date}</p>
        `)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons);
    });
})

app.get('/api/persons/:id', (request, response,next) => {
    Person.findById(request.params.id)
    .then(person => {
        if(person) {
            response.json(person);
        }
        else{
            response.status(404).end();
        }
    })
    .catch(error =>next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body;

    if(!body.name) {
        return response.status(400).json({ error: 'name is missing' });
    }

    if(!body.number) {
        return response.status(400).json({ error: 'number is missing' });
    }
    Person.findOne({ name: body.name })
        .then(existing => {
            if (existing) {
                return response.status(400).json({ error: 'name must be unique' });
            }

            const person = new Person({
                name: body.name,
                number: body.number
            });

            person
                .save()
                .then(saved => response.json(saved))
                .catch(error => next(error));
        })
        .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) =>{
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end();
    })
    .catch(error => next(error));
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body;

    Person.findByIdAndUpdate(
        request.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
    .then(updated => response.json(updated))
    .catch(error => next(error));
});

const badPath = (request, response, next) => {
    response.status(404).send({error: 'Ruta desconocida'})
}

app.use(morgan('tiny'));
app.use(badPath)

const errorHandle = (error, request, response, next) =>{
    console.log("ERROR: ",error.message);
    if(error.name === "CastError"){
        return response.status(400).send({error: 'id not found'});
    }
}

app.use(errorHandle);

const PORT = process.env.PORT;

app.listen(PORT, () =>{
    console.log(`Server Running in port ${PORT}`);
})

