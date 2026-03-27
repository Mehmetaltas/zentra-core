from fastapi import FastAPI
import requests

app = FastAPI()

def get_global():
    try:
        fx = requests.get("https://api.exchangerate.host/latest?base=USD&symbols=TRY").json()
        usdtry = fx["rates"]["TRY"]
    except:
        usdtry = 30

    return {
        "usdtry": usdtry,
        "oil": 80,
        "gold": 1900
    }

def calculate_risk(delay, score, exp, global_data):
    risk = delay*1.5 + exp*50 + (100-score)

    if global_data["usdtry"] > 30:
        risk += 10

    return max(0, min(100, risk))

def decision(risk):
    if risk < 40:
        return "Proceed"
    elif risk < 70:
        return "Monitor"
    else:
        return "Restrict"

@app.get("/engine/run")
def run(delay: float, score: float, exp: float):
    global_data = get_global()
    risk = calculate_risk(delay, score, exp, global_data)

    return {
        "risk": risk,
        "decision": decision(risk),
        "global": global_data
    }
