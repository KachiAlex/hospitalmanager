## Hospital Management App

Simple Express + SQLite backend that supports:

1. Patient onboarding and history
2. Doctor registry with specialties
3. Encounter notes, diagnoses, lab orders, prescriptions
4. Admissions with bed allocation and discharge flow

### Setup

```bash
npm install
npm start   # runs on http://localhost:3000
```

Database lives at `data/hospital.db` (auto-created). Beds A/B/C wards with 5 beds each are seeded on boot.

### Key Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Service heartbeat |
| POST | `/patients` | Register patient |
| GET | `/patients` | List patients |
| GET | `/patients/:id` | Full patient record incl. encounters/admissions |
| POST | `/doctors` | Add doctor |
| POST | `/encounters` | Link doctor+patient visit |
| POST | `/diagnoses` | Attach diagnosis to encounter |
| POST | `/lab-orders` | Request lab |
| PATCH | `/lab-orders/:id` | Update lab status/results |
| POST | `/prescriptions` | Add medication plan |
| GET | `/beds?status=available` | Inspect beds |
| POST | `/admissions` | Admit patient + occupy bed |
| POST | `/admissions/:id/discharge` | Discharge, free bed |
| GET | `/admissions` | Admission overview |

Payload validation handled via Zod; errors return 400 with details.

### Sample Flow

```bash
# Add doctor & patient
curl -X POST http://localhost:3000/doctors -H "Content-Type: application/json" -d '{"firstName":"Ada","lastName":"Byron","specialty":"Cardiology"}'
curl -X POST http://localhost:3000/patients -H "Content-Type: application/json" -d '{"firstName":"John","lastName":"Doe","gender":"male","dateOfBirth":"1980-04-01"}'

# Create encounter (use returned IDs)
curl -X POST http://localhost:3000/encounters -H "Content-Type: application/json" -d '{"patientId":1,"doctorId":1,"visitDate":"2025-12-30","reason":"Chest pain"}'

# Diagnosis + lab + Rx
curl -X POST http://localhost:3000/diagnoses -H "Content-Type: application/json" -d '{"encounterId":1,"summary":"Arrhythmia"}'
curl -X POST http://localhost:3000/lab-orders -H "Content-Type: application/json" -d '{"encounterId":1,"testType":"ECG"}'
curl -X POST http://localhost:3000/prescriptions -H "Content-Type: application/json" -d '{"encounterId":1,"medication":"Beta blocker","dosage":"25mg","frequency":"Twice daily"}'

# Allocate bed + discharge
curl http://localhost:3000/beds?status=available
curl -X POST http://localhost:3000/admissions -H "Content-Type: application/json" -d '{"patientId":1,"bedId":1}'
curl -X POST http://localhost:3000/admissions/1/discharge -H "Content-Type: application/json" -d '{}'
```
