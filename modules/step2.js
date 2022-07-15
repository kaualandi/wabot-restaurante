const path = require('path');
const { setNextStep, getCartList } = require('../fetch');
const messages = require('./messages');

const options = {
    1: async (client, message) => {
        const { from } = message;
        const menu = path.resolve(__dirname, '../media/menu.pdf');
        await client.sendFile(from, menu, "menu.pdf", "Cardápio");
        await setNextStep('s2', from);
        await client.sendText(from, messages.howCanIHelp());
        console.log("Mensagem enviada");
    },
    2: async (client, message) => {
        const { from } = message;
        await setNextStep('s3', from);
        await client.sendText(from, messages.whatIsproductId());
        console.log("Mensagem enviada");
    },
    3: async (client, message) => {
        const { from } = message;
        const cart = await getCartList(from);
        await client.sendText(from, cart);
        await setNextStep('s2', from);
        await client.sendText(from, messages.howCanIHelp());
        console.log("Mensagem enviada");
    },
    4: async (client, message) => {
        const { from } = message;
        await setNextStep('s1', from);
        await client.sendText(from, messages.whatIsYourEmail());
        console.log("Mensagem enviada");
    },
    5: async (client, message) => {
        const { from } = message;
        await client.sendText(from, `Em desenvolvimento.`);
        await setNextStep('s2', from);
        await client.sendText(from, messages.howCanIHelp());
    },
    6: async (client, message) => {
        const { from } = message;
        await setNextStep('s0', from);
        await client.sendText(from, messages.clt());
    }
}

module.exports = async (client, message) => {
    const { from, body } = message;

    if (options[body]) {
        await options[body](client, message);
    } else {
        await client.sendText(from, messages.invalidOption());
        await setNextStep('s2', from);
        await client.sendText(from, messages.howCanIHelp());
    }
}