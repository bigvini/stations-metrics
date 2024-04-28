// import './style.css';
const elements = {
    stationIdInput: document.getElementById('station-id-input'),
    deleteButton: document.getElementById('delete-button'),
    addButton: document.getElementById('add-button'),
    formContainer: document.getElementById('form-container'),
    stationsList: document.getElementById('stations-list')
};

let stations;
let isAVisible = false;

async function getStations() {
        const url = "http://localhost:3000/stations";
        const response = await fetch(url);
        if (!response.ok) {
            console.log('Не вдалося отримати дані про станції');
        }
        stations = await response.json();
        return stations;
}

async function getStationsWithMetrics(stationId) {
    const url = `http://localhost:3000/stations/${stationId}/metrics`;
    const response = await fetch(url);
    if (!response.ok) {
        console.log('Не вдалося отримати метрики по ід станції');
    }
    let metric = await response.json();
    return metric;
}

// async function showAllStations() {
//     if (!stations) {
//         await getStations();
//     }
    
//     const stationsContainer = elements.stationsList;
//     stationsContainer.innerHTML = '';

//     const updateMetrics = null;
//         for (const station of stations) {
//             const metrics = await getStationsWithMetrics(station.id);
//             const stationElement = document.createElement("div");
//             stationElement.classList.add("station");
//             stationElement.innerHTML = `
//                 <p>ID: ${station.id}</p>
//                 <p>Address: ${station.address}</p>
//                 <p>Status: ${station.status ? 'Active' : 'Inactive'}</p>`
//                 updateMetrics = async () => {
//                     stationElement.innerHTML +=`
//                 <p>Temperature: ${metrics.temoerature}</p>
//                 <p>Dose rate: ${metrics.dose_rate}</p>
//                 <p>Humidity: ${metrics.humidity}</p>
//                 <hr>
//             `;
//             stationsContainer.appendChild(stationElement);
//         }
//     };

//     updateMetrics(); 
//     setInterval(updateMetrics, 1000); 
// }

async function showAllStations() {
    if (!stations) {
        await getStations();
    }
    
    const stationsContainer = elements.stationsList;
    stationsContainer.innerHTML = '';

    const displayStationInfo = () => {
        for (const station of stations) {
            const stationElement = document.createElement("div");
            stationElement.id = `station-${station.id}`;
            stationElement.classList.add("station");
            stationElement.innerHTML = `
                <p>ID: ${station.id} | Address: ${station.address} | Status: ${station.status ? 'Active' : 'Inactive'}</p>
                <div id="metrics-${station.id}"></div>
                <hr>
            `;
            stationsContainer.appendChild(stationElement);
        }
    };

    const updateMetrics = async () => {
        for (const station of stations) {
            const metrics = await getStationsWithMetrics(station.id);
            const metricsContainer = document.querySelector(`#metrics-${station.id}`);
            if (metricsContainer) {
                metricsContainer.innerHTML = `
                    <p>Temperature: ${metrics.temoerature} | Dose rate: ${metrics.dose_rate} | Humidity: ${metrics.humidity}</p>
                `;
            }
        }
    };

    displayStationInfo();
    updateMetrics();
    setInterval(updateMetrics, 2000);
}



async function showActiveStations() {
        if (!stations) {
            await getStations();
        }
        const stationsContainer = elements.stationsList;
        stationsContainer.innerHTML = '';
        stations.filter(station => station.status).forEach(station => {
            const stationElement = document.createElement("div");
            stationElement.classList.add("station");
            stationElement.innerHTML = `
                <p>ID: ${station.id}</p>
                <p>Address: ${station.address}</p>
                <p>Status: ${station.status ? 'Active' : 'Inactive'}</p>
                <hr>
            `;
            stationsContainer.appendChild(stationElement);
        });
}

async function addNewStation(newStationData) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newStationData)
        };
        const response = await fetch('http://localhost:3000/stations', requestOptions);
        if (!response.ok) {
            console.log('Не вдалося додати станцію');
        }
        await showAllStations();
}

async function deleteStation(stationId) {
        const url = `http://localhost:3000/stations/${stationId}`;
        const requestOptions = {
            method: 'DELETE'
        };
        const response = await fetch(url, requestOptions);
        if (response.ok) {
            await showAllStations();
            console.log(`Станцію з ID ${stationId} успішно видалено`);
        } else {
            console.log();(`Помилка при видаленні станції з ID ${stationId}`);
        }
    }

async function showAddForm() {
        if (!isAVisible) {
            const addForm = document.createElement('div');
            addForm.innerHTML = `
                <input type="text" id="station-add-input" placeholder="Введіть назву станції">
                <button id="add-button">Додати станцію</button>
            `;
            const addButton = addForm.querySelector('#add-button');
            addButton.addEventListener('click', async () => {
                const stationAddInput = addForm.querySelector('#station-add-input');
                const newStationName = stationAddInput.value.trim();
                if (newStationName) {
                    const newStationData = {
                        address: newStationName,
                        status: true
                    };
                    await addNewStation(newStationData);
                    stationAddInput.value = '';
                } else {
                    console.error('Введіть назву станції');
                }
            });
            elements.formContainer.appendChild(addForm);
            await showAllStations();
            isAVisible = true;
        } else {
            elements.formContainer.innerHTML = '';
            isAVisible = false;
        }
}

async function showDeleteForm() {
        if (!isAVisible) {
            const deleteForm = document.createElement('div');
            deleteForm.innerHTML = `
                <input type="text" id="station-id-input" placeholder="Введіть ID станції">
                <button id="delete-button">Видалити</button>
            `;
            const deleteButton = deleteForm.querySelector('#delete-button');
            deleteButton.addEventListener('click', () => {
                const stationIdInput = deleteForm.querySelector('#station-id-input');
                const stationId = parseInt(stationIdInput.value);
                if (isNaN(stationId)) {
                    console.error('Некоректний ідентифікатор станції');
                    return;
                }
                deleteStation(stationId);
                elements.formContainer.removeChild(deleteForm);
            });
            elements.formContainer.appendChild(deleteForm);
            isAVisible = true;
            await showAllStations();
        } else {
            elements.formContainer.innerHTML = '';
            isAVisible = false;
        }
}

async function showEditForm(stationId, currentAddress) {
        if (!isAVisible) {
            const editForm = document.createElement('div');
            editForm.innerHTML = `
                <input type="text" id="station-id-input" placeholder="Введіть ID станції">
                <input type="text" id="station-address-input" placeholder="Введіть нову адресу станції">
                <label for="station-status-input">Статус:</label>
                <input type="checkbox" id="station-status-input">
                <button id="edit-button">Редагувати</button>
            `;
            elements.formContainer.innerHTML = '';
            elements.formContainer.appendChild(editForm);
            const editButton = editForm.querySelector('#edit-button');
            editButton.addEventListener('click', async () => {
                const stationIdInput = editForm.querySelector('#station-id-input');
                const stationId = parseInt(stationIdInput.value);
                const stationAddressInput = editForm.querySelector('#station-address-input');
                const newAddress = stationAddressInput.value.trim();
                const stationStatusInput = editForm.querySelector('#station-status-input');
                const newStatus = stationStatusInput.checked;
                if (!isNaN(stationId) && newAddress) {
                    await editStation(stationId, { address: newAddress, status: newStatus });
                } else {
                    console.log('Некоректні дані для редагування станції');
                }
            });
        } else {
            elements.formContainer.innerHTML = '';
            isAVisible = false;
        }
}

async function editStation(stationId, updatedData) {
        const url = `http://localhost:3000/stations/${stationId}`;
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        };
        const response = await fetch(url, requestOptions);
        if (response.ok) {
            await showAllStations();
            console.log(`Станцію з ID ${stationId} успішно відредаговано`);
        } else {
            console.log(`Помилка при редагуванні станції з ID ${stationId}`);
        }
}

async function updateStation(stationId, updatedData) {
        const url = `http://localhost:3000/stations/${stationId}`;
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        };
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
           console.log("Помилка оновлення станції");
        }
}

elements.showDeleteFormButton = document.getElementById('show-delete-form');
elements.showDeleteFormButton.addEventListener('click', showDeleteForm);

elements.updateButton = document.getElementById('update-button');
elements.updateButton.addEventListener("click", showAllStations);

elements.showAddFormButton = document.getElementById('show-add-form');
elements.showAddFormButton.addEventListener('click', showAddForm);

elements.showEditFormButton = document.getElementById('show-edit-form');
elements.showEditFormButton.addEventListener('click', showEditForm);

elements.showActiveStationsButton = document.getElementById('show-active-stations');
elements.showActiveStationsButton.addEventListener("click", showActiveStations);
