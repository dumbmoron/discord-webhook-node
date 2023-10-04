const fs = require('fs');

const sendWebhook = (hookURL, payload) => fetch(hookURL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
})

const sendStream = (hookURL, stream, filename, params) => {
    const form = new FormData();

    for (const param of ['username', 'content', 'avatar_url'])
        if (params[param])
            form.append(param, params[param]);

    form.append('files[0]', {
        [Symbol.toStringTag]: 'File',
        name: filename,
        stream: () => stream
    });

    return fetch(hookURL, {
        method: 'POST',
        body: form
    });
}

const sendFile = (hookUrl, file, params = {}) => {
    return sendStream(hookUrl, fs.createReadStream(file), file, params);
}

module.exports = {
    sendFile,
    sendStream,
    sendWebhook
}