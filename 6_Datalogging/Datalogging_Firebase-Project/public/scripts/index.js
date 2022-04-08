// convert epochtime to JavaScripte Date object
function epochToJsDate(epochTime){
  return new Date(epochTime);
}

// convert time to human-readable format YYYY/MM/DD HH:MM:SS
function epochToDateTime(epochTime){
  var epochDate = new Date(epochTime);
  var dateTime = epochDate.getFullYear() + "/" +
    ("00" + (epochDate.getMonth() + 1)).slice(-2) + "/" +
    ("00" + epochDate.getDate()).slice(-2) + " " +
    ("00" + epochDate.getHours()).slice(-2) + ":" +
    ("00" + epochDate.getMinutes()).slice(-2) + ":" +
    ("00" + epochDate.getSeconds()).slice(-2);
  return dateTime;
}

// function to plot values on charts
function plotValues(chart, timestamp, value){
  var x = epochToJsDate(timestamp).getTime();
  var y = Number (value);
  if(chart.series[0].data.length > 30) {
    chart.series[0].addPoint([x, y], true, true, true);
  } else {
    chart.series[0].addPoint([x, y], true, false, true);
  }
}

// DOM elements
const logoutNavElement = document.querySelector('#logout-link');
const loginNavElement = document.querySelector('#login-link');
const signedOutMessageElement = document.querySelector('#signedOutMessage');
const dashboardElement = document.querySelector("#dashboardSignedIn");
const userDetailsElement = document.querySelector('#user-details');

//DOM elements for sensor readings
const tempCardElement = document.getElementById('temperature'); 
const humCardElement = document.getElementById('humidity'); 
const presCardElement = document.getElementById('pressure'); 
const lastUpdateElement = document.getElementById('last-update');
const tableContainerElement = document.querySelector('#table-container');

//Buttons
const loadDataButtonElement = document.getElementById('load-data');
const viewDataButtonElement = document.getElementById('view-data-button');
const hideDataButtonElement = document.getElementById('hide-data-button'); 
const deleteDataElement = document.querySelector('#delete-data');


// MANAGE LOGIN/LOGOUT UI
const setupUI = (user) => {
  if (user) {
    //toggle UI elements
    logoutNavElement.style.display = 'block';
    loginNavElement.style.display = 'none';
    signedOutMessageElement.style.display ='none';
    dashboardElement.style.display = 'block';
    userDetailsElement.style.display ='block';
    userDetailsElement.innerHTML = user.email;
    tableContainerElement.style.display = 'none';

    // get user UID to get data from database
    var uid = user.uid;
    console.log(uid);

    // Database paths (with user UID)
    var dbPathBtn1 = 'UsersData/' + uid.toString() + '/outputs/digital/2';
    var dbPathBtn2 = 'UsersData/' + uid.toString() + '/outputs/digital/12';
    var dbPathSlider1 = 'UsersData/' + uid.toString() + '/outputs/pwm/13';
    var dbPathSlider2 = 'UsersData/' + uid.toString() + '/outputs/pwm/14';
    var dbPathInput1 = 'UsersData/' + uid.toString() + '/outputs/message';
    var dbPathReadings = 'UsersData/' + uid.toString() + '/sensor';

    //////// Button 1 - GPIO 2 ////////
    var btn1State = document.getElementById('btn1State');
    var dbBtn1 = firebase.database().ref().child(dbPathBtn1);

    // Button 1 - GPIO 2 - Update state message on web page
    dbBtn1.on('value', snap => {
      if(snap.val()==1) {
        btn1State.innerText = "ON";
      }
      else {
        btn1State.innerText = "OFF";
      }
    });

    // Button 1 - GPIO 2 - Update database upon button click
    const btn1On = document.getElementById('btn1On');
    const btn1Off = document.getElementById('btn1Off');

    btn1On.onclick = () => {
      firebase.database().ref().child(dbPathBtn1).set(1);
    }
    btn1Off.onclick = () => {
      firebase.database().ref().child(dbPathBtn1).set(0);
    }

    ////////  Button 2 - GPIO 12 ////////
    var btn2State = document.getElementById('btn2State');
    var dbBtn2 = firebase.database().ref().child(dbPathBtn2);

    // Button 2 - GPIO 12 - Update state message on web page
    dbBtn2.on('value', snap => {
      if(snap.val()==1) {
          btn2State.innerText = "ON";
      }
      else {
          btn2State.innerText = "OFF";
      }
    });

    // Button 2 - GPIO 12 - Update database upon button click
    const btn2On = document.getElementById('btn2On');
    const btn2Off = document.getElementById('btn2Off');

    btn2On.onclick = () => {
      firebase.database().ref().child(dbPathBtn2).set(1);
    }
    btn2Off.onclick = () => {
      firebase.database().ref().child(dbPathBtn2).set(0);
    }

    ////////  Slider 1 - GPIO 13  ////////
    var sld1Value = document.getElementById('sld1Value');
    var dbSld1 = firebase.database().ref().child(dbPathSlider1);
    const sld1 = document.getElementById('sld1');

    // Slider 1 - GPIO 13 - Update slider text value on web page
    dbSld1.on('value', snap => {
      sld1Value.innerText = snap.val() + " %";
      sld1.value = snap.val();
    });

    // Slider 1 - GPIO 13 - Update database slider value
    sld1.onchange = () => {
      firebase.database().ref().child(dbPathSlider1).set(Number(sld1.value));
    }

    //////// Slider 2 - GPIO 14 ////////
    var sld2Value = document.getElementById('sld2Value');
    var dbSld2 = firebase.database().ref().child(dbPathSlider2);
    const sld2 = document.getElementById('sld2');

    // Slider 2 - GPIO 14 - Update slider text value on web page
    dbSld2.on('value', snap => {
      sld2Value.innerText = snap.val() + " %";
      sld2.value = snap.val();
    });

    // Slider 2 - GPIO 14 - Update database slider value
    sld2.onchange = () => {
      firebase.database().ref().child(dbPathSlider2).set(Number(sld2.value));
    }

    //////// Input 1 - Message ////////
    var dbInput1 = firebase.database().ref().child(dbPathInput1);
    const input1 = document.getElementById('input1');
    const input1Text = document.getElementById('input1Text');
    // Input 1 - Update input text on web page
    dbInput1.on('value', snap => {
      input1Text.innerText = snap.val();
    });
    // Input 1 - Update database input 1 value
    input1.onchange = () => {
      firebase.database().ref().child(dbPathInput1).set(input1.value);
    }

    //////// SENSOR READINGS ////////

    //Reference to the parent node where the readings are saved
    var dbReadingsRef = firebase.database().ref(dbPathReadings);

    // Get the latest readings and display on cards
    dbReadingsRef.limitToLast(1).on('child_added', snapshot =>{
      var jsonData = snapshot.toJSON(); // example: {temperature: 25.02, humidity: 50.20, pressure: 1008.48, timestamp:1641317355}
      //console.log("Cards Display");
      //console.log(jsonData);
      var temperature = jsonData.temperature;
      var humidity = jsonData.humidity;
      var pressure = jsonData.pressure;
      var timestamp = jsonData.timestamp;
      // Update DOM elements
      tempCardElement.innerHTML = temperature;
      humCardElement.innerHTML = humidity;
      presCardElement.innerHTML = pressure;
      lastUpdateElement.innerHTML = epochToDateTime(timestamp);
    });
  
    // Render charts to display data
    chartT = createTemperatureChart();
    chartH = createHumidityChart();
    chartP = createPressureChart();
    //Get the latest 30 readings to display on charts
    dbReadingsRef.orderByKey().limitToLast(30).on('child_added', snapshot =>{
      var jsonData = snapshot.toJSON(); // example: {temperature: 25.02, humidity: 50.20, pressure: 1008.48, timestamp:1641317355}
      //console.log(jsonData);
      // Save values on variables
      var temperature = jsonData.temperature;
      var humidity = jsonData.humidity;
      var pressure = jsonData.pressure;
      var timestamp = jsonData.timestamp;
      // Plot the values on charts
      plotValues(chartT, timestamp, temperature);
      plotValues(chartH, timestamp, humidity);
      plotValues(chartP, timestamp, pressure);
    });

    // Table
    var lastID; //saves the pushID of the last readings displayed on the table
    function createTable(){
      // Append all data to the table
      var firstRun = true;
      dbReadingsRef.orderByKey().limitToLast(50).on('child_added', function(snapshot) {
        if (snapshot.exists()) {
          var jsonData = snapshot.toJSON();
          //console.log(jsonData);
          var temperature = jsonData.temperature;
          var humidity = jsonData.humidity;
          var pressure = jsonData.pressure;
          var timestamp = jsonData.timestamp;
          var content = '';
          content += '<tr>';
          content += '<td>' + epochToDateTime(timestamp) + '</td>';
          content += '<td>' + temperature + '</td>';
          content += '<td>' + humidity + '</td>';
          content += '<td>' + pressure + '</td>';
          content += '</tr>';
          $('#table-body').prepend(content);
          // Save lastID --> corresponds to the first key on the returned snapshot data
          if (firstRun){
            lastID = snapshot.key;
            firstRun=false;
            //console.log(lastID);
          }
        }
      });
    };

    // Button that shows the table
    viewDataButtonElement.addEventListener('click', (e) =>{
      // Toggle DOM elements
      tableContainerElement.style.display = 'block';
      viewDataButtonElement.style.display ='none';
      hideDataButtonElement.style.display ='inline-block';
      loadDataButtonElement.style.display = 'inline-block'
      createTable();
    }); 

    // Append readings to table (after pressing More results... button)
    function appendToTable(){
      var dataList = []; // saves list of readings returned by the snapshot (oldest-->newest)
      var reversedList = []; // the same as previous, but reversed (newest--> oldest)
      console.log("APEND");
      dbReadingsRef.orderByKey().limitToLast(50).endAt(String(lastID)).once('value', function(snapshot) {
        //console.log(snapshot);
        // Convert the snapshot to JSON
        if (snapshot.exists()) {
          var firstRun = true;
          snapshot.forEach(element => {
            // Get the last pushID (it's the first on the snapshot oldest data --> newest data)
            if (firstRun){
              lastID = element.key
              //console.log("last reading");
              //console.log(lastID);
              firstRun = false;
            }
            var jsonData = element.toJSON();
            //console.log(jsonData);
            dataList.push(jsonData); // create a list with all data
            //console.log(dataList);
          });
          reversedList = dataList.reverse(); // reverse the order of the list (newest data --> oldest data)

          var firstTime = true;
          // loop through all elements of the list and append to table (newest elements first)
          reversedList.forEach(element =>{
            if (firstTime){ // ignore first reading (it's already on the table from the previous query)
              firstTime = false;
            }
            else{ //append the new readings to the table
              var temperature = element.temperature;
              var humidity = element.humidity;
              var pressure = element.pressure;
              var timestamp = element.timestamp;
              var content = '';
              content += '<tr>';
              content += '<td>' + epochToDateTime(timestamp) + '</td>';
              content += '<td>' + temperature + '</td>';
              content += '<td>' + humidity + '</td>';
              content += '<td>' + pressure + '</td>';
              content += '</tr>';
              $('#table-body').append(content);
            }
          });
        }
      });
    }
    
    // When you click on the more results... button, call the appendToTable function
    loadDataButtonElement.addEventListener('click', (e) => {
      appendToTable();
    });

    // Hide the table when you click on Hide Data
    hideDataButtonElement.addEventListener('click', (e) => {
      tableContainerElement.style.display = 'none';
      viewDataButtonElement.style.display = 'inline-block';
      hideDataButtonElement.style.display = 'none';
    });

    deleteDataElement.addEventListener('click', (e) => {
      // delete data (readings)
      dbReadingsRef.remove();
      window.location.reload();
    });

  // if user is logged out
  } else{
    // toggle UI elements
    logoutNavElement.style.display = 'none';
    loginNavElement.style.display = 'block';
    signedOutMessageElement.style.display ='block';
    dashboardElement.style.display = 'none';
    userDetailsElement.style.display ='none';
  }
}
