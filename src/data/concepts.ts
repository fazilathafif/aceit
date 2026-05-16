export interface ConceptNote {
  summary: string;
  keyPoints: string[];
  commonMistakes?: string[];
}

export const CONCEPTS: Record<string, ConceptNote> = {
  'Laws of Motion': {
    summary: 'Newton\'s three laws govern how objects respond to forces. The first establishes inertia, the second links force to acceleration, and the third guarantees action-reaction pairs.',
    keyPoints: [
      'Inertia is the resistance of a body to change in its state of motion.',
      'F = ma only applies when mass is constant (use impulse-momentum for variable mass).',
      'Normal force is a contact force perpendicular to the surface, not always equal to mg.',
      'Static friction adjusts up to μₛN; kinetic friction is fixed at μₖN.',
    ],
    commonMistakes: [
      'Confusing weight (mg) with normal force on inclined planes.',
      'Forgetting to resolve forces along the direction of motion.',
    ],
  },
  'Work, Energy and Power': {
    summary: 'Work is done when a force causes displacement. The work-energy theorem connects net work to changes in kinetic energy; conservation of energy links KE and PE transformations.',
    keyPoints: [
      'Work is a scalar; it can be negative (friction, braking).',
      'Only the component of force along displacement does work: W = Fd cos θ.',
      'Mechanical energy is conserved only when non-conservative forces do no work.',
      'Power = rate of work = F · v (force times velocity, not force times speed squared).',
    ],
    commonMistakes: [
      'Using PE = mgh when height is not measured from the same reference point.',
      'Forgetting that the normal force and centripetal force do zero work.',
    ],
  },
  'Gravitation': {
    summary: 'Every mass attracts every other mass with a force proportional to the product of masses and inversely proportional to the square of distance. This governs planetary orbits and satellite motion.',
    keyPoints: [
      'g decreases above Earth\'s surface (g ∝ 1/r²) and below the surface (g ∝ r).',
      'Geostationary orbit: T = 24 h, orbits above equator.',
      'Escape velocity ≈ 11.2 km/s for Earth.',
      'Binding energy = magnitude of total mechanical energy of a satellite.',
    ],
    commonMistakes: [
      'Using g = 9.8 m/s² at high altitudes or underground.',
      'Confusing orbital speed with escape speed (v_e = √2 × v_o).',
    ],
  },
  'Waves': {
    summary: 'Waves transfer energy without net transport of matter. Sound is longitudinal; light is transverse. Standing waves form when two identical waves travel in opposite directions.',
    keyPoints: [
      'In an open pipe: all harmonics present. In a closed pipe: only odd harmonics.',
      'Speed of sound in air ≈ 340 m/s at 20°C; v ∝ √T.',
      'Resonance occurs when driving frequency equals natural frequency.',
      'Beats arise from superposition of two close frequencies.',
    ],
  },
  'Thermodynamics': {
    summary: 'Thermodynamics describes energy transformations involving heat and work. The four laws govern temperature equilibrium, energy conservation, entropy, and absolute zero.',
    keyPoints: [
      'Isothermal: ΔT = 0, ΔU = 0, Q = W.',
      'Adiabatic: Q = 0, ΔU = −W.',
      'Isochoric: W = 0, Q = ΔU.',
      'Isobaric: Q = nCₚΔT, W = PΔV.',
      'Entropy of universe never decreases (Second Law).',
    ],
    commonMistakes: [
      'Sign convention: W is work done BY the system; heat absorbed by system is positive.',
    ],
  },
  'Electrostatics': {
    summary: 'Static charges exert forces on each other via electric fields. Electric potential describes the energy landscape; capacitors store charge and energy.',
    keyPoints: [
      'Electric field lines start on + charges, end on − charges, never cross.',
      'Field inside a conductor is zero; charges reside on the surface.',
      'Potential difference, not absolute potential, drives current.',
      'Capacitors in series: 1/C_total = Σ(1/Cᵢ). In parallel: C_total = ΣCᵢ.',
    ],
    commonMistakes: [
      'Confusing electric field (vector) with electric potential (scalar).',
      'Forgetting that potential is constant on a conductor surface (equipotential).',
    ],
  },
  'Current Electricity': {
    summary: 'Electric current is the flow of charge driven by potential difference. Resistance, determined by material and geometry, governs how much current flows.',
    keyPoints: [
      'Resistors in series: R_total = ΣRᵢ; voltage divides.',
      'Resistors in parallel: 1/R_total = Σ(1/Rᵢ); current divides.',
      'EMF is work done per unit charge by source; terminal voltage = EMF − Ir.',
      'Wheatstone bridge balanced when P/Q = R/S.',
    ],
    commonMistakes: [
      'Ignoring internal resistance in high-current situations.',
      'Applying Ohm\'s law to non-ohmic elements (diodes, LEDs).',
    ],
  },
  'Optics': {
    summary: 'Optics studies the behaviour of light: reflection, refraction, and wave phenomena. Lenses and mirrors form images based on geometry; interference and diffraction show wave nature.',
    keyPoints: [
      'Real images form in front of mirror / on opposite side of lens from object; virtual images behind.',
      'Total internal reflection occurs when angle of incidence > critical angle (medium to less dense medium).',
      'Convex lens converges; concave lens diverges. Power P = 1/f (metres); unit: dioptre.',
      'In Young\'s experiment, fringe width β = λD/d.',
    ],
    commonMistakes: [
      'Wrong sign convention (use consistent New Cartesian or Real-is-Positive).',
      'Confusing focal length with radius of curvature (f = R/2 for mirrors).',
    ],
  },
  'Mole Concept': {
    summary: 'The mole provides a bridge between atomic-scale masses and laboratory-scale quantities. It is the foundation of stoichiometry — calculating reactant and product quantities.',
    keyPoints: [
      '1 mole of any gas at STP (0°C, 1 atm) occupies 22.4 L.',
      'Percentage composition → empirical formula → molecular formula.',
      'Limiting reagent determines maximum product; excess reagent is left over.',
      'Normality = n-factor × Molarity.',
    ],
  },
  'Electrochemistry': {
    summary: 'Electrochemistry links chemical reactions to electricity. Galvanic cells convert chemical energy to electrical energy; electrolytic cells do the reverse using an external source.',
    keyPoints: [
      'Standard hydrogen electrode (SHE) has E° = 0 V by definition.',
      'Higher reduction potential → better oxidising agent (cathode in galvanic cell).',
      'E°_cell = E°_cathode − E°_anode.',
      'Negative ΔG° means spontaneous reaction and positive E°_cell.',
    ],
    commonMistakes: [
      'Confusing anode (oxidation) and cathode (reduction) in galvanic vs electrolytic cells.',
    ],
  },
  'Chemical Kinetics': {
    summary: 'Kinetics studies the speed of chemical reactions and the factors affecting them: concentration, temperature, catalysts, and surface area.',
    keyPoints: [
      'Order of reaction is determined experimentally, not from stoichiometry.',
      'Zero order: rate constant k = −Δ[A]/Δt; [A] decreases linearly.',
      'First order: t½ is constant, independent of initial concentration.',
      'Catalyst lowers activation energy; does not change ΔG or equilibrium position.',
    ],
    commonMistakes: [
      'Assuming reaction order equals stoichiometric coefficient.',
      'Forgetting that temperature change affects k exponentially (Arrhenius).',
    ],
  },
  'Trigonometry': {
    summary: 'Trigonometry studies ratios of sides in right triangles and extends these ratios to all angles via the unit circle. It is essential for calculus, coordinate geometry, and waves.',
    keyPoints: [
      'ASTC rule: All positive (0°–90°), Sin positive (90°–180°), Tan positive (180°–270°), Cos positive (270°–360°).',
      'Inverse trig functions have restricted domains: sin⁻¹ ∈ [−π/2, π/2], cos⁻¹ ∈ [0, π].',
      'General solution: sin θ = sin α → θ = nπ + (−1)ⁿα.',
      'Product-to-sum and sum-to-product identities used in integration.',
    ],
  },
  'Differentiation': {
    summary: 'Differentiation measures the instantaneous rate of change of a function. It is the foundation of optimization, related rates, and differential equations.',
    keyPoints: [
      'Differentiability implies continuity; continuity does not imply differentiability.',
      'For maxima/minima: f\'(x) = 0 and check sign change of f\'(x) or sign of f\'\'(x).',
      'Implicit differentiation: differentiate both sides w.r.t. x, treat y as a function of x.',
      'L\'Hôpital\'s rule applies to 0/0 or ∞/∞ indeterminate forms.',
    ],
  },
  'Integration': {
    summary: 'Integration is the reverse of differentiation and computes areas under curves. Definite integrals give exact values; indefinite integrals produce families of functions.',
    keyPoints: [
      'Area between curves: ∫ₐᵇ |f(x) − g(x)| dx.',
      'Integration by substitution: let u = g(x), du = g\'(x)dx.',
      'Properties: ∫ₐᵃ f dx = 0; ∫ₐᵇ = −∫ᵦₐ.',
      'King\'s property: ∫₀ᵃ f(x)dx = ∫₀ᵃ f(a−x)dx.',
    ],
    commonMistakes: [
      'Forgetting the constant of integration C in indefinite integrals.',
      'Not changing limits when using substitution in definite integrals.',
    ],
  },
  'Coordinate Geometry': {
    summary: 'Coordinate geometry merges algebra and geometry by representing shapes with equations. Conics (circle, parabola, ellipse, hyperbola) each have standard forms with distinct properties.',
    keyPoints: [
      'For ellipse x²/a² + y²/b² = 1 (a > b): foci at (±ae, 0), eccentricity e = c/a < 1.',
      'For hyperbola: eccentricity e > 1; asymptotes y = ±(b/a)x.',
      'Tangent to a circle from external point: length = √(d² − r²).',
      'Angle between two lines: tan θ = |(m₁−m₂)/(1+m₁m₂)|.',
    ],
  },
};
