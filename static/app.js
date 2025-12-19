document
  .getElementById("taskForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const priority = document.getElementById("priority").value;
    const duration = document.getElementById("duration").value;
    const deadline = document.getElementById("deadline").value;

    if (name === "") {
      alert("Please write a task name!");
      return;
    }

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, priority, duration, deadline }),
    });

    const data = await response.json();
    const msgDiv = document.getElementById("msg");

    if (data.ok) {
      msgDiv.textContent = "Task added successfully! ";
      msgDiv.style.color = "#10b981";
      document.getElementById("taskForm").reset();
    } else {
      msgDiv.textContent = "Error adding task!";
      msgDiv.style.color = "#f43f5e";
    }

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
    li.className = "task-item";

    li.innerHTML = `
            <div class="task-info">
                <b>${t.name}</b>
                <span>${t.duration}h | Deadline: ${t.deadline || "None"}</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px">
                <span class="badge ${t.priority.toLowerCase()}">${
      t.priority
    }</span>
                <button class="del-btn" onclick="deleteTask(${i})" title="Delete">✕</button>
            </div>
        `;
    list.appendChild(li);
  });
}

async function deleteTask(index) {
  if (confirm("Delete this task?")) {
    await fetch(`/api/tasks/${index}`, { method: "DELETE" });
    loadTasks();
  }
}

document.getElementById("clearBtn").addEventListener("click", async () => {
  if (confirm("Are you sure you want to delete all tasks?")) {
    await fetch("/api/tasks", { method: "DELETE" });
    loadTasks();
    document.getElementById("planCard").style.display = "none";
  }
});

document.getElementById("generatePlan").addEventListener("click", async () => {
  const response = await fetch("/api/plan");
  const data = await response.json();
  const plan = data.plan || [];

  const planCard = document.getElementById("planCard");
  const planList = document.getElementById("planList");

  planCard.style.display = "block";
  planList.innerHTML = "";

  if (plan.length === 0) {
    planList.innerHTML =
      "<li class='task-item'>No plan generated. Add more tasks!</li>";
  } else {
    plan.forEach((p) => {
      const li = document.createElement("li");
      li.className = "task-item";
      li.style.borderLeftColor = "#7c3aed";
      li.innerHTML = `
                <div class="task-info">
                    <b style="color:#7c3aed">Day ${p.day}: ${p.name}</b>
                    <span>Priority: ${p.priority} | ${p.duration} hours</span>
                </div>
            `;
      planList.appendChild(li);
    });
  }

  planCard.scrollIntoView({ behavior: "smooth" });
});

loadTasks();
