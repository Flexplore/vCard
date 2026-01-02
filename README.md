# vCard
Carte de visite numérique, NFC
# Carte de visite NFC (site + ajout contact)

Site statique (HTML/CSS/JS) fait pour être ouvert après un scan NFC.
Inclut un bouton "Ajouter le contact" qui génère un fichier vCard (.vcf) importable sur iPhone/Android.

## Personnalisation
Ouvre `main.js` et modifie l'objet `CONTACT`.

## Lancer en local
Option 1 (simple) : ouvrir `index.html` dans le navigateur.

Option 2 (serveur local recommandé) :
- Avec Node installé :
  - `npx serve .`
  - ou `npx http-server .`

## Déploiement sur GitHub Pages
1. Crée un repo sur GitHub (ex: `carte-nfc`)
2. Push le code (voir commandes ci-dessous)
3. Le workflow GitHub Actions publie automatiquement sur Pages

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
