# ========================================================
# NITRO TYPER & CYBER ARCADE - PYTHON RANDOM TEXT GENERATOR
# Uses Python's random module to generate dynamic typing texts
# ========================================================

import random
import json
import os

# Subject / Driver pool
SUBJECTS = [
    "The twin turbochargers", "The obsidian hypercar", "The crimson moon",
    "Active aerodynamics", "The screaming V12 engine", "Tires smoking on asphalt",
    "A flash of blue nitro", "The aerodynamic carbon wing", "Neon headlights",
    "The telemetry sensors", "High frequency electric motors", "Titanium paddle shifters",
    "The lone midnight driver", "The Akatsuki speedster", "Crows scattering into the darkness"
]

VERBS = [
    "ignite the cool night air", "slice through turbulent headwinds",
    "deliver instantaneous torque", "carve flawless lines through the chicane",
    "illuminate the asphalt under the blood-red moon", "rocket past the two-hundred mile mark",
    "grip the tarmac with uncompromising downforce", "disengage launch control with authority",
    "accelerate toward the checkered finish line", "outmaneuver rival machines with razor precision",
    "unleash raw kinetic horsepower", "shatter the sound barrier down the straightaway"
]

FINISHERS = [
    "while spectators watch in disbelief.", "leaving a glowing neon trail in the dust.",
    "as the tachometer needle buries itself in the redline.",
    "proving that timing and focus conquer all challenges.",
    "as the digital speedometer flashes triple digit velocities.",
    "under the watchful gaze of the crimson eclipse.",
    "securing the championship trophy before midnight arrives.",
    "as exhaust flames lick the damp asphalt."
]

CURATED_THEMATIC_QUOTES = [
    "Under the blood-red moon, true speed is born from absolute focus and unyielding resolve.",
    "The engine roared to life as crimson reflections danced across the glossy carbon fiber hood.",
    "Shift gears smoothly, keep your eyes pinned to the apex, and never hesitate on the throttle.",
    "Twin titanium exhaust pipes spit blue flames as the hypercar launches into hyperdrive.",
    "Those who cannot acknowledge themselves will eventually falter when the redline approaches.",
    "Downshifting before the hairpin turn allows maximum power delivery down the main straightaway.",
    "Headlights pierce through the dark mist like laser beams cutting toward victory.",
    "Adrenaline pulses through your veins as rival supercars flank both sides of your lane.",
    "Precision steering and razor sharp reflexes separate champion racers from mere contenders.",
    "The launch control sequence disengages with a thunderous snap, propelling the chassis forward.",
    "Throughout heaven and earth, I alone am the honored one under the limitless sky.",
    "Don't worry, I'm the strongest. True speed bends space itself into infinity."
]

# Curated vocabulary pools for Cyber Word Combat & Bubble Shooter
CYBER_WORD_POOLS = {
    "short": [
        "glow", "surf", "wave", "reef", "dive", "aqua", "tide", "beam", "bolt", "grid",
        "core", "neon", "drop", "flow", "apex", "moon", "crow", "fire", "clan", "mist",
        "wind", "leaf", "star", "dark", "flux", "warp", "echo", "nova", "void", "blue", "eyes"
    ],
    "medium": [
        "plant", "touch", "cyber", "laser", "drive", "limit", "piece", "batch", "found",
        "surge", "spark", "matrix", "stream", "vortex", "shadow", "photon", "itachi",
        "redline", "plasma", "sensor", "falcon", "spiral", "strike", "chakra", "clover",
        "satoru", "gojo", "hollow", "purple", "domain", "curse"
    ],
    "long": [
        "velocity", "terminal", "quantum", "protocol", "overdrive", "hyperion",
        "radiance", "perimeter", "cyberpunk", "synchrony", "tsukuyomi", "sharingan",
        "amaterasu", "reflection", "supersonic", "atmosphere", "revolution",
        "infinity", "limitless", "sixeyes", "expansion", "strongest"
    ]
}

def generate_random_words(count=10, category="medium"):
    """Uses Python random module to select random cyber words for the word shooter."""
    pool = CYBER_WORD_POOLS.get(category, CYBER_WORD_POOLS["medium"])
    # If requested count is smaller than pool, sample without replacement, else with replacement
    if count <= len(pool):
        return random.sample(pool, count)
    return [random.choice(pool) for _ in range(count)]

def generate_random_text(level=1):
    """Generates a dynamic random typing text using Python's random module."""
    rand_choice = random.random()
    
    if rand_choice < 0.45 and CURATED_THEMATIC_QUOTES:
        # Pick from curated themed quotes
        return random.choice(CURATED_THEMATIC_QUOTES)
    else:
        # Procedurally synthesize a unique sentence using random variables
        sub = random.choice(SUBJECTS)
        vrb = random.choice(VERBS)
        fin = random.choice(FINISHERS)
        return f"{sub} {vrb} {fin}"

def generate_text_library(count=100):
    """Generates a complete library of random typing texts across levels."""
    library = []
    for i in range(1, count + 1):
        library.append({
            "level": i,
            "text": generate_random_text(i),
            "word_count": len(generate_random_text(i).split()),
            "char_count": len(generate_random_text(i))
        })
    return library

if __name__ == "__main__":
    output_dir = os.path.dirname(os.path.abspath(__file__))
    data = generate_text_library(100)
    output_file = os.path.join(output_dir, "texts.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Successfully generated {len(data)} random texts to {output_file} using Python random module.")
