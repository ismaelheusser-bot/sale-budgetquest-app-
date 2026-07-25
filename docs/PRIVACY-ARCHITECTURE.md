# BudgetQuest Datenschutz-Architektur

## Grundsatz

BudgetQuest ist als Local-first-Anwendung konzipiert. Finanzdaten werden im Browser des Benutzers verarbeitet und gespeichert. Der Anbieter betreibt keine zentrale Finanzdatenbank und erhält keinen technischen Zugriff auf Buchungen, Einkommen, Kontostände, Bankimporte, Belege oder Ziele.

## Datenfluss

1. Der Benutzer öffnet die statische Web-App.
2. CSV-, PDF- und Bilddateien werden lokal im Browser verarbeitet.
3. Finanzdaten werden vor der Speicherung mit AES-GCM-256 verschlüsselt.
4. Der Schlüssel wird aus einem persönlichen Passwort mit PBKDF2-SHA-256 abgeleitet.
5. Der verschlüsselte Datensatz wird in IndexedDB auf dem Benutzergerät gespeichert.
6. Exporte werden lokal als Datei erzeugt und nicht über einen BudgetQuest-Server geleitet.

## Verbindliche Schutzregeln

- Keine Finanzdaten-API und keine zentrale Benutzerdatenbank.
- Keine Übertragung von Finanzdaten an Analyse-, Werbe- oder Fehlerdienste.
- Keine sensiblen Inhalte in Logs oder Fehlermeldungen.
- Keine fest eingebauten Verschlüsselungsschlüssel.
- Keine unverschlüsselten Finanzdaten in localStorage.
- Externe Netzwerkzugriffe werden über eine Positivliste begrenzt.
- Eine spätere Cloud-Synchronisation ist nur Ende-zu-Ende-verschlüsselt und ausdrücklich optional zulässig.

## Technische Module

- `storage/secure-store.js`: verschlüsselte Speicherung in IndexedDB.
- `privacy/network-guard.js`: blockiert nicht freigegebene Netzwerkziele und mögliche Finanzdatenübertragungen.
- `privacy/safe-logger.js`: entfernt sensible Felder aus technischen Logs.

## Transparenztext für Benutzer

> Ihre Finanzdaten bleiben auf Ihrem Gerät. BudgetQuest verarbeitet Bankimporte, Buchungen, Budgets und Ziele lokal im Browser. Der Anbieter hat keinen technischen Zugriff auf diese Inhalte. Ohne Ihr Datenschutz-Passwort können verschlüsselte Daten nicht wiederhergestellt werden.

## Grenzen

Der Schutz setzt ein vertrauenswürdiges Endgerät und einen aktuellen Browser voraus. Schadsoftware, kompromittierte Browser-Erweiterungen, Bildschirmaufnahmen oder ein verlorenes Passwort können nicht durch BudgetQuest verhindert beziehungsweise wiederhergestellt werden.
