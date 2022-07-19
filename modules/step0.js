const {setNextStep, getUser} = require('../fetch');
const messages = require('./messages');

module.exports = async (client, message) => {
    const { from } = message;

    const stamp = new Date();
    const hours = stamp.getHours();
    let time;
    if (hours >= 18 && hours < 24) {
        time = "boa noite"
    } else if (hours >= 12 && hours < 18) {
        time = "boa tarde"
    } else if (hours >= 0 && hours < 12) {
        time = "bom dia"
    }
    await client.sendText(from, messages.hi(time));
    console.log("Mensagem enviada");
    
    const user = await getUser(from);
    
    console.log(`User: ${user.id}`);

    if(user) {
        const { email, name } = user;
        if (email) {
            await client.sendText(from, messages.welcome(name));
            await setNextStep('s2', from);
            await client.sendText(from, messages.howCanIHelp());
            console.log("Mensagem enviada");
        } else {
            await setNextStep('s2', from);
            await client.sendText(from, messages.howCanIHelp());
            console.log("Mensagem enviada");
        }
    } else {
        await setNextStep('s2', from);
        await client.sendText(from, messages.howCanIHelp());
        console.log("Mensagem enviada");
    }
}