# Carte de visite NFC - Florian Fournier (Flexplore)

Mini-site statique (HTML/CSS/JS) optimisé mobile pour une carte NFC.
Inclut un bouton "Ajouter le contact" qui génère un fichier vCard (.vcf) importable sur iPhone/Android.

## Ce que contient la page
- Appel, WhatsApp, Email, SMS
- Prise de RDV (Calendly)
- Bouton "Ajouter le contact" (fichier .vcf)

## Personnalisation
Tout se modifie dans `main.js` dans l'objet `CONTACT`.

## Lancer en local
Option 1 : ouvrir `index.html` dans le navigateur.

Option 2 (recommandé) :
- `npx serve .`
ou
- `npx http-server .`

## Déploiement sur GitHub Pages (gratuit)
1. Crée un repo GitHub (ex: `carte-nfc`)
2. Push le code (commandes ci-dessous)
3. Sur GitHub : Settings → Pages → Source = GitHub Actions
4. Le workflow publie automatiquement le site

URL finale :
- `https://TON_USER.github.io/carte-nfc/`

## Commandes Git
```bash
git init
git add .
git commit -m "Initial commit - carte NFC"
git branch -M main
git remote add origin https://github.com/TON_USER/carte-nfc.git
git push -u origin main
