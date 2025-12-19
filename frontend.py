from flask import Blueprint, jsonify, request, render_template
import json, os
from pyswip import Prolog

bp = Blueprint('frontend', __name__)

HERE = os.path.dirname(os.path.abspath(__file__))

DATA_FILE = os.path.join(HERE, "static", "tasks.json")
PROLOG_FILE = os.path.join(HERE, "task_organizer.pl")


if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump({"tasks": []}, f, indent=2, ensure_ascii=False)

def read_tasks():
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"tasks": []} 
def write_tasks(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def update_prolog_facts(tasks):

    with open(PROLOG_FILE, "w", encoding="utf-8") as f:
        pass 

@bp.route("/")
def index():
    return render_template("index.html")

@bp.route("/api/tasks", methods=["GET", "POST", "DELETE"])
def tasks_api():
    data = read_tasks()
    
    if request.method == "GET":
        return jsonify(data) 
        
    if request.method == "POST":
        body = request.get_json()

        data["tasks"].append(body)
        write_tasks(data)
        return jsonify({"ok": True})
        
    if request.method == "DELETE":
        data["tasks"] = []
        write_tasks(data)
        return jsonify({"ok": True})

@bp.route("/api/tasks/<int:index>", methods=["DELETE"])
def delete_task(index):
    data = read_tasks()
    if 0 <= index < len(data["tasks"]):
        data["tasks"].pop(index)
        write_tasks(data)
    return jsonify({"ok": True})

@bp.route("/api/plan")
def plan():
    prolog = Prolog()
 
    prolog.consult(PROLOG_FILE)
    
    tasks_data = read_tasks().get("tasks", [])
    

    list(prolog.query("retractall(task(_,_,_,_))"))
    list(prolog.query("retractall(output(_,_,_,_))"))

    for t in tasks_data:
        name = t.get("name", "").replace("'", "")
        priority = t.get("priority", "low").lower()
        duration = t.get("duration", 0)

        prolog.assertz(f"task('{name}', {priority}, {duration}, none)")

    list(prolog.query("build_schedule(Plan)"))

    out = []
    for r in prolog.query("output(Name, Priority, Duration, Day)"):
        
        out.append({
            "name": r["Name"],
            "priority": str(r["Priority"]),
            "duration": r["Duration"],
            "day": r["Day"]
        })

    return jsonify({"plan": out})