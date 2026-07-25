# BudgetQuest – Verkaufsversion

Dieses Repository enthält die neutrale, kommerzielle BudgetQuest-Version.

## Zielbild

- keine persönlichen Haushaltsdaten
- neutraler Musterhaushalt
- Demo- und Vollversion über zentrale Feature-Flags
- Offline-Lizenzierung über signierte `.bqlicense`-Dateien
- bestehende private Familien-App bleibt unverändert

## Editionen

### Demo
- begrenzte Anzahl Buchungen
- eingeschränkter Import
- kein Export
- Eigenheim nur als Vorschau
- Premium-Funktionen gesperrt

### Full
- unbegrenzte Buchungen
- vollständiger Import/Export
- Eigenheim-Modul
- alle Statistiken und Planungsfunktionen

## Architektur

- `config/` Produkt- und Editionseinstellungen
- `demo/` Demo-Limits und Beispieldaten
- `license/` Lizenzprüfung und Feature-Freischaltung
- bestehende BudgetQuest-Codebasis wird schrittweise neutralisiert und integriert
