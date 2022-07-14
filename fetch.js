require('dotenv').config();
const axios = require("axios");

const baseUrlBotInfors = process.env.BASEURL_BOTINFORS

exports.getUserByEmail = async (id) => {
    return axios.get(`${baseUrlBotInfors}/email/${id}`).then((res) => {
        return res.data;
    }).catch((err) => {
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

exports.getUser = async (id) => {
    return axios.get(`${baseUrlBotInfors}/users/${id}`).then((res) => {
        return res.data;
    }).catch(async (err) => {
        if (err.response?.status === 404) {
            const user = {
                id: id,
                step: 's0',
                name: null,
                email: null
            }
            return await axios.post(`${baseUrlBotInfors}/users/`, user).then((res) => {
                console.log(`Usuário cadastrado!!!!!\n${res.data}`);
                return res.data;
            }).catch((err) => {
                console.log(`error: ${err}`);
                return {
                    error: true,
                    message: {
                        code: err.response?.status || err,
                        text: err.response?.statusText || ''
                    }
                }
            });

        } else {
            console.log(`error: ${err}`);
            return {
                error: true,
                message: {
                    code: err.response?.status || err,
                    text: err.response?.statusText || ''
                }
            }
        }
    });
}

exports.setNextStep = async (step, id) => {
    return axios.patch(`${baseUrlBotInfors}/users/${id}`, { step: step }).then((res) => {
        console.log(`data saved: step -> ${step}`);
        return true;
    }).catch((err) => {
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

exports.alterData = async (key, value, id) => {
    return axios.patch(`${baseUrlBotInfors}/users/${id}`, {
        [key]: value.toString()
    }).then((res) => {
        console.log(`data saved: ${key} -> ${value}`);
    }).catch((err) => {
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

exports.getCart = async function (id) {
    return axios.get(`${baseUrlBotInfors}/cart/${id}`).then((res) => {
        return res.data;
    }).catch((err) => {
        if (err.response?.status === 404) {
            return []; // cart is empty
        } else {
            console.log(`error: ${err}`);
            return {
                error: true,
                message: {
                    code: err.response?.status || err,
                    text: err.response?.statusText || ''
                }
            }
        }
    });
}

exports.getCartList = async function (id) {
    const cart = await this.getCart(id);

    if (cart.length > 0) {

        const listItens = cart.map(async (item) => {
            const productName = await this.getProductName(item.id);
            const productPrice = await this.getProductPrice(item.id, item.quantity)
            return `(${item.id}) ${productName} x${item.quantity}\ncada: ${productPrice[0]} - sub:${productPrice[1]}`
        }).join('\n\n')

        const totalPrice = cart.reduce(async (acc, item) => {
            const subTotalPrice = await this.getProductPrice(item.id, item.quantity)[1];
            acc + subTotalPrice;
        })

        return `Você possue ${cart.length} itens.\n${listItens}\n\nTotal: ${totalPrice}`;
    } else {
        return `Seu carrinho está vazio.`;
    }
}

exports.getProduct = async (id) => {
    return axios.get(`${baseUrlBotInfors}/products/${id}`).then((res) => {
        return res.data;
    }).catch((err) => {
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

exports.getProductName = async (id) => {
    return await this.getProduct(id).name;
}

exports.getProductPrice = async (id) => {
    return await this.getProduct(id).price;
}