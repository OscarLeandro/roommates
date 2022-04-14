const express = require('express');
const fs = require('fs').promises;
const app = express();
const {obtenerUsuario, guardarRoommates} = require('./roommates.js');
const {v4: uuidv4} = require('uuid');
const send = require('./correo.js');

app.listen(3000, console.log('Activo http://localhost:3000'))

app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/views/index.html`)
})

app.post('/roommate', async(req,res) => {

    try {
        const usuario = await obtenerUsuario()
        await guardarRoommates(usuario)
        
        res.send(usuario)
    } catch (error) {
        res.status(500).send(error)
    }
})


// app.get('/roommates', (req, res)=>{

//      res.sendFile(`${__dirname}/data/roommates.json`)
        
// })

app.get('/roommates', async (req, res)=>{
    res.setHeader('content-type', 'application/json');

    try {

        let {gastos} = JSON.parse(await fs.readFile(`${__dirname}/data/gastos.json`));
        let {roommates} = JSON.parse(await fs.readFile(`${__dirname}/data/roommates.json`));
        let numeroGastos = gastos.length,
            numeroRoommates = roommates.length,
            roommateGasto = 0,
            roommateGastoTotal = 0;

        if(numeroGastos > 0){
            
            gastos.forEach((gasto, indice)=>{

                roommateGasto = Math.round(gasto.monto/numeroRoommates);
                //console.log(roommateGasto,indice)

                roommates.forEach(roommate =>{
                    indice == 0 ? roommate.recibe = 0 : roommate.recibe = 0;

                    if(gasto.roommate == roommate.nombre){
                        roommate.recibe += roommateGasto;
                        //console.log('roomamte recibe: ', roommate.recibe)
                    }
                });
                roommateGastoTotal += roommateGasto;
                //console.log('El gasto total es: '+ roommateGastoTotal)
            
            });
            roommates.forEach(roommate => {
                roommate.debe = 0;
                roommate.debe = Math.round(roommateGastoTotal - roommate.recibe);
            });

        }else{
            roommates.forEach(roommate => {
                roommate.debe = 0;
                roommate.recibe = 0;
            });
        };

        await fs.writeFile(`${__dirname}/data/roommates.json`, JSON.stringify({roommates},null, 4), 'utf8');
        await fs.writeFile(`${__dirname}/data/gastos.json`, JSON.stringify({gastos},null, 4), 'utf8');

        res.status(201).sendFile(`${__dirname}/data/roommates.json`);
        
    } catch (error) {
        res.status(500).send(error);
        
    }

})


app.post('/gasto', async (req, res)=>{ 
    res.setHeader('content-type', 'application/json');
    try {
        let {roommate, descripcion, monto} = req.body
        let id = uuidv4().slice(0,8)
        let gastos = {id, roommate, descripcion, monto}
        let contenido = JSON.parse(await fs.readFile(`${__dirname}/data/gastos.json`,"utf8"));
        
        contenido.gastos.push(gastos);
        contenido = JSON.stringify(contenido, null, 4);
        
        await fs.writeFile(`${__dirname}/data/gastos.json`, contenido, 'utf8')
        res.send('respuesta')

    } catch (error) {
        res.status(500).send(error);
    }
    
    
})
app.get('/gastos', async (req, res) => {
    try {
        let {roommates} = JSON.parse(await fs.readFile(`${__dirname}/data/roommates.json`));
        const correos = roommates.map((roommate)=>roommate.correo);
        
        //console.log(roommates, correos)
        await send(roommates, correos)
        //res.json(roommates)
        res.sendFile(`${__dirname}/data/gastos.json`)
    } catch (error) {
        res.status(500).send(error);
    }

    

})

app.put('/gasto', async(req, res) => {
    res.setHeader('content-type', 'application/json');
    try {
        let id = req.query.id
        let {roommate, descripcion, monto} = req.body
        let contenido = JSON.parse(await fs.readFile(`${__dirname}/data/gastos.json`,"utf8"));


        contenido.gastos.map( gasto =>{
            if(gasto.id == id){
                gasto.roommate = roommate;
                gasto.descripcion = descripcion;
                gasto.monto = monto;
                
            }
            return gasto;
        })
        contenido = JSON.stringify(contenido, null, 4);
        await fs.writeFile(`${__dirname}/data/gastos.json`, contenido, 'utf8')
        res.send('Gastos actualizados exitosamente')
    } catch (error) {
        res.status(500).send(error);
    }
    
    
})


app.delete('/gasto', async (req,res) =>{
    res.setHeader('content-type', 'application/json');
    
    try {
        let id = req.query.id;
        let contenido = JSON.parse(await fs.readFile(`${__dirname}/data/gastos.json`))
        let gastosActualizados = contenido.gastos.findIndex(gasto => gasto.id == id);
        //console.log(gastosActualizados)
        contenido.gastos.splice(gastosActualizados,1);
        contenido = JSON.stringify(contenido,null, 4)
        await fs.writeFile(`${__dirname}/data/gastos.json`, contenido, 'utf8')
        res.send(contenido)
    } catch (error) {
        res.status(500).send(error);

    }
    
    

})

