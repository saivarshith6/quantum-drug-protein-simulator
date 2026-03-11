import numpy as np
from quantum.hamiltonian import build_hamiltonian


def vqe_minimize(num_qubits, molecule_size):
    """
    Quantum-inspired VQE energy minimization (mock).
    Energy depends on qubits + molecule complexity.
    """

    H = build_hamiltonian(num_qubits)

    # Random trial wavefunction
    psi = np.random.rand(len(H))
    psi = psi / np.linalg.norm(psi)

    energy = psi.T @ H @ psi

    # Adjust with molecule size factor
    final_energy = float(energy - molecule_size / (num_qubits * 5))

    return round(final_energy, 4)
