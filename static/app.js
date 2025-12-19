// static/app.js

document.getElementById("taskForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const priority = document.getElementById("priority").value;
    const duration = document.getElementById("duration").value;
    const deadline = document.getElementById("deadline").value;

    if (name === "") {
        alert("Write task name first!");
        return;
    }

    const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, priority, duration, deadline }),
    });

    const data = await response.json();
    document.getElementById("msg").textContent = data.ok
        ? "Task added successfully!"
        : "Error adding task";

    loadTasks();
});

async function loadTasks() {
    const response = await fetch("/api/tasks");
    const data = await response.json();
    
    const tasks = data.tasks || [];

    const list = document.getElementById("tasksList");
    list.innerHTML = "";

    tasks.forEach((t, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${t.name} <small>(${t.priority}, ${t.duration}h)</small></span>`;

        const delBtn = document.createElement("button");
        delBtn.textContent = "X";
        delBtn.className = "btn danger";
        delBtn.style.marginLeft = "10px";
        delBtn.onclick = async () => {
            await fetch(`/api/tasks/${i}`, { method: "DELETE" });
            loadTasks();
        };

        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

document.getElementById("refreshBtn").addEventListener("click", loadTasks);

document.getElementById("clearBtn").addEventListener("click", async () => {
    if (confirm("Are you sure you want to delete all tasks?")) {
        await fetch("/api/tasks", { method: "DELETE" });
        loadTasks();
    }
});

document.getElementById("generatePlan").addEventListener("click", async () => {
    const response = await fetch("/api/plan");
    const data = await response.json();
    const plan = data.plan || [];

    const planCard = document.getElementById("planCard");
    const planList = document.getElementById("planList");
    planList.innerHTML = "";

    if (plan.length === 0) {
        planList.innerHTML = "<li>No tasks to plan!</li>";
    } else {
        plan.forEach((p) => {
            const li = document.createElement("li");
            li.textContent = `${p.name} [${p.priority}] (${p.duration}h) -> Day: ${p.day}`;
            planList.appendChild(li);
        });
    }

    planCard.style.display = "block";
});

loadTasks();