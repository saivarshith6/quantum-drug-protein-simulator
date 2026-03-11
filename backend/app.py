import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from chemistry.molecule import parse_smiles, generate_3d_structure
from chemistry.protein_api import validate_protein
from quantum.qiskit_vqe import run_qiskit_vqe

app = Flask(__name__)
CORS(app)


@app.route("/simulate", methods=["POST"])
def simulate():

    # ==============================
    # IMAGE MODE (Energy Only)
    # ==============================
    if "drug_image" in request.files:

        protein = request.form.get("protein")
        qubits = int(request.form.get("qubits", 4))

        protein_data = validate_protein(protein)
        if "error" in protein_data:
            return jsonify(protein_data), 400

        # Real Qiskit VQE energy estimation
        energy = run_qiskit_vqe(qubits, 5)

        if energy < -1.5:
            strength = "Strong"
        elif energy < -0.5:
            strength = "Moderate"
        else:
            strength = "Weak"

        return jsonify({
            "message": "Image uploaded successfully. Structure extraction is future work.",
            "protein_name": protein_data["protein_name"],
            "uniprot_id": protein_data["uniprot_id"],
            "binding_energy": energy,
            "interaction_strength": strength,
            "structure": None
        })

    # ==============================
    # SMILES MODE
    # ==============================
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON input"}), 400

    smiles = data.get("smiles")
    protein = data.get("protein")
    qubits = int(data.get("qubits", 4))

    protein_data = validate_protein(protein)
    if "error" in protein_data:
        return jsonify(protein_data), 400

    mol = parse_smiles(smiles)
    structure = generate_3d_structure(mol)

    energy = run_qiskit_vqe(qubits, len(structure["atoms"]))

    if energy < -1.5:
        strength = "Strong"
    elif energy < -0.5:
        strength = "Moderate"
    else:
        strength = "Weak"

    return jsonify({
        "protein_name": protein_data["protein_name"],
        "uniprot_id": protein_data["uniprot_id"],
        "binding_energy": energy,
        "interaction_strength": strength,
        "structure": structure
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
