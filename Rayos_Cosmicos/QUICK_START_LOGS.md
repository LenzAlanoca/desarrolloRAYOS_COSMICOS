# Quick Start - Logs del Detector

## 1. PostgreSQL
- Crear BD: `rayos_cosmicos`
- Usuario: `postgres`
- Password: tu_password

## 2. Backend .env
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=rayos_cosmicos
SSH_USER=detector
SSH_PASSWORD=detector123
```

## 3. Ejecutar SQL
```bash
psql -U postgres -d rayos_cosmicos -f backend/SETUP_BDD.sql
```

## 4. Backend
```bash
cd backend
npm run dev
```

## 5. Test
```bash
curl http://localhost:3000/api/logs
```

**Respuesta:** JSON con dispositivo + variables + archivos .log en tiempo real

---

## Endpoints

| Método | Endpoint | Función |
|--------|----------|---------|
| GET | `/api/logs` | Ver todos los logs + estado BDD |
| GET | `/api/logs/:fileName` | Ver contenido parseado |
| POST | `/api/logs/import/:fileName` | Importar a BDD (futuro) |

---

## Archivos Importantes

- `inicializacionBDD.md` - Estructura BD + Detector Muones
- `backend/LOGS_API_DOCS.md` - Endpoints detallados
- `backend/SETUP_BDD.sql` - Script SQL

---

## Variables del Detector (0x2F1)

```
Pos 0: Canal_1 (conteos)
Pos 1: Canal_2 (conteos)
Pos 2: Canal_3 (conteos)
Pos 3: Flag (0/1)
Pos 4: Temp_Ext (°C)
Pos 5: Presion (hPa)
Pos 6: Humedad (%)
Pos 7: Timestamp
```

---

**Listo.** Endpoint retorna JSON con datos BD + logs nuevos detectados.
