// /api/index.js - Proxy pour Vercel

const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const { URL } = require('url');

const app = express();

app.get('/', async (req, res) => {
    const fileUrl = req.query.url;
    const title = req.query.title;

    if (!fileUrl) {
        return res.status(400).send('Erreur : Le paramètre "url" est manquant.');
    }

    try {
        const response = await fetch(fileUrl);

        if (!response.ok) {
            throw new Error(`Le serveur distant a répondu avec une erreur : ${response.status} ${response.statusText}`);
        }

        const originalFilename = path.basename(new URL(fileUrl).pathname);
        const extension = path.extname(originalFilename);
        
        const finalFilename = title ? `${title.replace(/[\/\\?%*:|"<>]/g, '-')}${extension}` : originalFilename;

        res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`);
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
        
        response.body.pipe(res);

    } catch (error) {
        console.error('Erreur du proxy Vercel:', error.message);
        res.status(500).send(`Échec du proxy : ${error.message}`);
    }
});

module.exports = app;