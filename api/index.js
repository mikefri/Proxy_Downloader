// /api/index.js - Version finale sans Express

const fetch = require('node-fetch');
const path = require('path');
const { URL } = require('url');

// Ceci est une fonction serverless Vercel native
module.exports = async (req, res) => {
    // On récupère les paramètres directement depuis l'objet `req`
    const { url, title } = req.query;

    if (!url) {
        return res.status(400).send('Erreur : Le paramètre "url" est manquant.');
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Le serveur distant a répondu avec une erreur : ${response.status} ${response.statusText}`);
        }

        const originalFilename = path.basename(new URL(url).pathname);
        const extension = path.extname(originalFilename);
        
        const finalFilename = title ? `${title.replace(/[\/\\?%*:|"<>]/g, '-')}${extension}` : originalFilename;

        // On configure les en-têtes de la réponse
        res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`);
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
        
        // On envoie le fichier au client
        response.body.pipe(res);

    } catch (error) {
        console.error('Erreur du proxy Vercel:', error.message);
        res.status(500).send(`Échec du proxy : ${error.message}`);
    }
};