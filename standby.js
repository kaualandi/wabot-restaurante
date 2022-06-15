const client = require('./app')

exports.sendText = async function sendText(from, messages) {
    messages.forEach(async (message) => {
        await client.client.sendText(from, message);
        console.log("mensagem enviada");
    });
}