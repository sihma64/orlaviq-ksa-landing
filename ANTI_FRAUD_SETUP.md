# Protection Anti-Fraude ORLAVIQ - Documentation

## Vue d'ensemble

Ce système de protection anti-fraude utilise l'API MaxMind minFraud Score pour valider les commandes avant l'ouverture de WhatsApp. Il détecte et bloque les commandes suspectes provenant d'IP non-saoudiennes, de VPN/proxy, ou présentant un risque élevé.

## Architecture

### 1. Route API Serveur
**Fichier:** `src/app/api/order-guard/route.ts`

Cette route API côté serveur :
- Extrait l'IP réelle du client depuis les headers Cloudflare (`cf-connecting-ip`)
- Vérifie si le numéro de téléphone est dans la whitelist
- Appelle l'API MaxMind minFraud Score
- Applique les règles de décision
- Retourne l'autorisation ou le refus avec le lien WhatsApp

### 2. Intégration Frontend
**Fichier:** `src/app/page.tsx`

Le formulaire de commande :
- Appelle `/api/order-guard` avant d'ouvrir WhatsApp
- Affiche un message d'erreur en arabe si la commande est refusée
- Désactive le bouton pendant la vérification
- Ouvre WhatsApp uniquement si la commande est approuvée

### 3. Configuration
**Fichier:** `.env.example`

Variables d'environnement requises pour la configuration.

## Configuration

### Étape 1 : Créer un compte MaxMind

1. Inscrivez-vous sur https://www.maxmind.com/en/solutions/minfraud-services
2. Créez une clé de licence dans votre compte
3. Notez votre `Account ID` et `License Key`

### Étape 2 : Variables d'environnement locales

Créez un fichier `.env.local` à la racine du projet :

```bash
# MaxMind minFraud Configuration
MAXMIND_ACCOUNT_ID=votre_account_id
MAXMIND_LICENSE_KEY=votre_license_key
MAXMIND_MINFRAUD_ENDPOINT=https://minfraud.maxmind.com/minfraud/v2.0/score

# Order Guard Configuration
ORDER_ALLOWED_COUNTRY=SA
ORDER_MAX_RISK_SCORE=20

# Whitelisted phone numbers (comma-separated)
ORDER_PHONE_WHITELIST=0550000000

# WhatsApp Configuration
WHATSAPP_NUMBER=212716296177
```

### Étape 3 : Configuration Cloudflare Pages

Dans le dashboard Cloudflare Pages, ajoutez ces variables d'environnement :

1. Allez dans **Settings** > **Environment Variables**
2. Ajoutez pour **Production** et **Preview** :

```
MAXMIND_ACCOUNT_ID=votre_account_id
MAXMIND_LICENSE_KEY=votre_license_key
MAXMIND_MINFRAUD_ENDPOINT=https://minfraud.maxmind.com/minfraud/v2.0/score
ORDER_ALLOWED_COUNTRY=SA
ORDER_MAX_RISK_SCORE=20
ORDER_PHONE_WHITELIST=0550000000
WHATSAPP_NUMBER=212716296177
```

## Règles de Décision

Le système refuse une commande si :

1. **Pays non autorisé** : L'IP n'est pas géolocalisée en Arabie Saoudite (`country.iso_code !== "SA"`)
2. **Score de risque élevé** : `risk_score >= 20`
3. **IP à risque** : `ip_address.risk >= 20`
4. **VPN/Proxy détecté** : Présence de signaux d'anonymisation dans `ip_address_risk_reasons`

### Numéros Whitelistés

Le numéro `0550000000` (configurable via `ORDER_PHONE_WHITELIST`) :
- Bypass tous les contrôles IP et MaxMind
- Permet de tester les commandes en production
- Retourne `{ allowed: true, reason: "WHITELISTED_TEST_NUMBER" }`

## Réponses API

### Commande Approuvée
```json
{
  "allowed": true,
  "reason": "APPROVED",
  "whatsappUrl": "https://wa.me/212716296177?text=..."
}
```

### Commande Refusée
```json
{
  "allowed": false,
  "reason": "OUTSIDE_KSA" | "HIGH_RISK_SCORE" | "HIGH_RISK_IP" | "VPN_OR_PROXY_DETECTED" | "MAXMIND_ERROR"
}
```

## Messages d'Erreur

Lorsqu'une commande est refusée, l'utilisateur voit ce message en arabe :

```
عذراً، لا يمكن تأكيد الطلب حالياً. يرجى التواصل معنا عبر واتساب للمراجعة.
```

*Traduction : "Désolé, la commande ne peut pas être confirmée actuellement. Veuillez nous contacter via WhatsApp pour révision."*

## Sécurité

✅ **Bonnes pratiques implémentées :**
- Les clés MaxMind ne sont jamais exposées côté client
- Toutes les vérifications sont effectuées côté serveur
- L'IP est extraite des headers Cloudflare sécurisés
- Les numéros de téléphone sont normalisés avant vérification
- Les erreurs sont loggées mais ne révèlent pas d'informations sensibles

## Tests

### Test avec numéro whitelisté
1. Utilisez le numéro `0550000000` dans le formulaire
2. La commande devrait être approuvée immédiatement
3. WhatsApp s'ouvre avec le message pré-rempli

### Test avec IP non-KSA (via VPN)
1. Connectez-vous à un VPN hors Arabie Saoudite
2. Essayez de passer une commande
3. Vous devriez voir le message d'erreur en arabe

### Test en développement local
Si MaxMind n'est pas configuré localement, le système :
- Log un avertissement dans la console
- Autorise la commande par défaut (`MAXMIND_NOT_CONFIGURED`)
- Permet le développement sans clés API

## Tracking Analytics

Le système track ces événements :
- `OrderFormSubmit` : Soumission du formulaire
- `WhatsAppConfirmClick` : Commande approuvée, WhatsApp ouvert
- `OrderRejected` : Commande refusée avec raison
- `OrderGuardError` : Erreur lors de la vérification

## Dépannage

### Erreur : "MaxMind API error"
- Vérifiez que `MAXMIND_ACCOUNT_ID` et `MAXMIND_LICENSE_KEY` sont corrects
- Vérifiez que votre compte MaxMind est actif
- Vérifiez que vous avez des crédits minFraud disponibles

### Toutes les commandes sont refusées
- Vérifiez `ORDER_MAX_RISK_SCORE` (valeur par défaut : 20)
- Vérifiez `ORDER_ALLOWED_COUNTRY` (valeur par défaut : SA)
- Consultez les logs serveur pour voir les scores MaxMind

### Le numéro whitelisté ne fonctionne pas
- Vérifiez `ORDER_PHONE_WHITELIST` dans les variables d'environnement
- Le numéro doit être exact : `0550000000`
- Les espaces et tirets sont automatiquement supprimés

## Maintenance

### Ajuster le seuil de risque
Modifiez `ORDER_MAX_RISK_SCORE` :
- `10` : Très strict (peut bloquer des clients légitimes)
- `20` : Équilibré (recommandé)
- `30` : Plus permissif

### Ajouter des numéros à la whitelist
Séparez les numéros par des virgules :
```
ORDER_PHONE_WHITELIST=0550000000,0551111111,0552222222
```

### Autoriser d'autres pays
Modifiez la logique dans `route.ts` pour accepter plusieurs pays :
```typescript
const ALLOWED_COUNTRIES = ["SA", "AE", "KW"];
if (!ALLOWED_COUNTRIES.includes(maxmindResponse.country?.iso_code)) {
  // refuser
}
```

## Support

Pour toute question ou problème :
1. Consultez les logs serveur Cloudflare
2. Vérifiez la console du navigateur pour les erreurs frontend
3. Testez avec le numéro whitelisté pour isoler le problème
4. Vérifiez que toutes les variables d'environnement sont définies

## Coûts MaxMind

MaxMind minFraud fonctionne par crédit :
- ~0.01$ par requête pour minFraud Score
- Packages disponibles avec tarifs dégressifs
- Surveillez votre utilisation dans le dashboard MaxMind
