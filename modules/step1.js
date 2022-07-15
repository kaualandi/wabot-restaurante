const { setNextStep, getUserByEmail, alterData } = require('../fetch');
const messages = require('./messages');

module.exports = async (client, message) => {
    const { from, body } = message;

    const email = body.toLowerCase().trim();
    const emailRegex = /\S+@\S+\.\S+/;
    const emailValid = emailRegex.test(email);

    if (!emailValid) {
        await client.sendText(from, messages.invalidEmail());
        await setNextStep('s1', from);
        await client.sendText(from, messages.whatIsYourEmail());
        console.log("Mensagem enviada");
    } else {
        const data = await getUserByEmail(email);
        if (data) {
            const { name } = data;
            const firtName = name.split(' ')[0];
            await alterData('name', firtName, from);
            await alterData('email', email, from);
            await client.sendText(from, messages.welcome(name));
            console.log("tentando setar s2");
            await setNextStep('s2', from);
            await client.sendText(from, messages.howCanIHelp());
            console.log("Mensagem enviada");
        } else {
            await client.sendText(from, messages.invalidEmail());
            await setNextStep('s1', from);
            await client.sendText(from, messages.whatIsYourEmail());
            console.log("Mensagem enviada");
        }
    }
}