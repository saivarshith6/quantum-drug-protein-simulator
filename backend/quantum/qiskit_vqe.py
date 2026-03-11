"""
Real Qiskit VQE module for Quantum Drug–Protein Interaction Simulator.

Circuit ansatz (RY + CNOT chain):
  |0> ─RY(θ0)─■──────────────────
               │
  |0> ─RY(θ1)─X─■────────────────
                 │
  |0> ─RY(θ2)───X─■──────────────
                   │  ...

Hamiltonian:
  H = c0·I + Σ ci·Zi + Σ cij·ZiZj
Coefficients are derived from molecule size (atom_count) and qubit count.
"""

import numpy as np
from scipy.optimize import minimize


# ---------------------------------------------------------------------------
# Hamiltonian helpers
# ---------------------------------------------------------------------------

def _pauli_z_matrix(n_qubits: int, target: int) -> np.ndarray:
    """Return the 2^n × 2^n matrix for Z acting on qubit `target`."""
    I = np.eye(2)
    Z = np.array([[1.0, 0.0], [0.0, -1.0]])
    ops = [Z if i == target else I for i in range(n_qubits)]
    result = ops[0]
    for op in ops[1:]:
        result = np.kron(result, op)
    return result


def _pauli_zz_matrix(n_qubits: int, i: int, j: int) -> np.ndarray:
    """Return the matrix for Z_i ⊗ Z_j."""
    I = np.eye(2)
    Z = np.array([[1.0, 0.0], [0.0, -1.0]])
    ops = []
    for k in range(n_qubits):
        if k == i or k == j:
            ops.append(Z)
        else:
            ops.append(I)
    result = ops[0]
    for op in ops[1:]:
        result = np.kron(result, op)
    return result


def build_molecular_hamiltonian(n_qubits: int, atom_count: int) -> np.ndarray:
    """
    Build a simplified molecular Hamiltonian as a 2^n × 2^n matrix.

    H = c0·I + Σ ci·Zi + Σ cij·ZiZj

    Coefficients are derived from atom_count and n_qubits so that
    larger, more complex molecules yield lower (more negative) energies.
    """
    dim = 2 ** n_qubits
    H = np.zeros((dim, dim))

    # Identity term (nuclear repulsion proxy)
    c0 = -0.5 * atom_count / (n_qubits + 1)
    H += c0 * np.eye(dim)

    # Single-qubit Z terms (one-electron integrals)
    for i in range(n_qubits):
        ci = -0.3 * (atom_count / (i + 2)) / n_qubits
        H += ci * _pauli_z_matrix(n_qubits, i)

    # Two-qubit ZZ terms (two-electron integrals / coupling)
    for i in range(n_qubits):
        for j in range(i + 1, n_qubits):
            cij = 0.1 * np.cos((i + j) * np.pi / (n_qubits + 1))
            H += cij * _pauli_zz_matrix(n_qubits, i, j)

    return H


# ---------------------------------------------------------------------------
# Ansatz circuit (statevector simulation — no Aer required for import)
# ---------------------------------------------------------------------------

def _build_statevector(params: np.ndarray, n_qubits: int) -> np.ndarray:
    """
    Compute the statevector of the parameterised ansatz analytically.

    Layer 1 : RY(θi) on every qubit
    Layer 2 : CNOT chain  (qubit i → qubit i+1)
    Layer 3 : RY(θi + π/4) on every qubit  (second rotation layer)

    This avoids a hard Qiskit-Aer dependency for the statevector while
    still representing a valid quantum ansatz.  When Qiskit Aer is
    available the try-block below uses it; the except falls back to the
    NumPy implementation so the module always works.
    """
    try:
        return _qiskit_statevector(params, n_qubits)
    except Exception:
        return _numpy_statevector(params, n_qubits)


def _numpy_statevector(params: np.ndarray, n_qubits: int) -> np.ndarray:
    """Pure-NumPy statevector of the ansatz (fallback)."""
    dim = 2 ** n_qubits
    state = np.zeros(dim, dtype=complex)
    state[0] = 1.0  # |00…0>

    def ry(theta: float) -> np.ndarray:
        return np.array([[np.cos(theta / 2), -np.sin(theta / 2)],
                         [np.sin(theta / 2),  np.cos(theta / 2)]])

    def apply_single(state: np.ndarray, gate: np.ndarray, target: int) -> np.ndarray:
        """Apply a single-qubit gate on `target` qubit (little-endian)."""
        state = state.reshape([2] * n_qubits)
        state = np.tensordot(gate, state, axes=[[1], [target]])
        state = np.moveaxis(state, 0, target)
        return state.reshape(dim)

    def apply_cnot(state: np.ndarray, ctrl: int, tgt: int) -> np.ndarray:
        state = state.reshape([2] * n_qubits)
        # Flip tgt qubit where ctrl qubit == 1
        slices_ctrl1: list[int | slice] = [slice(None)] * n_qubits  # type: ignore[list-item]
        slices_ctrl1[ctrl] = 1
        sub = state[tuple(slices_ctrl1)]
        # Flip along tgt axis within the sub-tensor
        sub_axes = list(range(n_qubits - 1))
        tgt_in_sub = tgt if tgt < ctrl else tgt - 1
        state[tuple(slices_ctrl1)] = np.flip(sub, axis=tgt_in_sub)
        return state.reshape(dim)

    # Layer 1 — RY rotations
    for i in range(n_qubits):
        state = apply_single(state, ry(params[i]), i)

    # Layer 2 — CNOT chain
    for i in range(n_qubits - 1):
        state = apply_cnot(state, i, i + 1)

    # Layer 3 — Second RY layer
    for i in range(n_qubits):
        state = apply_single(state, ry(params[i] + np.pi / 4), i)

    return state


def _qiskit_statevector(params: np.ndarray, n_qubits: int) -> np.ndarray:
    """Qiskit Aer statevector simulation of the ansatz."""
    from qiskit import QuantumCircuit
    from qiskit_aer import AerSimulator

    qc = QuantumCircuit(n_qubits)

    # Layer 1 — RY
    for i in range(n_qubits):
        qc.ry(float(params[i]), i)

    # CNOT entanglement chain
    for i in range(n_qubits - 1):
        qc.cx(i, i + 1)

    # Layer 2 — RY (second rotation)
    for i in range(n_qubits):
        qc.ry(float(params[i] + np.pi / 4), i)

    qc.save_statevector()

    sim = AerSimulator(method="statevector")
    job = sim.run(qc)
    result = job.result()
    sv = np.array(result.get_statevector(qc))
    return sv


# ---------------------------------------------------------------------------
# Expectation value + VQE optimizer
# ---------------------------------------------------------------------------

def _expectation_value(params: np.ndarray, H: np.ndarray, n_qubits: int) -> float:
    """⟨ψ(θ)|H|ψ(θ)⟩  — real part only (H is Hermitian)."""
    psi = _build_statevector(params, n_qubits)
    ev = np.real(psi.conj() @ H @ psi)
    return float(ev)


def run_qiskit_vqe(num_qubits: int, atom_count: int) -> float:
    """
    Run the Variational Quantum Eigensolver using a real parameterised
    quantum circuit and return the minimum energy.

    Parameters
    ----------
    num_qubits : int
        Number of qubits (matches the slider in the frontend, clamped 2–6).
    atom_count  : int
        Number of atoms parsed from the SMILES string (proxy for complexity).

    Returns
    -------
    float
        Minimum binding energy (Hartree-like units, always ≤ 0).
    """
    # Clamp qubit range to keep simulation fast (2–6 qubits)
    n = max(2, min(int(num_qubits), 6))
    atoms = max(1, int(atom_count))

    H = build_molecular_hamiltonian(n, atoms)

    # Random initial parameters in [0, 2π]
    rng = np.random.default_rng(seed=42)
    theta0 = rng.uniform(0, 2 * np.pi, n)

    result = minimize(
        fun=_expectation_value,
        x0=theta0,
        args=(H, n),
        method="COBYLA",
        options={"maxiter": 500, "rhobeg": 0.5},
    )

    minimum_energy = round(float(result.fun), 4)
    return minimum_energy
