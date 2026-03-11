import requests

# ---------------------------------------------------------------------------
# Offline fallback dictionary — used when UniProt is unreachable.
# Covers 60+ common proteins across all major categories.
# ---------------------------------------------------------------------------
OFFLINE_PROTEINS = {
    # ── Structural / transport ─────────────────────────────────────────────
    "insulin":            {"uniprot_id": "P01308", "protein_name": "Insulin"},
    "hemoglobin":         {"uniprot_id": "P69905", "protein_name": "Hemoglobin subunit alpha"},
    "albumin":            {"uniprot_id": "P02768", "protein_name": "Serum albumin"},
    "myoglobin":          {"uniprot_id": "P02144", "protein_name": "Myoglobin"},
    "collagen":           {"uniprot_id": "P02452", "protein_name": "Collagen alpha-1(I) chain"},
    "elastin":            {"uniprot_id": "P15502", "protein_name": "Elastin"},
    "keratin":            {"uniprot_id": "P04264", "protein_name": "Keratin, type II cytoskeletal 1"},
    "fibrinogen":         {"uniprot_id": "P02671", "protein_name": "Fibrinogen alpha chain"},
    "ferritin":           {"uniprot_id": "P02794", "protein_name": "Ferritin heavy chain"},
    "transferrin":        {"uniprot_id": "P02787", "protein_name": "Serotransferrin"},
    "aquaporin":          {"uniprot_id": "P29972", "protein_name": "Aquaporin-1"},
    # ── Motor proteins ─────────────────────────────────────────────────────
    "myosin":             {"uniprot_id": "P12882", "protein_name": "Myosin-1"},
    "actin":              {"uniprot_id": "P60709", "protein_name": "Actin, cytoplasmic 1"},
    "tubulin":            {"uniprot_id": "P68363", "protein_name": "Tubulin alpha-1B chain"},
    "kinesin":            {"uniprot_id": "P33176", "protein_name": "Kinesin-1 heavy chain"},
    "dynein":             {"uniprot_id": "Q14204", "protein_name": "Cytoplasmic dynein 1 heavy chain 1"},
    # ── Enzymes ────────────────────────────────────────────────────────────
    "lysozyme":           {"uniprot_id": "P00698", "protein_name": "Lysozyme C"},
    "trypsin":            {"uniprot_id": "P00760", "protein_name": "Trypsin"},
    "pepsin":             {"uniprot_id": "P00791", "protein_name": "Pepsin A-3"},
    "catalase":           {"uniprot_id": "P04040", "protein_name": "Catalase"},
    "amylase":            {"uniprot_id": "P04746", "protein_name": "Pancreatic alpha-amylase"},
    "lipase":             {"uniprot_id": "P16233", "protein_name": "Pancreatic triacylglycerol lipase"},
    "thrombin":           {"uniprot_id": "P00734", "protein_name": "Prothrombin"},
    "chymotrypsin":       {"uniprot_id": "P00766", "protein_name": "Chymotrypsinogen A"},
    "carbonic anhydrase": {"uniprot_id": "P00915", "protein_name": "Carbonic anhydrase 1"},
    "ca2":                {"uniprot_id": "P00915", "protein_name": "Carbonic anhydrase 2"},
    "atpase":             {"uniprot_id": "P25705", "protein_name": "ATP synthase subunit alpha"},
    "atp synthase":       {"uniprot_id": "P25705", "protein_name": "ATP synthase subunit alpha"},
    "cox":                {"uniprot_id": "P00403", "protein_name": "Cytochrome c oxidase subunit 2"},
    "cytochrome":         {"uniprot_id": "P00403", "protein_name": "Cytochrome c oxidase subunit 2"},
    "peroxidase":         {"uniprot_id": "P04406", "protein_name": "Glyceraldehyde-3-phosphate dehydrogenase"},
    "kinase":             {"uniprot_id": "P00533", "protein_name": "Epidermal growth factor receptor"},
    # ── Oncology / drug targets ────────────────────────────────────────────
    "p53":                {"uniprot_id": "P04637", "protein_name": "Cellular tumor antigen p53"},
    "tp53":               {"uniprot_id": "P04637", "protein_name": "Cellular tumor antigen p53"},
    "brca1":              {"uniprot_id": "P38398", "protein_name": "Breast cancer type 1 susceptibility protein"},
    "brca2":              {"uniprot_id": "P51587", "protein_name": "Breast cancer type 2 susceptibility protein"},
    "egfr":               {"uniprot_id": "P00533", "protein_name": "Epidermal growth factor receptor"},
    "her2":               {"uniprot_id": "P04626", "protein_name": "Receptor tyrosine-protein kinase erbB-2"},
    "kras":               {"uniprot_id": "P01116", "protein_name": "GTPase KRas"},
    "ras":                {"uniprot_id": "P01116", "protein_name": "GTPase KRas"},
    "vegf":               {"uniprot_id": "P15692", "protein_name": "Vascular endothelial growth factor A"},
    "mdm2":               {"uniprot_id": "Q00987", "protein_name": "E3 ubiquitin-protein ligase Mdm2"},
    "bcl2":               {"uniprot_id": "P10415", "protein_name": "Apoptosis regulator Bcl-2"},
    "pten":               {"uniprot_id": "P60484", "protein_name": "Phosphatase and tensin homolog"},
    "abl":                {"uniprot_id": "P00519", "protein_name": "Tyrosine-protein kinase ABL1"},
    "cdk2":               {"uniprot_id": "P24941", "protein_name": "Cyclin-dependent kinase 2"},
    "mtor":               {"uniprot_id": "P42345", "protein_name": "Serine/threonine-protein kinase mTOR"},
    # ── Receptors / signalling ─────────────────────────────────────────────
    "ace2":               {"uniprot_id": "Q9BYF1", "protein_name": "Angiotensin-converting enzyme 2"},
    "ace":                {"uniprot_id": "P12821", "protein_name": "Angiotensin-converting enzyme"},
    "rhodopsin":          {"uniprot_id": "P08100", "protein_name": "Rhodopsin"},
    "beta2ar":            {"uniprot_id": "P07550", "protein_name": "Beta-2 adrenergic receptor"},
    "dopamine":           {"uniprot_id": "P14416", "protein_name": "D(2) dopamine receptor"},
    "serotonin":          {"uniprot_id": "P08908", "protein_name": "5-hydroxytryptamine receptor 1A"},
    "gpcr":               {"uniprot_id": "P07550", "protein_name": "Beta-2 adrenergic receptor"},
    "glucagon":           {"uniprot_id": "P01275", "protein_name": "Glucagon"},
    "leptin":             {"uniprot_id": "P41159", "protein_name": "Leptin"},
    "glucocorticoid":     {"uniprot_id": "P04150", "protein_name": "Glucocorticoid receptor"},
    "estrogen":           {"uniprot_id": "P03372", "protein_name": "Estrogen receptor"},
    "androgen":           {"uniprot_id": "P10275", "protein_name": "Androgen receptor"},
    "thyroid":            {"uniprot_id": "P10827", "protein_name": "Thyroid hormone receptor alpha"},
    # ── Viral / infectious disease ─────────────────────────────────────────
    "spike":              {"uniprot_id": "P0DTC2", "protein_name": "Spike glycoprotein (SARS-CoV-2)"},
    "covid":              {"uniprot_id": "P0DTC2", "protein_name": "Spike glycoprotein (SARS-CoV-2)"},
    "hiv":                {"uniprot_id": "P04585", "protein_name": "HIV-1 Gag-Pol polyprotein"},
    "protease":           {"uniprot_id": "P04585", "protein_name": "HIV-1 Gag-Pol polyprotein"},
    "neuraminidase":      {"uniprot_id": "P03468", "protein_name": "Neuraminidase (Influenza A)"},
    "hemagglutinin":      {"uniprot_id": "P03437", "protein_name": "Hemagglutinin (Influenza A)"},
    # ── Neuroscience ──────────────────────────────────────────────────────
    "tau":                {"uniprot_id": "P10636", "protein_name": "Microtubule-associated protein tau"},
    "amyloid":            {"uniprot_id": "P05067", "protein_name": "Amyloid precursor protein"},
    "app":                {"uniprot_id": "P05067", "protein_name": "Amyloid precursor protein"},
    "alpha synuclein":    {"uniprot_id": "P37840", "protein_name": "Alpha-synuclein"},
    "synuclein":          {"uniprot_id": "P37840", "protein_name": "Alpha-synuclein"},
    "acetylcholinesterase": {"uniprot_id": "P22303", "protein_name": "Acetylcholinesterase"},
    "ache":               {"uniprot_id": "P22303", "protein_name": "Acetylcholinesterase"},
}


def validate_protein(query: str):
    """
    Validate a protein name / accession.

    1. Tries UniProt online (2-second timeout).
    2. Falls back to the offline dictionary (exact match, then partial match).
    """
    # ── 1. Try online ─────────────────────────────────────────────────────
    try:
        url = (
            "https://rest.uniprot.org/uniprotkb/search"
            f"?query={query}&limit=5&format=json"
        )
        res = requests.get(url, timeout=2)
        if res.status_code == 200:
            data = res.json()
            if "results" in data and len(data["results"]) > 0:
                query_lower = query.lower()
                for protein in data["results"]:
                    accession = protein["primaryAccession"].lower()
                    try:
                        full_name = protein["proteinDescription"]["recommendedName"]["fullName"]["value"]
                    except (KeyError, TypeError):
                        continue
                    if query_lower == accession or query_lower in full_name.lower():
                        return {"uniprot_id": protein["primaryAccession"], "protein_name": full_name}
    except Exception:
        pass  # Network error / timeout — fall through to offline

    # ── 2. Offline fallback ───────────────────────────────────────────────
    key = query.strip().lower()

    # Exact match
    if key in OFFLINE_PROTEINS:
        return OFFLINE_PROTEINS[key]

    # Partial match (e.g. "myos" matches "myosin")
    for name, data in OFFLINE_PROTEINS.items():
        if key in name or name in key:
            return data

    # Suggest similar names
    suggestions = ", ".join(sorted(OFFLINE_PROTEINS.keys())[:10])
    return {
        "error": (
            f"Protein '{query}' not found. "
            f"Try one of: {suggestions}, … (60+ proteins supported)"
        )
    }
