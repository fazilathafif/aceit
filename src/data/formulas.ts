export interface FormulaEntry {
  name: string;
  formula: string;
  description: string;
  example?: string;
}

export const FORMULAS: Record<string, FormulaEntry[]> = {
  // ── Physics ──────────────────────────────────────────────────────────
  'Laws of Motion': [
    { name: "Newton's First Law", formula: 'F_net = 0  ⟹  a = 0', description: 'A body stays at rest or in uniform motion unless acted on by a net force.' },
    { name: "Newton's Second Law", formula: 'F = ma', description: 'Net force equals mass times acceleration.', example: 'F = 5 kg × 2 m/s² = 10 N' },
    { name: "Newton's Third Law", formula: 'F₁₂ = −F₂₁', description: 'Every action has an equal and opposite reaction.' },
    { name: 'Impulse', formula: 'J = FΔt = Δp', description: 'Impulse equals change in momentum.' },
    { name: 'Friction', formula: 'f = μN', description: 'Friction force = coefficient of friction × normal force.' },
  ],
  'Work, Energy and Power': [
    { name: 'Work', formula: 'W = F·d·cos θ', description: 'Work done by a force at angle θ to displacement.', example: 'W = 10 N × 3 m × cos 0° = 30 J' },
    { name: 'Kinetic Energy', formula: 'KE = ½mv²', description: 'Energy of a body due to its motion.' },
    { name: 'Potential Energy', formula: 'PE = mgh', description: 'Gravitational potential energy near Earth\'s surface.' },
    { name: 'Work-Energy Theorem', formula: 'W_net = ΔKE = ½mv² − ½mu²', description: 'Net work done equals change in kinetic energy.' },
    { name: 'Power', formula: 'P = W/t = F·v', description: 'Rate of doing work.' },
  ],
  'Gravitation': [
    { name: "Newton's Law of Gravitation", formula: 'F = Gm₁m₂/r²', description: 'Gravitational force between two masses.', example: 'G = 6.674 × 10⁻¹¹ N m²/kg²' },
    { name: 'Acceleration due to Gravity', formula: 'g = GM/R²', description: 'Surface gravity from mass M and radius R of planet.' },
    { name: 'Escape Velocity', formula: 'v_e = √(2gR) = √(2GM/R)', description: 'Minimum speed to escape a planet\'s gravity.' },
    { name: 'Orbital Velocity', formula: 'v_o = √(gR) = √(GM/R)', description: 'Speed for circular orbit at surface.' },
    { name: "Kepler's Third Law", formula: 'T² ∝ r³  →  T²/r³ = const', description: 'Square of orbital period is proportional to cube of semi-major axis.' },
  ],
  'Waves': [
    { name: 'Wave Speed', formula: 'v = fλ', description: 'Wave speed = frequency × wavelength.' },
    { name: 'Doppler Effect (source moving)', formula: 'f\' = f(v ± v_o)/(v ∓ v_s)', description: 'Observed frequency when source or observer moves.' },
    { name: 'Standing Wave Condition', formula: 'L = nλ/2   (n = 1,2,3…)', description: 'String fixed at both ends: length must be integer multiple of half-wavelengths.' },
    { name: 'Beats', formula: 'f_beat = |f₁ − f₂|', description: 'Beat frequency is the absolute difference of two frequencies.' },
  ],
  'Thermodynamics': [
    { name: 'First Law', formula: 'ΔU = Q − W', description: 'Change in internal energy = heat absorbed − work done by system.' },
    { name: 'Ideal Gas Law', formula: 'PV = nRT', description: 'Relates pressure, volume, moles, and temperature.', example: 'R = 8.314 J/(mol·K)' },
    { name: 'Efficiency of Heat Engine', formula: 'η = 1 − T_C/T_H = W/Q_H', description: 'Carnot efficiency depends only on temperatures.' },
    { name: 'Specific Heat', formula: 'Q = mcΔT', description: 'Heat needed to change temperature of mass m by ΔT.' },
  ],
  'Electrostatics': [
    { name: "Coulomb's Law", formula: 'F = kq₁q₂/r²', description: 'Force between two point charges.', example: 'k = 9 × 10⁹ N m²/C²' },
    { name: 'Electric Field', formula: 'E = F/q = kQ/r²', description: 'Force per unit positive test charge.' },
    { name: 'Electric Potential', formula: 'V = kQ/r = W/q', description: 'Potential energy per unit charge.' },
    { name: 'Capacitance', formula: 'C = Q/V = ε₀A/d', description: 'Charge stored per unit voltage; parallel-plate formula.' },
    { name: 'Energy in Capacitor', formula: 'U = ½CV² = Q²/2C', description: 'Energy stored in a charged capacitor.' },
  ],
  'Current Electricity': [
    { name: "Ohm's Law", formula: 'V = IR', description: 'Voltage = current × resistance.' },
    { name: 'Resistivity', formula: 'R = ρL/A', description: 'Resistance depends on material (ρ), length, and cross-section.' },
    { name: 'Power Dissipation', formula: 'P = VI = I²R = V²/R', description: 'Power consumed in a resistor.' },
    { name: 'Kirchhoff\'s Voltage Law', formula: 'ΣV = 0  (closed loop)', description: 'Sum of voltages around any closed loop is zero.' },
    { name: 'Kirchhoff\'s Current Law', formula: 'ΣI_in = ΣI_out  (node)', description: 'Current into a node equals current out.' },
  ],
  'Optics': [
    { name: "Snell's Law", formula: 'n₁ sin θ₁ = n₂ sin θ₂', description: 'Refraction at an interface between two media.' },
    { name: 'Lens Formula', formula: '1/v − 1/u = 1/f', description: 'Relates image distance, object distance, and focal length.' },
    { name: 'Magnification', formula: 'm = v/u = h_i/h_o', description: 'Ratio of image to object size/distance.' },
    { name: 'Mirror Formula', formula: '1/v + 1/u = 1/f = 2/R', description: 'Same form as lens formula; sign convention differs.' },
    { name: "Young's Double Slit", formula: 'y = nλD/d', description: 'Position of n-th bright fringe; D = screen dist, d = slit sep.' },
  ],
  // ── Chemistry ─────────────────────────────────────────────────────────
  'Mole Concept': [
    { name: 'Mole Definition', formula: '1 mol = 6.022 × 10²³ particles', description: "Avogadro's number: particles in one mole.", example: 'N_A = 6.022 × 10²³ mol⁻¹' },
    { name: 'Moles from Mass', formula: 'n = m / M', description: 'Moles = given mass / molar mass.' },
    { name: 'Molarity', formula: 'M = n / V(L)', description: 'Moles of solute per litre of solution.' },
    { name: 'Molality', formula: 'm = n / W_solvent(kg)', description: 'Moles per kilogram of solvent.' },
    { name: 'Empirical & Molecular Formula', formula: 'MF = n × EF  where n = MM / EFM', description: 'Molecular formula is an integer multiple of empirical formula.' },
  ],
  'Electrochemistry': [
    { name: 'Faraday\'s First Law', formula: 'w = ZIt = (M/nF)It', description: 'Mass deposited proportional to charge passed.', example: 'F = 96500 C/mol' },
    { name: 'Nernst Equation', formula: 'E = E° − (RT/nF)ln Q = E° − (0.0592/n)log Q', description: 'Cell potential at non-standard conditions (at 298 K).' },
    { name: 'Gibbs and Cell EMF', formula: 'ΔG° = −nFE°', description: 'Standard Gibbs free energy from standard cell potential.' },
  ],
  'Chemical Kinetics': [
    { name: 'Rate Law', formula: 'r = k[A]^m[B]^n', description: 'Rate depends on concentrations raised to reaction orders.' },
    { name: 'First Order Half-life', formula: 't½ = 0.693/k', description: 'Time for reactant concentration to halve (first order).' },
    { name: 'Arrhenius Equation', formula: 'k = Ae^(−Eₐ/RT)', description: 'Rate constant depends on activation energy and temperature.' },
    { name: 'Integrated Rate (1st order)', formula: 'ln[A] = ln[A]₀ − kt', description: 'Concentration decreases exponentially with time.' },
  ],
  // ── Mathematics ───────────────────────────────────────────────────────
  'Trigonometry': [
    { name: 'Pythagorean Identity', formula: 'sin²θ + cos²θ = 1', description: 'Fundamental trigonometric identity.' },
    { name: 'Sum Formulas', formula: 'sin(A±B) = sinA cosB ± cosA sinB\ncos(A±B) = cosA cosB ∓ sinA sinB', description: 'Sine and cosine of sum/difference of angles.' },
    { name: 'Double Angle', formula: 'sin 2θ = 2 sinθ cosθ\ncos 2θ = cos²θ − sin²θ = 1 − 2sin²θ', description: 'Double angle identities.' },
    { name: 'Sine Rule', formula: 'a/sin A = b/sin B = c/sin C', description: 'Relates sides and opposite angles of any triangle.' },
    { name: 'Cosine Rule', formula: 'c² = a² + b² − 2ab cos C', description: 'Generalisation of Pythagorean theorem.' },
  ],
  'Differentiation': [
    { name: 'Power Rule', formula: 'd/dx (xⁿ) = nxⁿ⁻¹', description: 'Derivative of a power function.', example: 'd/dx (x³) = 3x²' },
    { name: 'Product Rule', formula: 'd/dx (uv) = u\'v + uv\'', description: 'Derivative of a product of two functions.' },
    { name: 'Chain Rule', formula: 'd/dx f(g(x)) = f\'(g(x)) · g\'(x)', description: 'Derivative of a composite function.' },
    { name: 'Standard Derivatives', formula: 'd/dx(eˣ) = eˣ\nd/dx(ln x) = 1/x\nd/dx(sin x) = cos x', description: 'Common function derivatives.' },
  ],
  'Integration': [
    { name: 'Power Rule', formula: '∫xⁿ dx = xⁿ⁺¹/(n+1) + C', description: 'Integral of power function (n ≠ −1).' },
    { name: 'Standard Integrals', formula: '∫eˣ dx = eˣ + C\n∫(1/x)dx = ln|x| + C\n∫sin x dx = −cos x + C', description: 'Common indefinite integrals.' },
    { name: 'Definite Integral (FTC)', formula: '∫ₐᵇ f(x)dx = F(b) − F(a)', description: 'Fundamental theorem of calculus.' },
    { name: 'Integration by Parts', formula: '∫u dv = uv − ∫v du', description: 'For products of functions.' },
  ],
  'Coordinate Geometry': [
    { name: 'Distance Formula', formula: 'd = √((x₂−x₁)² + (y₂−y₁)²)', description: 'Distance between two points.' },
    { name: 'Section Formula', formula: 'P = ((mx₂+nx₁)/(m+n), (my₂+ny₁)/(m+n))', description: 'Point dividing segment in ratio m:n.' },
    { name: 'Slope of Line', formula: 'm = (y₂−y₁)/(x₂−x₁) = tan θ', description: 'Slope from two points or angle with x-axis.' },
    { name: 'Circle', formula: '(x−h)² + (y−k)² = r²', description: 'Standard form: centre (h,k), radius r.' },
    { name: 'Parabola', formula: 'y² = 4ax  (focus (a,0), directrix x=−a)', description: 'Standard parabola opening right.' },
  ],
};
