import axios from 'axios';

function toJSON(data) {
    const jsonObj = {};
    const fields = Object.getOwnPropertyNames(data);
    for (const field of fields) {
        if (data[field] !== undefined) {
            jsonObj[field] = data[field];
        }
    }
    console.log("jsonObj => " + JSON.stringify(jsonObj, null, 2));
    return jsonObj;
}

export default class DataService {
    static dataUrlPrefix = 'http://localhost:5000/api';

    // Получаем токен из localStorage
    static getToken() {
        return localStorage.getItem('token');
    }

    // Метод для добавления токена в заголовок Authorization
    static getAuthHeader() {
        const token = this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    static async readAll(url, transformer) {
        const response = await axios.get(this.dataUrlPrefix + url, {
            headers: this.getAuthHeader()
        });
        return response.data.$values.map(item => transformer(item));
    }

    static async read(url, transformer) {
        const response = await axios.get(this.dataUrlPrefix + url, {
            headers: this.getAuthHeader()
        });
        return transformer(response.data);
    }

    static async readString(url) {
        const response = await axios.get(this.dataUrlPrefix + url, {
            headers: this.getAuthHeader()
        });
        return response.data;
    }

    static async create(url, data) {
        const response = await axios.post(this.dataUrlPrefix + url, toJSON(data), {
            headers: this.getAuthHeader()
        });
        return response;
    }

    static async update(url, data) {
        await axios.put(this.dataUrlPrefix + url, toJSON(data), {
            headers: this.getAuthHeader()
        });
        return true;
    }

    static async delete(url) {
        await axios.delete(this.dataUrlPrefix + url, {
            headers: this.getAuthHeader()
        });
        return true;
    }
}
