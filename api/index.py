import json
import random

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


random.seed(a=None, version=2)

rHex = lambda: random.randint(0, 255)
rAng = lambda: random.randint(-6, 7)
rOrb = lambda: random.randint(-20, 21)
rVel = lambda: 1 + (3 - 1) * random.random()


@app.route("/api/getNPlanets", methods=["POST"])
def getNPlanets():
    data = request.get_json()  # Parse JSON body
    n = int(data.get("n"))
    planets = []

    for i in range(0, n):
        planets.append(genPlanet())
    return jsonify(planets)


@app.route("/api/get6Planets", methods=["GET"])
def getListOfPlanets():
    planets = []
    for i in range(0, random.randint(4, 7)):
        planets.append(genPlanet())

    return jsonify(planets)


def genPlanet():
    hex = "0x%02X%02X%02X" % (rHex(), rHex(), rHex())
    radius = random.uniform(0.5, 1.0)
    initAngle = [0, 0, 0]
    tO = rOrb()
    orbitalRadius = [tO, tO, random.uniform(-3.0, 3.0)]
    velocity = rVel()
    return {
        "name": "Planetx",
        "colour": str(hex),
        "radius": radius,
        "init_angle": initAngle,
        "orbital_radius": orbitalRadius,
        "angular_velocity": str(velocity),
    }


# if __name__ == "__main__":
#   app.run(host="0.0.0.0", port=5000, debug=True)
