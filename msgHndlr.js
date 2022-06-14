const actions = require("./actions.js");
const axios = require("axios");
require('dotenv').config();

const baseUrlBotInfors = process.env.BASEURL_BOTINFORS

module.exports = msgHandler = async (client, message) => {
    try {
        const { id, from, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg } = message;
        let { body } = message;
        const { formattedTitle } = chat;
        let { pushname, verifiedName } = sender;
        pushname = pushname || verifiedName;
        const commands = caption || body || "";
        const falas = commands.toLowerCase();
        const command = commands.toLowerCase().split(" ")[0] || "";
        const args = commands.split(" ");

        const msgs = (message) => {
            if (command.startsWith("/")) {
                if (message.length >= 10) {
                    return `${message.substr(0, 15)}`;
                } else {
                    return `${message}`;
                }
            }
        };

        console.log("---------------------------------------");
        if (isGroupMsg) {
            return console.log("MENSSAGE GROUP. IGNORING");
        }

        console.log("FROM 	===>", pushname);
        console.log("FROM_ID 	===>", chat.id);
        console.log("ARGUMENTOS	===>", args);
        console.log("BODY	===>", body);


        axios.get(`${baseUrlBotInfors}/users/${chat.id}`).then((res) => {
            const { data } = res;
            console.log("USUÁRIO JÁ CADASTRADO");
            actions.start(client, message, data);
        }).catch((err) => {
            if (err?.response?.status === 404) {
                console.log("USUÁRIO NÃO CADASTRADO");
                actions.signup(client, message);
            } else {
                console.log(err);
                client.sendText(from, "Algo não se saiu bem, não consegui recuperar suas informações.\n", err);
            }
        });

    } catch (err) {
        console.log(("[ERROR]", "red"), err);
    }
};
