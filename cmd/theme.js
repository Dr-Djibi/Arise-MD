const { delay } = require('@whiskeysockets/baileys');

const THEMES = {
    'dragonball': {
        name: 'Dragon Ball',
        videos: [
            'https://files.catbox.moe/56eba9.mp4',
            'https://files.catbox.moe/wuzcns.mp4',
            'https://files.catbox.moe/zcniuw.mp4',
            'https://files.catbox.moe/fk29gi.mp4',
            'https://files.catbox.moe/x4sp7j.mp4',
            'https://files.catbox.moe/bj2kmz.mp4',
            'https://files.catbox.moe/ewf85y.mp4',
            'https://files.catbox.moe/7tdgt1.mp4'
        ]
    },
    'onepiece': {
        name: 'One Piece',
        videos: [
            'https://files.catbox.moe/yp8jzh.mp4',
            'https://files.catbox.moe/4ntjhq.mp4',
            'https://files.catbox.moe/9aaxmi.mp4'
        ]
    },
    'naruto': {
        name: 'Naruto',
        videos: [
            'https://files.catbox.moe/49mvm8.mp4',
            'https://files.catbox.moe/1thr90.mp4',
            'https://files.catbox.moe/53sqzr.mp4',
            'https://files.catbox.moe/20xtn9.mp4'
        ]
    },
    'jujutsukaisen': {
        name: 'Jujutsu Kaisen',
        videos: [
            'https://files.catbox.moe/xu9csg.mp4',
            'https://files.catbox.moe/lxe3eb.mp4',
            'https://files.catbox.moe/hbo6yr.mp4'
        ]
    },
    'bestmovie': {
        name: 'Best Movie',
        videos: [
            'https://files.catbox.moe/l57xkt.mp4',
            'https://files.catbox.moe/hbo6yr.mp4'
        ]
    },
    'mha': {
        name: 'MHA',
        videos: []
    },
    'demonslayer': {
        name: 'Demon Slayer',
        videos: [
            'https://files.catbox.moe/a53bbb.mp4'
        ]
    },
    'bleach': {
        name: 'Bleach',
        videos: []
    },
    'marvel': {
        name: 'Marvel',
        videos: [
            'https://files.catbox.moe/4f7vjk.mp4',
            'https://files.catbox.moe/h60iv1.mp4',
            'https://files.catbox.moe/fyj7ng.mp4',
            'https://files.catbox.moe/k3xioq.mp4',
            'https://files.catbox.moe/yu72i8.mp4',
            'https://files.catbox.moe/j7o2wc.mp4',
            'https://files.catbox.moe/ctzpqy.mp4',
            'https://files.catbox.moe/ail9x2.mp4',
            'https://files.catbox.moe/0xyove.mp4'
        ]
    },
    'sad': {
        name: 'Sad',
        videos: [
            'https://files.catbox.moe/v8zanz.mp4'
        ]
    }
};

function getRandomTheme() {
    const availableThemes = Object.entries(THEMES)
        .filter(([_, theme]) => theme.videos.length > 0);
    
    if (availableThemes.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availableThemes.length);
    return availableThemes[randomIndex];
}

function getRandomVideoFromTheme(themeKey) {
    const theme = THEMES[themeKey];
    if (!theme || theme.videos.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * theme.videos.length);
    return theme.videos[randomIndex];
}

module.exports = {
    name: 'theme',
    aliases: ['thème', 'random', 'vid', 'video'],
    category: 'divertissement',
    react: '🎬',
    description: 'Envoie une vidéo aléatoire d\'un thème anime/film',
    execute: async (sock, msg) => {
        const { key } = msg;
        const PREFIX = process.env.PREFIX || '!';
        
        try {
            // Réaction immédiate
            await sock.sendMessage(key.remoteJid, {
                react: { text: '🎬', key: msg.key }
            });

            // Récupérer l'argument (thème spécifique)
            const args = msg.body.slice(PREFIX.length).trim().split(' ').slice(1);
            const themeArg = args.join('').toLowerCase();

            let selectedTheme = null;
            let videoUrl = null;

            if (themeArg) {
                // Rechercher le thème spécifié
                const matchingThemeKey = Object.keys(THEMES).find(key => 
                    key.includes(themeArg) || THEMES[key].name.toLowerCase().includes(themeArg)
                );

                if (matchingThemeKey) {
                    selectedTheme = [matchingThemeKey, THEMES[matchingThemeKey]];
                    videoUrl = getRandomVideoFromTheme(matchingThemeKey);

                    if (!videoUrl) {
                        await sock.sendMessage(key.remoteJid, {
                            text: `❌ Le thème *${THEMES[matchingThemeKey].name}* n'a pas encore de vidéos!\n\nTape: *${PREFIX}theme* pour afficher les options`,
                            quoted: msg
                        });
                        return;
                    }
                } else {
                    await sock.sendMessage(key.remoteJid, {
                        text: `❌ Thème non trouvé!\n\nThèmes disponibles:\n${Object.entries(THEMES)
                            .filter(([_, t]) => t.videos.length > 0)
                            .map(([_, t]) => `• ${t.name}`)
                            .join('\n')}\n\nUtilise: *${PREFIX}theme nomDuThème*`,
                        quoted: msg
                    });
                    return;
                }
            } else {
                // Thème aléatoire
                const randomData = getRandomTheme();
                if (!randomData) {
                    await sock.sendMessage(key.remoteJid, {
                        text: '❌ Pas de vidéos disponibles pour le moment!',
                        quoted: msg
                    });
                    return;
                }

                selectedTheme = randomData;
                videoUrl = getRandomVideoFromTheme(randomData[0]);
            }

            // Envoyer la vidéo
            const caption = `🎬 *${selectedTheme[1].name}*\n\n_Vidéo aléatoire du thème_`;
            
            await sock.sendMessage(key.remoteJid, {
                video: {
                    url: videoUrl
                },
                caption: caption,
                gifPlayback: false,
                mimetype: 'video/mp4'
            }, { quoted: msg });

        } catch (error) {
            console.error('Erreur dans la commande theme:', error);
            await sock.sendMessage(key.remoteJid, {
                text: '❌ Erreur lors de l\'envoi de la vidéo',
                quoted: msg
            });
        }
    }
};
