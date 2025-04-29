# Utiliser une image officielle Node.js comme image de base
FROM node:22-alpine


# Définir le répertoire de travail dans le container
WORKDIR /app

# Copier package.json et package-lock.json
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install --force --legacy-peer-deps


# Copier le reste de l'application
COPY . .

# Copier .env.prod en .env pour la prod
RUN cp .env.prod .env

# Construire l'application Next.js
RUN npm run build



# Exposer le port sur lequel l'application écoute (par défaut 3000)
EXPOSE 8001

# Lancer l'application Next.js en mode production
CMD ["npm", "start"]
