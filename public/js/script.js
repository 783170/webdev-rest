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