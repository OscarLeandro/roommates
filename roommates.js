const axios = require('axios');
const {v4: uuidv4} = require('uuid');
const fs = require('fs').promises;


const obtenerUsuario = async () => {
    const {data} = await axios.get('https://randomuser.me/api')
    const usuario = data.results[0]
    
    
    
    const user = {
        id: uuidv4().slice(0,8),
        nombre: `${usuario.name.title} ${usuario.name.first} ${usuario.name.last}`,
        correo: usuario.email
    }
    
    return user;
}

const guardarRoommates = async (roommate) => {
    const roommateJSON = await fs.readFile(`${__dirname}/data/roommates.json`, 'utf8')
    const {roommates} = JSON.parse(roommateJSON)
    roommates.push(roommate)
    await fs.writeFile(`${__dirname}/data/roommates.json`, JSON.stringify({ roommates }, null, 4), 'utf8')
}


module.exports = { obtenerUsuario, guardarRoommates }