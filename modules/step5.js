const { setNextStep, getProduct, removeLastItemToCart, getCartList } = require('../fetch');
const messages = require('./messages');

const options = {
    1: async (client, message) => {
        const { from } = message;
        await removeLastItemToCart(from);
        await setNextStep('s3', from);
        await client.sendText(from, messages.whatIsproductId());
        console.log("Mensagem enviada");
    },
    2: async (client, message) => {
        const { from } = message;
        const cart = await getCartList(from);
        await client.sendText(from, cart);
        await setNextStep('s5', from);
        await client.sendText(from, messages.whatElse());
        console.log("Mensagem enviada");
    }
}

module.exports = async (client, message) => {
    const { from, body } = message;

    if (options[body]) {
        await options[body](client, message);
    } else {
        await client.sendText(from, messages.invalidOption());
        await setNextStep('s5', from);
        await client.sendText(from, messages.whatElse());
    }
    return;
}