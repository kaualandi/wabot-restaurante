const axios = require("axios");
const { steps } = require("./steps");
require('dotenv').config();

const baseUrlBotInfors = process.env.BASEURL_BOTINFORS

// (async function () {
//     const feedback = await steps["s2"]('5521999222644@c.us', '2');
//     console.log(feedback);
// })()


function setNextStep(nextStep, id) {
    console.log('nextStep', nextStep);
    axios.patch(`${baseUrlBotInfors}/users/${id}`, {
        nextMassage: nextStep
    }).then((res) => {
        console.log('new nextStep saved');
    }).catch((err) => {
        console.log(err);
    });
}

async function start(client, message, data) {
    console.log('start function');
    const { nextMassage, selected_plan, selected_payment_method, last_payment_method, credits, name } = data;
    
    const { body, id, chat, from } = message;
    
    console.log('nextMassage', nextMassage);
    if (nextMassage === "") {
        const feedback = await steps["s0"]();
        const menssages = feedback.menssages;
        console.log("MENSSAGES	===>", menssages);
        menssages.forEach(async (menssage) => {
            await client.sendText(from, menssage);
            console.log("mensagem enviada");
        });
        setNextStep(feedback.next, chat.id);
    } else {
        const feedback = await steps[nextMassage](chat.id, body);
        const menssages = feedback.menssages;
        console.log("MENSSAGES	===>", menssages);
        menssages.forEach(async (menssage) => {
            await client.sendText(from, menssage);
            console.log("mensagem enviada");
        });
        setNextStep(feedback.next, chat.id);
    }
}

async function signup(client, message) {
    const { id, from, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg } = message;

    axios.post(`${baseUrlBotInfors}/users`, {
        id: chat.id,
        userId: null,
        nextMassage: "",
        selected_plan: null,
        name: '',
        from: from,
    }).then(function (response) {
        const { data } = response;
        console.log(data);
        console.log("CADASTRO REALIZADO");
        start(client, message, data);
    }).catch(function (error) {
        console.log(error);
    });
}

const actions = {
    start: (client, message, data) => start(client, message, data),
    signup: (client, message) => signup(client, message),
}

module.exports = actions;