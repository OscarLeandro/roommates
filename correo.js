const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cuentaceluoscar@gmail.com',
        pass: 'zxcvbnm,1'
    }
});

const send = async (roommate, correos) => {
    
    console.log(roommate[0].nombre)
    let mailOptions = {
        from: "cuentaceluoscar@gmail.com",
        to: ["cuentaceluoscar@gmail.com"].concat(correos),
        subject: `Nuevo gasto`,
        html: `<h2> Anuncio: El roommate ${roommate[0].nombre} ha realizado un gasto</h2>`,
    }
    await transporter.sendMail(mailOptions);
}
module.exports = send;