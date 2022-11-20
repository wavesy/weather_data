createDropdownItem = (signal) => {
    const listItemElement = document.createElement('li');
    const listItemAnchor = document.createElement('a');
    listItemAnchor.className = "dropdown-item";
    listItemAnchor.href = "#"
    listItemAnchor.innerHTML = signal.name;
    listItemElement.append(listItemAnchor);

    listItemElement.onclick = () => {
        setSignal(signal.name);
    }

    return listItemElement
}


fetchSignalList = async () => {
    const listContainer = document.getElementById("signal-menu");
    try{
        const response = await fetch('https://webapi19sa-1.course.tamk.cloud/v1/weather/names');
        
        if (!response.ok){
            throw new Error(response.statusText);
        }

        const data = await response.json();

        data.map(item => {
            const listItem = createDropdownItem(item);
            listContainer.append(listItem)
        })
        
        console.log(data);
    }
    catch (error){
        console.error(error)
    }
}


setTime = (time) => {
    document.getElementById("time-dropdown").innerHTML = time;
    updateView();
}


setSignal = (signal) => {
    document.getElementById("signal-dropdown").innerHTML = signal;
    updateView();
}


clearList = (root) => {
    while( root.firstChild ){
        root.removeChild( root.firstChild );
    }
}


createListItem = (reading) => {
    // TO BE USED WITH GENERAL LATEST 50 LIST
    const rowElement = document.createElement('tr');

    const sigCol = document.createElement('td');
    const sigName = Object.keys(reading.data).at(0);
    sigCol.innerHTML = sigName;
    rowElement.append(sigCol);

    const valCol = document.createElement('td');
    valCol.innerHTML = reading.data[sigName];
    rowElement.append(valCol);

    const timeCol = document.createElement('td');
    timeCol.innerHTML = reading.date_time;
    rowElement.append(timeCol);

    return rowElement;
}


createSpecificListItem = (signal, reading) => {
    // TO BE USED WITH EVERYTHING ELSE
    const rowElement = document.createElement('tr');

    const sigCol = document.createElement('td');
    sigCol.innerHTML = signal;
    rowElement.append(sigCol);

    const valCol = document.createElement('td');
    valCol.innerHTML = reading[signal];
    rowElement.append(valCol);

    const timeCol = document.createElement('td');
    timeCol.innerHTML = reading.date_time;
    rowElement.append(timeCol);

    return rowElement;
}


fetchData = async (signal, time) => {
    const listContainer = document.getElementById("data-table");
    clearList(listContainer);

    try{
        let response;
        if(time === 'Now'){
            response = await fetch('https://webapi19sa-1.course.tamk.cloud/v1/weather/' + signal);
            console.log('https://webapi19sa-1.course.tamk.cloud/v1/weather/' + signal);
        }
        else{
            response = await fetch('https://webapi19sa-1.course.tamk.cloud/v1/weather/' + signal + '/' + time);
            console.log('https://webapi19sa-1.course.tamk.cloud/v1/weather/' + signal + '/' + time);
        }
        if(!response.ok){
            throw new Error(response.statusText);
        }
        const data = await response.json();
        
        // trim json
        console.log(('device_id' in data.at(0)));
        if ('device_id' in data.at(0)){
            data.forEach(element => {
                delete element['device_id'];
            });
        }
        console.log(data);

        data.map(item => {
            const listItem = createSpecificListItem(signal, item);
            listContainer.append(listItem)
        })

        updateChart(data);
    }
    catch (error){
        console.log(error);
    }
}


fetchLatest50 = async () => {
    clearChart();
    document.getElementById("time-dropdown").innerHTML = 'Select time period';
    document.getElementById("signal-dropdown").innerHTML = 'Select signal';

    const listContainer = document.getElementById("data-table");
    clearList(listContainer);

    try{
        const response = await fetch('https://webapi19sa-1.course.tamk.cloud/v1/weather/limit/50');
        if(!response.ok){
            throw new Error(response.statusText);
        }
        const data = await response.json();
        console.log(data);

        data.map(item => {
            const listItem = createListItem(item);
            listContainer.append(listItem)
        })
    }
    catch (error){
        console.log(error);
    }
}


updateView = () => {
    let time = document.getElementById("time-dropdown").innerHTML;
    const signal = document.getElementById("signal-dropdown").innerHTML;

    // ugly if statements, should be done better
    if(time === '24 h') time = 24;
    else if(time === '48 h') time = 48;
    else if(time === '72 h') time = 72;
    else if(time === '1 week') time = 168;
    else if(time === '1 month') time = 720;

    fetchData(signal, time);
}


clearChart = () => {
    // check if chart exists, then destroy it if needed
    let chartStatus = Chart.getChart("myChart");
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }
}


updateChart = (weatherData) => {
    console.log(Object.keys(weatherData.at(0)).at(1));
    clearChart();
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: "line",
        data: {
            datasets: [{
                data: weatherData
            }]
        },
        options: {
            parsing: {
                xAxisKey: 'date_time',
                yAxisKey: Object.keys(weatherData.at(0)).at(1),
                key: Object.keys(weatherData.at(0)).at(1)
            },
            responsive: false,
            plugins: {
                legend: {display: false},
                title: {display: true,
                text: Object.keys(weatherData.at(0)).at(1)
                }
            },
            elements: {
                point:{radius: 0},
                line:{borderColor: 'black'}            
            }
        }
      });
}


fetchSignalList();
fetchLatest50();