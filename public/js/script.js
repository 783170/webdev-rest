// TODO :: Update this entire file to add functionality to the HTML page

console.log('Script is running');

// add event listener for button
document.getElementById('add-btn').addEventListener('click', (event) => {
    console.log('Submit Pressed')
    let data = {
        id: parseInt(document.getElementById('id_input').value),
        name: document.getElementById('name_input').value,
        email: document.getElementById('email_input').value
    }
    let options = {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    };

    fetch('/add-user', options)
    .then((response) => {
        return response.text();
    })
    .then((data) => {
        console.log(data);
    })
    .catch((err) => {
        console.log(err);
    })
}, false);


fetch('/list-users', {method: 'GET'})
.then((response) => {
    return response.json();
})
.then((data) => {
    console.log(data);
    // use the data to add table rows to table body
    // this will run automatically when you go to browser and port 8080

    // add user to table
    let tableBody = document.getElementById('user-tbody');
    data.users.forEach((user) => {
        let row = document.createElement('tr');

        // ID cell
        let idCell = document.createElement('td');
        idCell.textContent = user.id;
        row.appendChild(idCell);

        // Name cell
        let nameCell = document.createElement('td');
        nameCell.textContent = user.name;
        row.appendChild(nameCell);

        // Email cell
        let emailCell = document.createElement('td');
        emailCell.textContent = user.email;
        row.appendChild(emailCell);

        tableBody.appendChild(row);
    });
})
.catch((err) => {
    console.log(err);
});

