
   
      //const apiUrl = 'https://api.jsonbin.io/v3/b/66c4cd17ad19ca34f898a62a';  // Replace with your actual JSONBin API endpoint
      //const apiKey = '$2a$10$pu4SOQyTfm1rYpmQtdSrQ.moj1yCwHA1UxBcSPlSIMOPX/6YO6nCO';  // Replace with your JSONBin API key

      import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
      import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js';

      document.addEventListener('DOMContentLoaded', function() {

        const firebaseConfig = {
            apiKey: "AIzaSyDAJG5zdLDCC19TVfJ8XWmksy9o5w-l3nw",
            authDomain: "reportapp.firebaseapp.com",
            projectId: "reportapp",
            storageBucket: "reportapp.appspot.com",
            messagingSenderId: "1024278014400",
            appId: "1:1024278014400:android:3b3e13c06a80a474020025"
          };

   
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = getMessaging(app);

// Request permission to send notifications
function requestNotificationPermission() {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            getToken(messaging)
                .then((currentToken) => {
                    if (currentToken) {
                        console.log('FCM Token:', currentToken);
                        // You can send this token to your server to subscribe the user to notifications
                    } else {
                        console.log('No registration token available.');
                    }
                })
                .catch((err) => {
                    console.error('Error retrieving token:', err);
                });
        } else {
            console.log('Notification permission denied.');
        }
    });
}

// Call this function when the page loads to request permission
requestNotificationPermission();

// Listen for incoming messages
onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    // Display the notification
    new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon,
    });
});



        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const incidentForm = document.getElementById('incidentForm');
        const incidentList = document.getElementById('incidentList');
        const filterCategory = document.getElementById('filterCategory');
    
        const loginRegisterContainer = document.getElementById('login-register');
        const incidentFormContainer = document.getElementById('incident-form');
        const incidentsContainer = document.getElementById('incidents');
    
        const API_URL = 'https://api.jsonbin.io/v3/b/66c4cd17ad19ca34f898a62a';
        const API_KEY = '$2a$10$pu4SOQyTfm1rYpmQtdSrQ.moj1yCwHA1UxBcSPlSIMOPX/6YO6nCO';
    
        let user = null;
        let incidents = [];
    
        // Check if a user is already logged in
        checkLoginStatus();
    
        // Handle user registration
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const password = document.getElementById('regPassword').value;
            registerUser(username, password);
        });
    
        // Handle user login
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            loginUser(username, password);
        });
    
        // Handle new incident submission
        incidentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('title').value;
            const content = document.getElementById('content').value;
            const category = document.getElementById('category').value;
            const imageFile = document.getElementById('image').files[0];
    
            getGeolocation((latitude, longitude) => {
                if (imageFile) {
                    const reader = new FileReader();
                    reader.onloadend = function() {
                        const base64Image = reader.result;
                        submitIncident(title, content, category, base64Image, latitude, longitude);
                    };
                    reader.readAsDataURL(imageFile);
                } else {
                    submitIncident(title, content, category, null, latitude, longitude);
                }
            });
        });
    
        // Filter incidents by category
        filterCategory.addEventListener('change', function() {
            const selectedCategory = filterCategory.value;
            displayIncidents(selectedCategory);
        });
    
        function checkLoginStatus() {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) {
                user = storedUser;
                showIncidentForm();
                loadIncidents();
            } else {
                showLoginRegisterForm();
            }
        }
    
        function showLoginRegisterForm() {
            loginRegisterContainer.style.display = 'block';
            incidentFormContainer.style.display = 'none';
            incidentsContainer.style.display = 'none';
        }
    
        function showIncidentForm() {
            loginRegisterContainer.style.display = 'none';
            incidentFormContainer.style.display = 'block';
            incidentsContainer.style.display = 'block';
        }
    
        function registerUser(username, password) {
            const userData = { username, password };
            localStorage.setItem('user', JSON.stringify(userData));
            alert('User registered successfully!');
            user = userData;
            showIncidentForm();
            loadIncidents();
        }
    
        function loginUser(username, password) {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser && storedUser.username === username && storedUser.password === password) {
                user = storedUser;
                alert('Login successful!');
                showIncidentForm();
                loadIncidents();
            } else {
                alert('Invalid username or password');
            }
        }
    
        function submitIncident(title, content, category, image, latitude, longitude) {
            const incident = {
                id: new Date().getTime(),
                title,
                content,
                category,
                image,
                user: user.username,
                date: new Date(),
                latitude,
                longitude
            };
            incidents.push(incident);
            saveIncidents();
        }
    
        function loadIncidents() {
            fetch(`${API_URL}/latest`, {
                headers: {
                    'X-Master-Key': API_KEY,
                },
            })
            .then(response => response.json())
            .then(data => {
                incidents = data.record.incidents || [];
                displayIncidents();
            })
            .catch(error => console.error('Error loading incidents:', error));
        }
    
        function saveIncidents() {
            fetch(`${API_URL}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': API_KEY,
                },
                body: JSON.stringify({ incidents }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Incidents saved successfully:', data);
                loadIncidents();
            })
            .catch(error => console.error('Error saving incidents:', error));
        }
    
        function displayIncidents(category = 'all', incidentListArray = incidents) {
            incidentList.innerHTML = '';
            incidentListArray
                .filter(incident => category === 'all' || incident.category === category)
                .forEach(incident => {
                    const incidentElement = document.createElement('div');
                    incidentElement.className = 'incident';
                    incidentElement.innerHTML = `
                        <h3>${incident.title}</h3>
                        <p>${incident.content}</p>
                        <p><strong>Category:</strong> ${incident.category}</p>
                        <p><strong>Submitted by:</strong> ${incident.user}</p>
                        <p><strong>Date:</strong> ${new Date(incident.date).toLocaleString()}</p>
                        <p><strong>Location:</strong> Latitude: ${incident.latitude}, Longitude: ${incident.longitude}</p>
                        ${incident.image ? `<img src="${incident.image}" alt="${incident.title}">` : ''}
                        ${user && user.username === incident.user ? `
                            <button onclick="editIncident(${incident.id})">Edit</button>
                            <button onclick="deleteIncident(${incident.id})">Delete</button>
                        ` : ''}
                    `;
                    incidentList.appendChild(incidentElement);
                });
        }
    
        function getGeolocation(callback) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    callback(latitude, longitude);
                }, () => {
                    alert('Unable to retrieve your location.');
                    callback(null, null);
                });
            } else {
                alert('Geolocation is not supported by this browser.');
                callback(null, null);
            }
        }
    
        window.editIncident = function(id) {
            const incident = incidents.find(incident => incident.id === id);
            if (incident) {
                document.getElementById('title').value = incident.title;
                document.getElementById('content').value = incident.content;
                document.getElementById('category').value = incident.category;
                
                incidents = incidents.filter(incident => incident.id !== id);
                saveIncidents();
            }
        }
    
        window.deleteIncident = function(id) {
            incidents = incidents.filter(incident => incident.id !== id);
            saveIncidents();
        }
    });
    