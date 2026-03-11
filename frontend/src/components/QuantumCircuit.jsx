/**
 * QuantumCircuit — SVG rendering of the VQE ansatz:
 *   Layer 1 : RY(θᵢ) on every qubit
 *   Layer 2 : CNOT chain (ctrl i → tgt i+1)
 *   Layer 3 : RY(θᵢ + π/4) on every qubit
 */
export default function QuantumCircuit({ n = 4 }) {
    // Safety: ensure n is a valid integer between 2 and 8
    const numQubits = Math.max(2, Math.min(8, parseInt(n, 10) || 4));

    const WIRE_SPACING = 52;
    const GATE_W = 50;
    const GATE_H = 28;
    const COL = { ry1: 80, cnot: 180, ry2: 310 };
    const PAD_LEFT = 32;
    const PAD_RIGHT = 48;
    const HEIGHT = numQubits * WIRE_SPACING + 20;
    const WIDTH = COL.ry2 + GATE_W + PAD_RIGHT;

    const wireY = (i) => 20 + i * WIRE_SPACING;

    // Colors
    const RY_COLOR = "rgba(34,211,238,0.15)";
    const RY_BORDER = "#22d3ee";
    const RY_TEXT = "#a5f3fc";
    const CNOT_CTRL = "#a78bfa";
    const CNOT_TGT = "#c4b5fd";
    const WIRE_COLOR = "rgba(129,140,248,0.35)";
    const LABEL_COLOR = "rgba(100,116,139,0.9)";

    return (
        <div className="circuit-wrapper">
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                width="100%"
                className="circuit-svg"
                aria-label={`${numQubits}-qubit VQE ansatz circuit`}
            >
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="glow-soft">
                        <feGaussianBlur stdDeviation="1.2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* ── Column labels ─────────────────────────── */}
                {[
                    { x: COL.ry1 + GATE_W / 2, label: "Layer 1" },
                    { x: COL.cnot + 10, label: "Layer 2" },
                    { x: COL.ry2 + GATE_W / 2, label: "Layer 3" },
                ].map(({ x, label }) => (
                    <text key={label} x={x} y={8} textAnchor="middle"
                        fontSize="8" fill={LABEL_COLOR} letterSpacing="1" fontFamily="JetBrains Mono, monospace">
                        {label}
                    </text>
                ))}

                {/* ── Qubit wires ────────────────────────────── */}
                {Array.from({ length: numQubits }, (_, i) => {
                    const y = wireY(i);
                    return (
                        <g key={`wire-${i}`}>
                            {/* qubit init label */}
                            <text x={PAD_LEFT - 4} y={y + 1} textAnchor="end"
                                fontSize="10" fill="#818cf8" fontFamily="JetBrains Mono, monospace"
                                dominantBaseline="middle" filter="url(#glow-soft)">
                                |0⟩
                            </text>
                            {/* wire line */}
                            <line x1={PAD_LEFT} y1={y} x2={WIDTH - 12} y2={y}
                                stroke={WIRE_COLOR} strokeWidth="1.5" />
                            {/* qubit index label on right */}
                            <text x={WIDTH - 8} y={y + 1} fontSize="9"
                                fill={LABEL_COLOR} fontFamily="JetBrains Mono, monospace"
                                dominantBaseline="middle">
                                q{i}
                            </text>
                        </g>
                    );
                })}

                {/* ── Layer 1: RY gates ─────────────────────── */}
                {Array.from({ length: numQubits }, (_, i) => {
                    const y = wireY(i);
                    return (
                        <g key={`ry1-${i}`} filter="url(#glow-soft)">
                            <rect
                                x={COL.ry1} y={y - GATE_H / 2}
                                width={GATE_W} height={GATE_H}
                                rx={5} ry={5}
                                fill={RY_COLOR} stroke={RY_BORDER} strokeWidth="1"
                            />
                            <text x={COL.ry1 + GATE_W / 2} y={y + 1}
                                textAnchor="middle" dominantBaseline="middle"
                                fontSize="9" fill={RY_TEXT} fontFamily="JetBrains Mono, monospace" fontWeight="600">
                                RY(θ{i})
                            </text>
                        </g>
                    );
                })}

                {/* ── Layer 2: CNOT chain ───────────────────── */}
                {Array.from({ length: numQubits - 1 }, (_, i) => {
                    const cy = wireY(i);
                    const ty = wireY(i + 1);
                    const cx = COL.cnot + 10;
                    return (
                        <g key={`cnot-${i}`} filter="url(#glow-soft)">
                            {/* vertical line ctrl → tgt */}
                            <line x1={cx} y1={cy} x2={cx} y2={ty}
                                stroke={CNOT_CTRL} strokeWidth="1.5" />
                            {/* control dot */}
                            <circle cx={cx} cy={cy} r={5}
                                fill={CNOT_CTRL} />
                            {/* target ⊕ */}
                            <circle cx={cx} cy={ty} r={9}
                                fill="none" stroke={CNOT_TGT} strokeWidth="1.5" />
                            <line x1={cx - 9} y1={ty} x2={cx + 9} y2={ty}
                                stroke={CNOT_TGT} strokeWidth="1.5" />
                            <line x1={cx} y1={ty - 9} x2={cx} y2={ty + 9}
                                stroke={CNOT_TGT} strokeWidth="1.5" />
                        </g>
                    );
                })}

                {/* ── Layer 3: RY(θᵢ + π/4) gates ─────────── */}
                {Array.from({ length: numQubits }, (_, i) => {
                    const y = wireY(i);
                    return (
                        <g key={`ry2-${i}`} filter="url(#glow-soft)">
                            <rect
                                x={COL.ry2} y={y - GATE_H / 2}
                                width={GATE_W} height={GATE_H}
                                rx={5} ry={5}
                                fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="1"
                            />
                            <text x={COL.ry2 + GATE_W / 2} y={y - 3}
                                textAnchor="middle" dominantBaseline="middle"
                                fontSize="8" fill="#c4b5fd" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                                RY(θ{i}
                            </text>
                            <text x={COL.ry2 + GATE_W / 2} y={y + 8}
                                textAnchor="middle" dominantBaseline="middle"
                                fontSize="7.5" fill="#c4b5fd" fontFamily="JetBrains Mono, monospace">
                                +π/4)
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
