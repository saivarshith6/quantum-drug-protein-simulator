import numpy as np


def build_hamiltonian(num_qubits):
    """
    Mock Hamiltonian matrix for quantum-inspired energy calculation.
    """
    size = 2 ** num_qubits
    H = np.random.uniform(-1, 1, (size, size))
    return (H + H.T) / 2
