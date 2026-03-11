from rdkit import Chem
from rdkit.Chem import AllChem


def parse_smiles(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if not mol:
        raise ValueError("Invalid SMILES string")

    mol = Chem.AddHs(mol)
    return mol


def generate_3d_structure(mol):
    AllChem.EmbedMolecule(mol)
    AllChem.UFFOptimizeMolecule(mol)

    atoms = []
    bonds = []

    conf = mol.GetConformer()

    for atom in mol.GetAtoms():
        pos = conf.GetAtomPosition(atom.GetIdx())
        atoms.append({
            "element": atom.GetSymbol(),
            "x": pos.x,
            "y": pos.y,
            "z": pos.z
        })

    for bond in mol.GetBonds():
        bonds.append({
            "start": bond.GetBeginAtomIdx(),
            "end": bond.GetEndAtomIdx()
        })

    return {"atoms": atoms, "bonds": bonds}
