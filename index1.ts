<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Startup Tourisme Tunisie - VR/AR Simulateur + Dialogue</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 700px; margin: auto; padding: 1em; }
    h1 { text-align: center; }
    section { margin-bottom: 2em; padding: 1em; border: 1px solid #ccc; border-radius: 6px; }
    #result { margin-top: 1em; font-weight: bold; }
    #chat p { margin: 0.3em 0; }
    button { margin: 0.2em; padding: 0.4em 0.8em; cursor: pointer; }
    button:hover { background: #eee; }
  </style>
</head>
<body>

  <h1>Tourisme Tunisie - Reconnaissance Image & Dialogue Interactif</h1>

  <section>
    <h2>1. Reconnaissance d'objets (Upload image)</h2>
    <input type="file" accept="image/*" id="imageUpload" />
    <div id="imagePreview" style="margin-top:10px;"></div>
    <p id="result">Choisissez une image pour détecter un objet.</p>
  </section>

  <section>
    <h2>2. Conversation interactive - Au restaurant</h2>
    <div id="chat">
      <p id="bot">Bienvenue au restaurant. Que voulez-vous commander ?</p>
      <button onclick="userReply('couscous')">Couscous</button>
      <button onclick="userReply('pizza')">Pizza</button>
    </div>
  </section>

  <!-- TensorFlow.js et MobileNet -->
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.2.0"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0"></script>

  <script>
    // Partie reconnaissance d'images
    let net;
    async function loadModel() {
      net = await mobilenet.load();
      console.log("MobileNet chargé");
    }
    loadModel();

    const dictionary = {
      'banana': 'mooz',
      'apple': 'tfa7',
      'car': 'tomobil',
      'pizza': 'pizza',
      'cat': 'bessa',
      'dog': 'klab',
      'couch': 'kanaba',
      'bottle': 'qar3a',
      'chair': 'kursi',
      'book': 'ktib',
      'clock': 'saa',
      'cup': 'finjan',
      'keyboard': 'clavier',
      'mouse': 'fared',
      'person': 'insan',
      // Ajoute d’autres mots ici selon besoins
    };

    const imageUpload = document.getElementById('imageUpload');
    const resultP = document.getElementById('result');
    const imagePreviewDiv = document.getElementById('imagePreview');

    imageUpload.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Afficher image uploadée
      const img = new Image();
      img.style.maxWidth = '100%';
      img.src = URL.createObjectURL(file);

      // Nettoyer et afficher
      imagePreviewDiv.innerHTML = '';
      imagePreviewDiv.appendChild(img);
      resultP.textContent = "Analyse en cours...";

      img.onload = async () => {
        const predictions = await net.classify(img);
        console.log(predictions);
        const top = predictions[0];
        const lowerClass = top.className.toLowerCase();

        // Trouver traduction tunisienne ou message par défaut
        let tunisianWord = 'Mot non reconnu';
        // On essaie une correspondance partielle (ex: "banana" dans "banana", ou "banana" dans "banana split")
        for(const engWord in dictionary) {
          if(lowerClass.includes(engWord)) {
            tunisianWord = dictionary[engWord];
            break;
          }
        }

        resultP.innerHTML = `Objet détecté: <b>${top.className}</b> <br>En tunisien: <b>${tunisianWord}</b> <br>Confiance: ${(top.probability * 100).toFixed(2)}%`;
      };
    });

    // Partie conversation interactive
    const chatDiv = document.getElementById('chat');

    function userReply(choice) {
      // Supprimer boutons précédents
      const buttons = chatDiv.querySelectorAll('button');
      buttons.forEach(b => b.remove());

      const userMsg = document.createElement('p');
      userMsg.style.fontWeight = 'normal';
      userMsg.textContent = `Vous: ${choice}`;
      chatDiv.appendChild(userMsg);

      const botMsg = document.createElement('p');
      botMsg.style.fontWeight = 'bold';

      if(choice === 'couscous') {
        botMsg.textContent = "Très bon choix ! Souhaitez-vous du poulet ou de la viande ?";
        chatDiv.appendChild(botMsg);

        addButton('Poulet', () => followUp('poulet'));
        addButton('Viande', () => followUp('viande'));

      } else if(choice === 'pizza') {
        botMsg.textContent = "Pizza délicieuse ! Voulez-vous ajouter des olives ?";
        chatDiv.appendChild(botMsg);

        addButton('Oui', () => followUp('oui_olives'));
        addButton('Non', () => followUp('non_olives'));
      }
    }

    function followUp(answer) {
      // Supprimer boutons précédents
      const buttons = chatDiv.querySelectorAll('button');
      buttons.forEach(b => b.remove());

      const userMsg = document.createElement('p');
      userMsg.style.fontWeight = 'normal';
      userMsg.textContent = `Vous: ${answer}`;
      chatDiv.appendChild(userMsg);

      const botMsg = document.createElement('p');
      botMsg.style.fontWeight = 'bold';

      if(answer === 'poulet') {
        botMsg.textContent = "Très bien, votre couscous avec poulet arrive !";
      } else if(answer === 'viande') {
        botMsg.textContent = "Excellent, couscous avec viande sera servi bientôt.";
      } else if(answer === 'oui_olives') {
        botMsg.textContent = "Olives ajoutées à votre pizza. Bon appétit !";
      } else if(answer === 'non_olives') {
        botMsg.textContent = "Pizza sans olives. Bon appétit !";
      }
      chatDiv.appendChild(botMsg);

      // Proposer de recommencer
      addButton('Recommencer', resetChat);
    }

    function addButton(text, onClick) {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.onclick = onClick;
      chatDiv.appendChild(btn);
    }

    function resetChat() {
      chatDiv.innerHTML = `<p id="bot">Bienvenue au restaurant. Que voulez-vous commander ?</p>
        <button onclick="userReply('couscous')">Couscous</button>
        <button onclick="userReply('pizza')">Pizza</button>`;
    }
  </script>

</body>
</html>
