// TODO :: this should be broken up into individual REST calls, have it like this for now to test fetch from client side

console.log('Script is running');

fetch("/incidents")
    .then(res => res.json())
    .then(data => {
        const tbody = document.getElementById("incident-tbody");
        data.forEach(inc => {
            let row = document.createElement("tr");

            row.innerHTML = `
                <td>${inc.case_number}</td>
                <td>${inc.date}</td>
                <td>${inc.time}</td>
                <td>${inc.code}</td>
                <td>${inc.incident}</td>
                <td>${inc.police_grid}</td>
                <td>${inc.neighborhood_number}</td>
                <td>${inc.block}</td>
            `;
            tbody.appendChild(row);
        });
    })
    // .catch(err => {
    //     console.log(err);
    // });

// Remove incident
const removeBtn = document.getElementById("remove-btn");
removeBtn.addEventListener("click", () => {
    const caseNum = document.getElementById("case_input").value.trim();
    if (!caseNum) {
        document.getElementById("remove-result").innerText = "Please enter a case number.";
        return;
    }

    fetch("/remove-incident", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_number: caseNum })
    })
    .then(res => {
        if (res.status === 200) return "Incident removed successfully!";
        if (res.status === 500) return "Error: Case number does not exist.";
        return "Unknown error";
    })
    .then(msg => document.getElementById("remove-result").innerText = msg)
    .catch(err => document.getElementById("remove-result").innerText = "Network error: " + err);
});