const express = require("express")
const app = express()
const morgan = require('morgan')
app.use(express.json())

const cors = require('cors');
app.use(cors());
app.use(express.static('dist'));

morgan.token("body", (request) => {
        return request.method === "POST" ? '\"name\"' + ':' +JSON.stringify(request.body.name) 
        + ', ' + '\"number\"' + ':' +JSON.stringify(request.body.number) : "";
});

// morgan.token("body", (req) => {
//     return req.method === "POST" ? JSON.stringify(req.body) : "";
// });

//app.use(morgan('tiny'), morgan(':body'));
//morgan.token('type', fapp.use(express.static('dist'));unction (req, res) { return req.headers['content-type'] })

const requestLogger = (request, response, next) => {
    console.log('Method: ',request.method);
    console.log('Path: ',request.path);
    console.log('Body: ',request.body);
    console.log('------------------------------');
    next();
}

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.use(requestLogger)

let persons = [
    {
      id: 1,
      name: "Arto Hellas",
      number: "040-123456"
    },
    {
      id: 2,
      name: "Ada Lovelace",
      number: "39-44-5323523"
    },
    {
      id: 3,
      name: "Dan Abramov",
      number: "12-43-234345"
    },
    {
      id: 4,
      name: "Mary Poppendieck",
      number: "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
    let date = new Date();
    response.send(`<h3>Phonebook has info for ${persons.length} people</h3>
        <p>${date}</p>
        `)
})

app.get('/api/persons', (request, response) => {
    response.json(persons);
})

app.get('/api/persons/:id', (request, response) => {
    const id = parseInt(request.params.id) //== Number(request.params.id)
    const person = persons.find( x => x.id === id);
    if(person){
        response.json(person);
    }
    else{
        response.status(404).end()
    }
})

app.post('/api/persons/', (request,response) => {
    const body = request.body;
    if(!body.content){

        if(!body.number){
        response.status(400).json({error: 'number is missing'})
        } else if(!body.name){
        response.status(400).json({error: 'name is missing'})
        }

        if(!persons.some( x => x.name === body.name)){
            const person = request.body
            
            app.use(morgan('tiny' + `${JSON.stringify(person)}`))

            let idAleatoria = Math.floor(1+Math.random() * 9999);

            person.id = persons.some(x => x.id === idAleatoria) ? Math.floor(1+Math.random()* 9999) :
            idAleatoria; //Intento de evitar duplicidad de Ids
            persons = persons.concat(person);
            response.json(person)
        } else {
            response.status(400).json({error: 'name must be unique'})
        }
    } else {
        response.status(400).json({error: 'content is missing'})
    }
})

app.delete('/api/persons/:id', (request, response) =>{
    
    const id = parseInt(request.params.id)
    persons = persons.filter(x => x.id !== id) //Simulando el borrado
    response.status(204).end();
})

const badPath = (request, response, next) => {
    response.status(404).send({error: 'Ruta desconocida'})
}

app.use(morgan('tiny'));
app.use(badPath)

const PORT = 3001;

app.listen(PORT, () =>{
    console.log(`Server Running in port ${PORT}`);
})

