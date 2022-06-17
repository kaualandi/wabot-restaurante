const mariadb = require('mariadb');
require('dotenv').config();
const axios = require("axios");
const qs = require('qs');

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 5
});

const baseUrlBotInfors = process.env.BASEURL_BOTINFORS
const baseUrlServer = process.env.BASEURL_SERVER

// async function getUserByEmail(email) {
exports.getUserByEmail = async function getUserByEmail(email) {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    await conn.end();
    return rows[0];
}

// async function setWppById(id, number) {
exports.setWppById = async function setWppById(id, number) {
    const conn = await pool.getConnection();
    const rows = await conn.query('UPDATE users SET id_whatsapp = ? WHERE id = ?', [number, id]);
    await conn.end();
    return rows;
}

exports.alterData = async function alterData(key, value, id) {
    return axios.patch(`${baseUrlBotInfors}/users/${id}`, {
        [key]: value.toString()
    }).then((res) => {
        console.log(`data saved: ${key} -> ${value}`);
    }
    ).catch((err) => {
        console.log(`error: ${err}`);
        return {
            error: true,
            message: {
                code: err.response?.status || err,
                text: err.response?.statusText || ''
            }
        }
    });
}

// async function getBotData(chatId, key) {
exports.getBotData = async function getBotData(chatId, key) {
    return axios.get(`${baseUrlBotInfors}/users/${chatId}`).then((res) => {
        const { data } = res;
        return data[key];
    }).catch((err) => {
        return {
            error: true,
            message: {
                code: err.response?.status || err,
                text: err.response?.statusText || ''
            }
        }
    });
}

async function _getPlans() {
    return axios.get(`${baseUrlServer}/plans.php`).then((res) => {
        const { data } = res;
        return data;
    }).catch((err) => {
        return {
            error: true,
            message: {
                code: err.response?.status || err,
                text: err.response?.statusText || ''
            }
        }
    });
}

exports.getPlans = async function getPlans() {
    const plans = await _getPlans();
    return plans;
}

exports.getListPlans = async function getListPlans() {
    const plans = await _getPlans();
    if (plans.error) {
        return plans
    } else {
        let textToSend = '';
        plans.forEach((plan) => {
            textToSend += `*${plan.id}*: ${plan.name}\n`;
        });
        return textToSend;
    }
}

// async function getPaymentLink(userId, planId, type) {
exports.getPaymentLink = async function getPaymentLink(userId, planId, type) {
    const data = qs.stringify({
        'userId': userId,
        'planId': planId,
        'type': type
    });
    var config = {
        method: 'post',
        url: `${baseUrlServer}/payment-url.php`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };

    return axios(config)
        .then(function (response) {
            // return JSON.stringify(response.data);
            return response.data;
        })
        .catch(function (err) {
            return {
                error: true,
                message: {
                    code: err.response?.status || err,
                    text: err.response?.statusText || ''
                }
            }
        });
}

// async function premiumStatus(userId) {
exports.premiumStatus = async function premiumStatus(userId) {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT premuim, expired_in, start_at FROM users WHERE id = ?', [userId]);
    await conn.end();
    return rows[0];
}

// ;(async () => {
//     const myGetUserByEmail = await getUserByEmail('luannbr004@gmail.com');
//     console.log(myGetUserByEmail);
// })();