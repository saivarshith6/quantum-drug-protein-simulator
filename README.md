# ⚛️ Quantum Drug-Protein Interaction Simulator

A web application that uses **real quantum computing algorithms** to simulate drug-protein interactions — combining quantum chemistry, 3D molecular visualization, and modern web technologies.

🌐 **Live Demo**: [quantum-drug-protein-simulator.netlify.app](https://quantum-drug-protein-simulator.netlify.app)

---

## ✨ Features

- 🧬 **SMILES Input** — Enter any drug molecule using standard SMILES notation
- 🖼️ **Image Upload** — Upload a molecular structure image for analysis
- ⚛️ **Real VQE Simulation** — Runs a Variational Quantum Eigensolver (VQE) using Qiskit-Aer
- 🔬 **3D Molecular Viewer** — Interactive 3D visualization of atomic structure using Three.js
- 📊 **Quantum Circuit Diagram** — View the actual quantum circuit being executed
- 💊 **Binding Energy Prediction** — Predicts interaction strength: Strong / Moderate / Weak
- 🔌 **Protein Validation** — Validates protein targets via UniProt API with offline fallback

---

## 🧠 How It Works

1. User inputs a drug molecule (SMILES string or image) and a protein target
2. Backend parses the SMILES using **RDKit** and generates 3D atomic coordinates
3. A **VQE quantum circuit** is constructed with parameterized rotation gates
4. The circuit is simulated using **Qiskit-Aer** to estimate the ground-state (binding) energy
5. Results are returned to the frontend with 3D structure data and circuit visualization

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework |
| Three.js + @react-three/fiber | 3D molecular visualization |
| Axios | API communication |

### Backend
| Technology | Purpose |
|---|---|
| Python + Flask | REST API server |
| Qiskit + Qiskit-Aer | Quantum circuit simulation (VQE) |
| RDKit | Molecule parsing & 3D structure generation |
| Requests + Pillow | Protein API & image handling |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
python app.py
```
Backend runs at `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

### Environment Variables (Frontend)
Create a `.env` file in the `frontend/` directory:
```
VITE_API_URL=http://localhost:5000
```
For production, set `VITE_API_URL` to your deployed backend URL.

---

## 📁 Project Structure

```
quantum-drug-protein-simulator/
├── backend/
│   ├── app.py                  # Flask API entry point
│   ├── requirements.txt
│   ├── Procfile                # For Render deployment
│   ├── chemistry/
│   │   ├── molecule.py         # SMILES parsing & 3D structure
│   │   └── protein_api.py      # UniProt protein validation
│   └── quantum/
│       ├── qiskit_vqe.py       # Real VQE implementation
│       └── vqe_solver.py       # VQE solver utilities
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js              # Axios API client
│   │   └── components/
│   │       ├── MoleculeViewer.jsx   # 3D viewer
│   │       ├── QuantumCircuit.jsx   # Circuit diagram
│   │       └── Header.jsx
│   └── vite.config.js
└── netlify.toml                # Netlify deployment config
```

---

## 🌍 Deployment

- **Frontend** → [Netlify](https://netlify.com) (auto-deploys on push to `main`)
- **Backend** → [Render](https://render.com) (free tier, Python web service)

---

## 📌 Example Molecules (SMILES)

| Drug | SMILES |
|------|--------|
| Aspirin | `CC(=O)Oc1ccccc1C(=O)O` |
| Caffeine | `CN1C=NC2=C1C(=O)N(C(=O)N2C)C` |
| Ibuprofen | `CC(C)Cc1ccc(cc1)C(C)C(=O)O` |
| Paracetamol | `CC(=O)Nc1ccc(O)cc1` |

---

## 👤 Author

**Sai Varshith** — [GitHub](https://github.com/saivarshith6)
